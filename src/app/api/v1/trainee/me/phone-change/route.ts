import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import {
  createErrorResponse,
  handleZodError,
  normalizePhoneE164,
  routeErrorResponse,
} from "~/app/api/v1/_utils";
import { hashPhone } from "~/lib/phone-encrypt";
import { sendPhoneChangeOtpEmail } from "~/lib/email";
import { maskPhoneE164 } from "~/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Phone change (T6, spec #102) — step 1 of 2. Normalizes the requested
 * number to E.164, refuses duplicates/same-number, then mints a
 * PHONE_CHANGE login token (pendingValue = new E.164, otpHash = 6-digit
 * code, +30 min) and delivers the code to the trainee's CURRENT email.
 *
 * Email, not the new number: losing the phone is the classic reason to
 * change it, so the code must arrive on a channel the account already owns
 * (no Meta template needed either). The email names the new number so the
 * trainee sees what they are approving. With Brevo env unset the send is
 * mock-logged — same precedent as the email-change flow. Step 2 (verify)
 * flips the trainee's phone fields atomically.
 */

const phoneChangeSchema = z.object({
  newPhone: z.string().min(6).max(20),
});

const RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_TTL_MS = 30 * 60 * 1000;

/** Indian mobile after normalizePhoneE164 — anything else is rejected. */
const E164_INDIA = /^\+91\d{10}$/;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const body = (await request.json()) as unknown;
    const data = phoneChangeSchema.parse(body);

    const newPhone = normalizePhoneE164(data.newPhone.trim());
    if (!E164_INDIA.test(newPhone)) {
      return createErrorResponse("INVALID_PHONE", "Enter a valid 10-digit Indian mobile number", 400);
    }

    const trainee = await db.trainee.findUnique({
      where: { id: traineeId },
      select: { fullName: true, email: true, phoneE164: true },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    // The code goes to the account email — without one there is no recovery
    // channel to prove ownership on. Phone-only trainees need the training
    // center to update the number.
    const email = trainee.email;
    if (!email) {
      return createErrorResponse(
        "NO_EMAIL",
        "Your account has no email address. Ask your training center to update your number.",
        409,
      );
    }

    if (newPhone === trainee.phoneE164) {
      return createErrorResponse("SAME_PHONE", "That is already your current number", 400);
    }

    // phoneE164/phoneHash are unique per trainee — refuse before minting an
    // OTP so the "number in use" answer never depends on guessing a code.
    const taken = await db.trainee.findFirst({
      where: {
        OR: [{ phoneE164: newPhone }, { phoneHash: hashPhone(newPhone) }],
        NOT: { id: traineeId },
      },
      select: { id: true },
    });
    if (taken) {
      return createErrorResponse("PHONE_TAKEN", "An account with this phone number already exists", 409);
    }

    // Server-side 30s resend cooldown via the latest PHONE_CHANGE token's
    // createdAt (same pattern as the magic-link route's resend limiter).
    const lastToken = await db.traineeLoginToken.findFirst({
      where: { traineeId, purpose: "PHONE_CHANGE" },
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
    // tokenHash is @unique and non-null on every row; a phone change has no
    // magic link, so the random token is hashed and immediately discarded.
    const tokenHash = crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");

    // Deliver BEFORE persisting the token: a failed send leaves no token
    // row, so the trainee can retry immediately instead of waiting out the
    // 30s cooldown on an orphan.
    try {
      await sendPhoneChangeOtpEmail(email, trainee.fullName, maskPhoneE164(newPhone), otp);
    } catch (emailError) {
      console.error("[PHONE-CHANGE] Email send failed:", emailError);
      return createErrorResponse(
        "EMAIL_SEND_FAILED",
        "Couldn't send the code. Try again in a moment.",
        502,
      );
    }

    await db.traineeLoginToken.create({
      data: {
        traineeId,
        tokenHash,
        otpHash,
        purpose: "PHONE_CHANGE",
        pendingValue: newPhone,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    // Generic success — the OTP never appears in the API response.
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/me/phone-change error:", error);
    return routeErrorResponse("Failed to start phone change", error);
  }
}
