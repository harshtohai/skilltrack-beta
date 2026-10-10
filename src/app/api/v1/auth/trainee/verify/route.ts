import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { encode } from "next-auth/jwt";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { startConversation } from "~/lib/bot/conversation";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/* Accept either the magic-link token or { email, otp } from the enrollment
 * email. The OTP path is the type-it-yourself alternative to the link. */
const verifySchema = z.union([
  z.object({ token: z.string().min(32).max(64) }),
  z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/) }),
]);

/**
 * Failed-OTP-attempt limiter (§7 rate pattern): 5 tries per email per 15
 * minutes, cleared on success. Instance-local by design (no schema or env
 * changes) and enough to stop 6-digit brute force. All OTP failures share
 * one generic message so they never reveal whether a code exists.
 */
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000;
const otpAttempts = new Map<string, { count: number; windowStart: number }>();

/** Full trainee include — shared by both lookups so responses match exactly. */
const traineeInclude = {
  trainee: {
    include: {
      certificates: { orderBy: { issueDate: "desc" as const } },
      employmentHistory: { orderBy: { startDate: "desc" as const } },
      outcomeEvents: {
        orderBy: { createdAt: "desc" as const },
        include: { employmentClaim: true },
      },
      followupEvents: { orderBy: { checkpointDays: "asc" as const } },
    },
  },
};

function findLoginTokenByTokenHash(tokenHash: string) {
  return db.traineeLoginToken.findUnique({
    where: { tokenHash },
    include: traineeInclude,
  });
}

function findLoginTokenByOtp(otpHash: string, email: string, now: Date) {
  return db.traineeLoginToken.findFirst({
    where: {
      otpHash,
      usedAt: null,
      expiresAt: { gte: now },
      trainee: { email },
    },
    orderBy: { createdAt: "desc" },
    include: traineeInclude,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = verifySchema.parse(body);

    const now = new Date();
    let loginToken: Awaited<ReturnType<typeof findLoginTokenByTokenHash>>;

    if ("token" in data) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(data.token)
        .digest("hex");

      loginToken = await findLoginTokenByTokenHash(tokenHash);

      if (!loginToken) {
        return createErrorResponse("INVALID_TOKEN", "Invalid or expired magic link", 401);
      }

      if (loginToken.usedAt) {
        return createErrorResponse("TOKEN_USED", "This magic link has already been used", 401);
      }

      if (loginToken.expiresAt < now) {
        return createErrorResponse("TOKEN_EXPIRED", "This magic link has expired", 401);
      }
    } else {
      // OTP path: verify the 6-digit code against the same token row, bound
      // to the submitted email.
      const email = data.email.toLowerCase();

      const attempt = otpAttempts.get(email);
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

      const otpHash = crypto.createHash("sha256").update(data.otp).digest("hex");
      loginToken = await findLoginTokenByOtp(otpHash, email, now);

      if (!loginToken) {
        // One generic failure — never reveals whether the code exists (§7).
        otpAttempts.set(
          email,
          attempt && Date.now() - attempt.windowStart < OTP_WINDOW_MS
            ? { count: attempt.count + 1, windowStart: attempt.windowStart }
            : { count: 1, windowStart: Date.now() },
        );
        return createErrorResponse("INVALID_OTP", "That code is invalid or has expired", 401);
      }

      otpAttempts.delete(email);
    }

    await db.traineeLoginToken.update({
      where: { id: loginToken.id },
      data: { usedAt: now },
    });

    const trainee = loginToken.trainee;

    // A verified login completes enrollment: record consent unless it was
    // already given (applies to both the link and the OTP path).
    if (!trainee.consentGiven) {
      await db.trainee.update({
        where: { id: trainee.id },
        data: { consentGiven: true, consentGivenAt: now, consentMethod: "EMAIL" },
      });
    }

    await db.auditEvent.create({
      data: {
        entityType: "trainee_login_token",
        entityId: loginToken.id,
        action: "LOGIN_USED",
        actorType: "TRAINEE",
        actorId: loginToken.traineeId,
        metadata: { traineeId: loginToken.traineeId },
      },
    });

    // Mint a NextAuth (Auth.js v5) session so /auth/trainee/* pages are
    // protected by the middleware with role "trainee".
    // Vercel production is always HTTPS, so mirror NextAuth's useSecureCookies
    // directly instead of depending on an APP_BASE_URL env being set correctly.
    const secure = process.env.NODE_ENV === "production";
    const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
    const sessionJwt = await encode({
      secret: process.env.AUTH_SECRET ?? "",
      salt: cookieName,
      maxAge: 60 * 60 * 24 * 30,
      token: {
        sub: trainee.id,
        email: trainee.email,
        name: trainee.fullName,
        role: "trainee",
      },
    });

    // Trainee logged in — kick off the WhatsApp welcome + consent flow.
    // Fire-and-forget: never block or fail the login because of the bot.
    void startConversation(trainee.phoneE164, trainee.fullName).catch((err) =>
      console.error("[BOT] Post-login trigger failed:", err)
    );

    const response = NextResponse.json({
      trainee: {
        id: trainee.id,
        publicId: trainee.publicId,
        fullName: trainee.fullName,
        phoneE164: trainee.phoneE164,
        email: trainee.email,
        district: trainee.district,
        language: trainee.language,
        // Verification completes enrollment consent — the trainee above is a
        // pre-update snapshot, so reflect the just-written values.
        consentGiven: true,
        consentGivenAt: (trainee.consentGivenAt ?? now).toISOString(),
        consentMethod: trainee.consentMethod ?? "EMAIL",
        certificates: trainee.certificates.map((c) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate.toISOString(),
          expiryDate: c.expiryDate?.toISOString() ?? null,
          fileUrl: c.fileUrl,
        })),
        employmentHistory: trainee.employmentHistory.map((e) => ({
          id: e.id,
          employer: e.employer,
          role: e.role,
          salaryBand: e.salaryBand,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate?.toISOString() ?? null,
          isCurrent: e.isCurrent,
        })),
        outcomeEvents: trainee.outcomeEvents.map((o) => ({
          id: o.id,
          checkpointDays: o.checkpointDays,
          outcomeStatus: o.outcomeStatus,
          verificationStatus: o.verificationStatus,
          source: o.source,
          evidenceLevel: o.evidenceLevel,
          createdAt: o.createdAt.toISOString(),
          employmentClaim: o.employmentClaim
            ? {
                employerName: o.employmentClaim.employerName,
                role: o.employmentClaim.role,
                salaryBand: o.employmentClaim.salaryBand,
              }
            : null,
        })),
        followupEvents: trainee.followupEvents.map((f) => ({
          id: f.id,
          checkpointDays: f.checkpointDays,
          status: f.status,
          channel: f.channel,
          sentAt: f.sentAt?.toISOString() ?? null,
          respondedAt: f.respondedAt?.toISOString() ?? null,
        })),
      },
    });

    response.cookies.set(cookieName, sessionJwt, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: Boolean(secure),
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/auth/trainee/verify error:", error);
    return routeErrorResponse("Failed to verify token", error);
  }
}
