import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, routeErrorResponse } from "~/app/api/v1/_utils";
import { encryptPhone, hashPhone } from "~/lib/phone-encrypt";
import { maskPhoneE164 } from "~/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Phone change (T6, spec #102) — step 2 of 2. Verifies the 6-digit code
 * against the latest unused PHONE_CHANGE token, then in one transaction
 * re-checks uniqueness, flips the trainee's phoneE164/phoneEncrypted/
 * phoneHash from pendingValue, burns the token and writes a PHONE_CHANGED
 * audit event. The session JWT only carries the trainee id/role, so the
 * session survives the change untouched.
 */

const verifySchema = z.object({ otp: z.string().regex(/^\d{6}$/) });

/** Failed-OTP limiter (§7 rate pattern): 5 tries per trainee per 15 min. */
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000;
const otpAttempts = new Map<string, { count: number; windowStart: number }>();

/** Thrown inside the transaction when the number was claimed meanwhile. */
class PhoneTakenError extends Error {}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const body = (await request.json()) as unknown;
    const { otp } = verifySchema.parse(body);

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

    const now = new Date();
    const token = await db.traineeLoginToken.findFirst({
      where: { traineeId, purpose: "PHONE_CHANGE", usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!token?.pendingValue) {
      // Generic — never reveals whether a code exists (§7).
      return createErrorResponse("INVALID_OTP", "That code is invalid or has expired", 400);
    }
    if (token.expiresAt < now) {
      return createErrorResponse("TOKEN_EXPIRED", "This code has expired — request a new one", 410);
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== token.otpHash) {
      otpAttempts.set(
        traineeId,
        attempt && Date.now() - attempt.windowStart < OTP_WINDOW_MS
          ? { count: attempt.count + 1, windowStart: attempt.windowStart }
          : { count: 1, windowStart: Date.now() },
      );
      return createErrorResponse("INVALID_OTP", "That code is invalid or has expired", 400);
    }

    const trainee = await db.trainee.findUnique({
      where: { id: traineeId },
      select: { phoneE164: true },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    const newPhone = token.pendingValue;
    const previousPhoneMasked = maskPhoneE164(trainee.phoneE164);

    await db.$transaction(async (tx) => {
      // Re-check uniqueness inside the transaction — another trainee may
      // have claimed the number between the OTP send and this verification.
      const taken = await tx.trainee.findFirst({
        where: {
          OR: [{ phoneE164: newPhone }, { phoneHash: hashPhone(newPhone) }],
          NOT: { id: traineeId },
        },
        select: { id: true },
      });
      if (taken) throw new PhoneTakenError();

      await tx.trainee.update({
        where: { id: traineeId },
        data: {
          phoneE164: newPhone,
          phoneEncrypted: encryptPhone(newPhone),
          phoneHash: hashPhone(newPhone),
        },
      });

      await tx.traineeLoginToken.update({
        where: { id: token.id },
        data: { usedAt: now },
      });

      await tx.auditEvent.create({
        data: {
          entityType: "trainee",
          entityId: traineeId,
          action: "PHONE_CHANGED",
          actorType: "TRAINEE",
          actorId: traineeId,
          metadata: { previousPhoneMasked, newPhoneMasked: maskPhoneE164(newPhone) },
        },
      });
    });

    otpAttempts.delete(traineeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PhoneTakenError) {
      return createErrorResponse("PHONE_TAKEN", "An account with this phone number already exists", 409);
    }
    if (error instanceof z.ZodError) return handleZodError(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Lost the unique race on phoneE164/phoneEncrypted/phoneHash.
      return createErrorResponse("PHONE_TAKEN", "An account with this phone number already exists", 409);
    }
    console.error("POST /api/v1/trainee/me/phone-change/verify error:", error);
    return routeErrorResponse("Failed to verify phone change", error);
  }
}
