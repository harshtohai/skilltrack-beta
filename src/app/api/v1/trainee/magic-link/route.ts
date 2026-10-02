import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import crypto from "crypto";
import { sendMagicLinkEmail } from "~/lib/email";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const magicLinkSchema = z.object({
  email: z.string().email(),
  channel: z.enum(["EMAIL", "WHATSAPP"]).default("EMAIL"),
});

const RESEND_COOLDOWN_MS = 30 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = magicLinkSchema.parse(body);

    const trainee = await db.trainee.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (!trainee) {
      return NextResponse.json({ success: true });
    }

    // Server-side 30s cooldown so a double-click on "Resend link" cannot
    // mint extra tokens (§7 rate pattern). Unknown emails never reach here.
    const lastToken = await db.traineeLoginToken.findFirst({
      where: { traineeId: trainee.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastToken) {
      const retryAfter = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - lastToken.createdAt.getTime())) /
          1000,
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

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.traineeLoginToken.create({
      data: {
        traineeId: trainee.id,
        tokenHash,
        expiresAt,
      },
    });

    const magicLink = `${process.env.APP_BASE_URL}/auth/trainee/${token}`;

    if (data.channel === "EMAIL" && trainee.email) {
      try {
        await sendMagicLinkEmail(trainee.email, trainee.fullName, magicLink);
      } catch (emailError) {
        // The send failed — say so instead of claiming success. The raw link
        // is never logged here; dev mock mode (no env keys) still logs it.
        console.error("[MAGIC-LINK] Email send failed:", emailError);
        return createErrorResponse(
          "EMAIL_SEND_FAILED",
          "Couldn't send the email. Try again in a moment.",
          502,
        );
      }
    }

    await db.auditEvent.create({
      data: {
        entityType: "trainee_login_token",
        entityId: tokenHash,
        action: "LOGIN_SENT",
        actorType: "SYSTEM",
        metadata: { traineeId: trainee.id, channel: data.channel, email: trainee.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/magic-link error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to send magic link", 500);
  }
}