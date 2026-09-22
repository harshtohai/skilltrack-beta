import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import crypto from "crypto";
import { sendMagicLinkEmail } from "~/lib/email";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const magicLinkSchema = z.object({
  email: z.string().email(),
  channel: z.enum(["EMAIL", "WHATSAPP"]).default("EMAIL"),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = magicLinkSchema.parse(body);

    const trainee = await dbDirect.trainee.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (!trainee) {
      return NextResponse.json({ success: true });
    }

    if (!trainee.consentGiven) {
      return createErrorResponse("CONSENT_REQUIRED", "Consent not given. Please contact your training institute.", 403);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await dbDirect.traineeLoginToken.create({
      data: {
        traineeId: trainee.id,
        tokenHash,
        expiresAt,
      },
    });

    const magicLink = `${process.env.APP_BASE_URL}/auth/trainee/${token}`;

    if (data.channel === "EMAIL" && trainee.email) {
      await sendMagicLinkEmail(trainee.email, trainee.fullName, magicLink);
    }

    await dbDirect.auditEvent.create({
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