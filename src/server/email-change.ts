import crypto from "crypto";
import { db } from "~/server/db";
import { sendEmailChangeOtpEmail } from "~/lib/email";
import { EmailSendError } from "~/server/magic-link";

/**
 * Mints an EMAIL_CHANGE trainee login token (pendingValue = the new email,
 * +30 min expiry) with a 6-digit OTP and sends the code to the NEW address.
 * Mirrors mintAndSendLoginToken (~/server/magic-link.ts): same OTP hashing,
 * single-use/expiry semantics and EmailSendError tagging — the token itself
 * is never linked, only its OTP verifies. Send failures propagate as
 * EmailSendError; DB errors propagate raw.
 */
export async function mintAndSendEmailChangeOtp(
  trainee: { id: string; fullName: string },
  newEmail: string,
): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await db.traineeLoginToken.create({
    data: {
      traineeId: trainee.id,
      tokenHash,
      otpHash,
      purpose: "EMAIL_CHANGE",
      pendingValue: newEmail,
      expiresAt,
    },
  });

  try {
    await sendEmailChangeOtpEmail(newEmail, trainee.fullName, otp);
  } catch (emailError) {
    console.error("[EMAIL-CHANGE] OTP send failed:", emailError);
    throw new EmailSendError("Email delivery failed");
  }

  await db.auditEvent.create({
    data: {
      entityType: "trainee_login_token",
      entityId: tokenHash,
      action: "EMAIL_CHANGE_OTP_SENT",
      actorType: "TRAINEE",
      actorId: trainee.id,
      metadata: { traineeId: trainee.id, newEmail },
    },
  });
}
