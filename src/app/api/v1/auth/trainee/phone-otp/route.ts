import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "~/server/db";
import {
  createErrorResponse,
  handleZodError,
  normalizePhoneE164,
  routeErrorResponse,
} from "~/app/api/v1/_utils";
import { hashPhone } from "~/lib/phone-encrypt";
import { sendKapsoMessage } from "~/lib/bot/kapso";

export const dynamic = "force-dynamic";

/**
 * WhatsApp OTP login (T7, spec #102) — step 1 of 2. Normalizes the submitted
 * number to E.164, then — enumeration-safe, with the magic-link route's guard
 * structure — always answers generic success regardless of whether the phone
 * is registered. Only a REGISTERED, consent-given phone gets a LOGIN token
 * (pendingValue = E.164, otpHash = 6-digit code, +30 min) delivered over
 * WhatsApp. BOT_MODE=mock (dev default) logs the OTP to the server console —
 * same mock precedent as the phone-change route. Step 2 (verify) mints the
 * session exactly like the email verify route.
 */

const phoneOtpSchema = z.object({
  phone: z.string().min(6).max(20),
});

const RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_TTL_MS = 30 * 60 * 1000;

/** Indian mobile after normalizePhoneE164 — anything else is rejected. */
const E164_INDIA = /^\+91\d{10}$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = phoneOtpSchema.parse(body);

    const phone = normalizePhoneE164(data.phone.trim());
    if (!E164_INDIA.test(phone)) {
      // Format errors are registration-independent (the expected format is
      // public knowledge), so answering them distinctly is enumeration-safe —
      // same reasoning as the magic-link route's email Zod validation.
      return createErrorResponse(
        "INVALID_PHONE",
        "Enter a valid 10-digit Indian mobile number",
        400,
      );
    }

    // Existing lookup idiom (phone-change verify): either column may carry
    // the number depending on when the row was written.
    const trainee = await db.trainee.findFirst({
      where: {
        OR: [{ phoneE164: phone }, { phoneHash: hashPhone(phone) }],
      },
      select: { id: true, consentGiven: true },
    });

    // Enumeration guard (magic-link structure): unknown phones get the
    // identical generic success and nothing else happens.
    if (!trainee) {
      return NextResponse.json({ success: true });
    }

    // Unverified enrollment is verified through the enrollment email — do
    // NOT mint a login token yet. Same accepted trade-off as the email flow:
    // this reveals only that an unverified enrollment exists; unknown phones
    // stay fully silent above.
    if (!trainee.consentGiven) {
      return NextResponse.json({ success: true, needsVerification: true });
    }

    // Server-side 30s resend cooldown via the latest LOGIN token minted for
    // this phone (same pattern as the magic-link route's resend limiter;
    // email-flow LOGIN tokens carry no pendingValue, so they never match).
    const lastToken = await db.traineeLoginToken.findFirst({
      where: { purpose: "LOGIN", pendingValue: phone },
      orderBy: { createdAt: "desc" },
    });
    if (lastToken) {
      const retryAfter = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - lastToken.createdAt.getTime())) / 1000,
      );
      if (retryAfter > 0) {
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: `Too many requests. Try again in ${retryAfter}s.`,
              retryAfter,
            },
          },
          { status: 429 },
        );
      }
    }

    const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    // tokenHash is @unique and non-null on every row; a WhatsApp login has no
    // magic link, so the random token is hashed and immediately discarded
    // (same move as the phone-change route).
    const tokenHash = crypto
      .createHash("sha256")
      .update(crypto.randomBytes(32))
      .digest("hex");

    // Deliver BEFORE persisting the token: a failed Kapso send leaves no
    // token row, so the trainee can retry immediately instead of waiting out
    // the 30s cooldown on an orphan. (The 502 only fires for registered
    // phones — the same send-failure trade-off the email flow accepts with
    // EMAIL_SEND_FAILED.)
    if ((process.env.BOT_MODE ?? "mock") === "real") {
      const send = await sendKapsoMessage({
        toPhoneE164: phone,
        text: `Your SkillsTrack verification code is ${otp}. It expires in 30 minutes. Never share this code.`,
      });
      if (!send[0]?.success) {
        console.error("[LOGIN-OTP] WhatsApp send failed:", send[0]?.error);
        return createErrorResponse(
          "WHATSAPP_SEND_FAILED",
          "Couldn't send the code. Try again in a moment.",
          502,
        );
      }
    } else {
      // Mock mode (dev default): log the OTP instead of sending it.
      console.log(`[LOGIN-OTP] OTP for ${phone}: ${otp}`);
    }

    await db.traineeLoginToken.create({
      data: {
        traineeId: trainee.id,
        tokenHash,
        otpHash,
        purpose: "LOGIN",
        pendingValue: phone,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await db.auditEvent.create({
      data: {
        entityType: "trainee_login_token",
        entityId: tokenHash,
        action: "LOGIN_SENT",
        actorType: "SYSTEM",
        metadata: { traineeId: trainee.id, channel: "WHATSAPP", phone },
      },
    });

    // Generic success — the OTP never appears in the API response.
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/auth/trainee/phone-otp error:", error);
    return routeErrorResponse("Failed to send the login code", error);
  }
}
