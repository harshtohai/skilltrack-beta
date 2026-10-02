import crypto from "crypto";
import { db } from "~/server/db";
import { sendMagicLinkEmail } from "~/lib/email";

/** Send failure tagged so callers can surface it distinctly from DB errors. */
export class EmailSendError extends Error {}

/**
 * Mints a single-use trainee login token (+30 min expiry) and sends the
 * magic-link email for the EMAIL channel. Shared by the login route (after
 * its rate-limit check) and signup (first send). Send failures propagate as
 * EmailSendError; DB errors propagate raw.
 */
export async function mintAndSendLoginToken(
  trainee: { id: string; email: string | null; fullName: string },
  channel: "EMAIL" | "WHATSAPP",
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await db.traineeLoginToken.create({
    data: { traineeId: trainee.id, tokenHash, expiresAt },
  });

  const magicLink = `${process.env.APP_BASE_URL}/auth/trainee/${token}`;

  if (channel === "EMAIL" && trainee.email) {
    try {
      await sendMagicLinkEmail(trainee.email, trainee.fullName, magicLink);
    } catch (emailError) {
      console.error("[MAGIC-LINK] Email send failed:", emailError);
      throw new EmailSendError("Email delivery failed");
    }
  }

  await db.auditEvent.create({
    data: {
      entityType: "trainee_login_token",
      entityId: tokenHash,
      action: "LOGIN_SENT",
      actorType: "SYSTEM",
      metadata: { traineeId: trainee.id, channel, email: trainee.email },
    },
  });

  return magicLink;
}
