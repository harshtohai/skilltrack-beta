import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { encode } from "next-auth/jwt";
import { db } from "~/server/db";
import {
  createErrorResponse,
  handleZodError,
  normalizePhoneE164,
  routeErrorResponse,
} from "~/app/api/v1/_utils";
import { hashPhone } from "~/lib/phone-encrypt";
import { startConversation } from "~/lib/bot/conversation";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * WhatsApp OTP login (T7, spec #102) — step 2 of 2. Verifies the 6-digit
 * code against an unused LOGIN token minted for this phone, then mints the
 * session and fires the post-login side effects EXACTLY like the email
 * verify route (POST /api/v1/auth/trainee/verify) so the client flow is
 * identical: same JWT claims/cookie, same consent flip, same LOGIN_USED
 * audit event, same bot conversation trigger, same response shape.
 * Enumeration-safe: an unknown phone and a wrong code share one generic
 * 400 INVALID_OTP.
 */

const verifySchema = z.object({
  phone: z.string().min(6).max(20),
  otp: z.string().regex(/^\d{6}$/),
});

/**
 * Failed-OTP-attempt limiter (§7 rate pattern): 5 tries per phone per 15
 * minutes, cleared on success — the email verify route's limiter keyed by
 * phone instead of email. Instance-local by design (no schema or env
 * changes) and enough to stop 6-digit brute force.
 */
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000;
const otpAttempts = new Map<string, { count: number; windowStart: number }>();

/** Full trainee include — same relations as the email verify route's token
 * include, expressed at the trainee level (this route looks the trainee up
 * first, so the token query needs no include). */
const traineeInclude = {
  certificates: { orderBy: { issueDate: "desc" as const } },
  employmentHistory: { orderBy: { startDate: "desc" as const } },
  outcomeEvents: {
    orderBy: { createdAt: "desc" as const },
    include: { employmentClaim: true },
  },
  followupEvents: { orderBy: { checkpointDays: "asc" as const } },
};

function countFailedAttempt(phone: string) {
  const attempt = otpAttempts.get(phone);
  otpAttempts.set(
    phone,
    attempt && Date.now() - attempt.windowStart < OTP_WINDOW_MS
      ? { count: attempt.count + 1, windowStart: attempt.windowStart }
      : { count: 1, windowStart: Date.now() },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = verifySchema.parse(body);

    const phone = normalizePhoneE164(data.phone.trim());
    // A malformed number can never belong to a registered trainee, so it
    // gets the same generic failure as a wrong code (§7 enumeration safety)
    // rather than the send route's distinct format error.
    if (!/^\+91\d{10}$/.test(phone)) {
      return createErrorResponse("INVALID_OTP", "That code is invalid or has expired", 400);
    }

    const now = new Date();

    // Limiter check first — same order as the email verify route.
    const attempt = otpAttempts.get(phone);
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

    // Trainee lookup idiom (phone-change verify): either column may carry
    // the number depending on when the row was written.
    const trainee = await db.trainee.findFirst({
      where: {
        OR: [{ phoneE164: phone }, { phoneHash: hashPhone(phone) }],
      },
      include: traineeInclude,
    });

    const otpHash = crypto.createHash("sha256").update(data.otp).digest("hex");

    const loginToken = trainee
      ? await db.traineeLoginToken.findFirst({
          where: {
            traineeId: trainee.id,
            purpose: "LOGIN",
            pendingValue: phone,
            otpHash,
            usedAt: null,
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (!trainee || !loginToken) {
      // One generic failure — never reveals whether the phone exists (§7).
      countFailedAttempt(phone);
      return createErrorResponse("INVALID_OTP", "That code is invalid or has expired", 400);
    }

    if (loginToken.expiresAt < now) {
      // The hash matched, so this leaks nothing — the code is dead either
      // way and the only move is a resend, so it costs no attempt
      // (mirrors the phone-change verify route's 410).
      return createErrorResponse("TOKEN_EXPIRED", "This code has expired — request a new one", 410);
    }

    otpAttempts.delete(phone);

    await db.traineeLoginToken.update({
      where: { id: loginToken.id },
      data: { usedAt: now },
    });

    const verified = trainee;

    // A verified login completes enrollment: record consent unless it was
    // already given — the email verify route's flip, with WHATSAPP as the
    // method since the code arrived over WhatsApp.
    if (!verified.consentGiven) {
      await db.trainee.update({
        where: { id: verified.id },
        data: { consentGiven: true, consentGivenAt: now, consentMethod: "WHATSAPP" },
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

    // Session mint — copied verbatim from the email verify route (same
    // claims, cookie name and 30-day maxAge) so middleware sees the same
    // session regardless of channel.
    // Vercel production is always HTTPS, so mirror NextAuth's useSecureCookies
    // directly instead of depending on an APP_BASE_URL env being set correctly.
    const secure = process.env.NODE_ENV === "production";
    const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
    const sessionJwt = await encode({
      secret: process.env.AUTH_SECRET ?? "",
      salt: cookieName,
      maxAge: 60 * 60 * 24 * 30,
      token: {
        sub: verified.id,
        email: verified.email, // null for phone-only trainees — session callback tolerates it
        name: verified.fullName,
        role: "trainee",
      },
    });

    // Trainee logged in — kick off the WhatsApp welcome + consent flow.
    // Fire-and-forget: never block or fail the login because of the bot.
    void startConversation(verified.phoneE164, verified.fullName).catch((err) =>
      console.error("[BOT] Post-login trigger failed:", err)
    );

    const response = NextResponse.json({
      trainee: {
        id: verified.id,
        publicId: verified.publicId,
        fullName: verified.fullName,
        phoneE164: verified.phoneE164,
        email: verified.email,
        district: verified.district,
        language: verified.language,
        // Verification completes enrollment consent — the trainee above is a
        // pre-update snapshot, so reflect the just-written values.
        consentGiven: true,
        consentGivenAt: (verified.consentGivenAt ?? now).toISOString(),
        consentMethod: verified.consentMethod ?? "WHATSAPP",
        certificates: verified.certificates.map((c) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate.toISOString(),
          expiryDate: c.expiryDate?.toISOString() ?? null,
          fileUrl: c.fileUrl,
        })),
        employmentHistory: verified.employmentHistory.map((e) => ({
          id: e.id,
          employer: e.employer,
          role: e.role,
          salaryBand: e.salaryBand,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate?.toISOString() ?? null,
          isCurrent: e.isCurrent,
        })),
        outcomeEvents: verified.outcomeEvents.map((o) => ({
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
        followupEvents: verified.followupEvents.map((f) => ({
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
    console.error("POST /api/v1/auth/trainee/phone-otp/verify error:", error);
    return routeErrorResponse("Failed to verify the login code", error);
  }
}
