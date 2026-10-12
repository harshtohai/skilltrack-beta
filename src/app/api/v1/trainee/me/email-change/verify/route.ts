import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { sendEmailChangedNoticeEmail } from "~/lib/email";

export const dynamic = "force-dynamic";

/* Verify an email change (T5): { otp } checks the trainee's latest unused
 * EMAIL_CHANGE token, then in one transaction re-checks uniqueness, swaps the
 * email, marks the token used and writes the EMAIL_CHANGED audit event. The
 * change notification goes to the OLD address afterwards. Trainee session
 * required. */
const verifySchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

/**
 * Failed-OTP-attempt limiter (§7 rate pattern): 5 tries per trainee per 15
 * minutes, cleared on success. Same instance-local mechanism as the login
 * verify route, keyed by trainee id (the session already identifies them).
 */
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000;
const otpAttempts = new Map<string, { count: number; windowStart: number }>();

/** Tagged so the transaction can surface the uniqueness re-check cleanly. */
class EmailTakenError extends Error {}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const body = (await request.json()) as unknown;
    const { otp } = verifySchema.parse(body);

    const now = new Date();
    const pending = await db.traineeLoginToken.findFirst({
      where: { traineeId, purpose: "EMAIL_CHANGE", usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!pending) {
      // Distinguish "already used" from "never requested" — both 400s, and
      // neither reveals anything about whether the code itself was right.
      const used = await db.traineeLoginToken.findFirst({
        where: { traineeId, purpose: "EMAIL_CHANGE", usedAt: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      return used
        ? createErrorResponse("TOKEN_USED", "This code has already been used. Start a new email change.", 400)
        : createErrorResponse("NO_PENDING_CHANGE", "No email change is pending. Enter a new email first.", 400);
    }

    if (pending.expiresAt < now) {
      return createErrorResponse("OTP_EXPIRED", "This code has expired. Request a new one.", 410);
    }

    const attempt = otpAttempts.get(traineeId);
    if (
      attempt &&
      Date.now() - attempt.windowStart < OTP_WINDOW_MS &&
      attempt.count >= OTP_MAX_ATTEMPTS
    ) {
      const retryAfter = Math.ceil(
        (OTP_WINDOW_MS - (Date.now() - attempt.windowStart)) / 1000,
      );
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: `Too many attempts. Try again in ${retryAfter}s.`,
            retryAfter,
          },
        },
        { status: 429 },
      );
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (pending.otpHash !== otpHash) {
      // One generic failure — never reveals whether a code exists (§7).
      otpAttempts.set(
        traineeId,
        attempt && Date.now() - attempt.windowStart < OTP_WINDOW_MS
          ? { count: attempt.count + 1, windowStart: attempt.windowStart }
          : { count: 1, windowStart: Date.now() },
      );
      return createErrorResponse("INVALID_OTP", "That code is invalid", 401);
    }

    otpAttempts.delete(traineeId);

    const trainee = await db.trainee.findUnique({
      where: { id: traineeId },
      select: { id: true, fullName: true, email: true },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    // pendingValue is set for every EMAIL_CHANGE token; the guard keeps TS
    // strict and covers any pre-migration rows.
    const newEmail = pending.pendingValue;
    if (!newEmail) {
      return createErrorResponse("NO_PENDING_CHANGE", "No email change is pending. Enter a new email first.", 400);
    }

    try {
      await db.$transaction(async (tx) => {
        // Re-check uniqueness inside the transaction — the email may have
        // been taken between the request and this verification.
        const clash = await tx.trainee.findFirst({
          where: { email: { equals: newEmail, mode: "insensitive" }, id: { not: traineeId } },
          select: { id: true },
        });
        if (clash) throw new EmailTakenError();

        await tx.trainee.update({
          where: { id: traineeId },
          data: { email: newEmail },
        });
        await tx.traineeLoginToken.update({
          where: { id: pending.id },
          data: { usedAt: now },
        });
        // Audit precedent stores raw emails (LOGIN_SENT, EMPLOYER_REGISTER).
        await tx.auditEvent.create({
          data: {
            entityType: "trainee",
            entityId: traineeId,
            action: "EMAIL_CHANGED",
            actorType: "TRAINEE",
            actorId: traineeId,
            metadata: { oldEmail: trainee.email, newEmail },
          },
        });
      });
    } catch (txError) {
      if (txError instanceof EmailTakenError) {
        return createErrorResponse("EMAIL_TAKEN", "That email is already in use", 409);
      }
      // Unique-constraint race between the re-check and the update.
      if (txError instanceof Prisma.PrismaClientKnownRequestError && txError.code === "P2002") {
        return createErrorResponse("EMAIL_TAKEN", "That email is already in use", 409);
      }
      throw txError;
    }

    // Security notice to the OLD address, after the commit. A failed notice
    // must not fail the already-completed change (same fire-and-forget
    // posture as the post-login bot trigger).
    if (trainee.email) {
      void sendEmailChangedNoticeEmail(trainee.email, trainee.fullName, newEmail).catch((err) =>
        console.error("[EMAIL-CHANGE] Notice send failed:", err)
      );
    }

    // Session survival (T5 gate): trainee sessions are JWTs with
    // session.strategy = "jwt" (~/lib/auth.config.ts). The session callback
    // maps token.sub → session.user.id and token.role → session.user.role;
    // middleware authorization and every trainee API route resolve the user
    // from session.user.id. Nothing in src reads token.email or
    // session.user.email, so the (now stale) email claim inside the existing
    // JWT is never consulted and the session stays valid across the change —
    // no re-issue needed.
    return NextResponse.json({ success: true, email: newEmail });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/me/email-change/verify error:", error);
    return routeErrorResponse("Failed to verify email change", error);
  }
}
