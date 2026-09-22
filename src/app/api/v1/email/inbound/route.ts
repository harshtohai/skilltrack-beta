import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError, validateInternalApiKey, normalizePhoneE164 } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const emailInboundSchema = z.object({
  provider: z.string().default("email"),
  provider_message_id: z.string(),
  from_email: z.string().email(),
  to_email: z.string().email(),
  subject: z.string(),
  text: z.string(),
  html: z.string().optional(),
  received_at: z.string().datetime(),
  trainee_phone_e164: z.string().optional(), // For linking to trainee if available
});

export async function POST(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const body = await request.json();
    const data = emailInboundSchema.parse(body);

    // Idempotency check
    const existingInbound = await dbDirect.auditEvent.findFirst({
      where: {
        entityType: "email_inbound",
        entityId: data.provider_message_id,
        action: "RECEIVED",
      },
    });
    if (existingInbound) {
      return NextResponse.json({ matched: true, duplicate: true });
    }

    // Try to find trainee by phone (if provided) or by email
    let trainee: { id: string; phoneE164: string; email: string | null; fullName: string; consentGiven: boolean } | null = null;
    if (data.trainee_phone_e164) {
      const phoneE164 = normalizePhoneE164(data.trainee_phone_e164);
      trainee = await dbDirect.trainee.findUnique({ where: { phoneE164 } });
    }
    if (!trainee && data.from_email) {
      trainee = await dbDirect.trainee.findFirst({ where: { email: data.from_email.toLowerCase() } });
    }

    if (!trainee) {
      await dbDirect.auditEvent.create({
        data: {
          entityType: "email_inbound",
          entityId: data.provider_message_id,
          action: "RECEIVED_UNMATCHED",
          actorType: "SYSTEM",
          metadata: { fromEmail: data.from_email, subject: data.subject },
        },
      });
      return NextResponse.json({ matched: false });
    }

    // Find active follow-up event
    const followupEvent = await dbDirect.followupEvent.findFirst({
      where: {
        traineeId: trainee.id,
        checkpointDays: { in: [30, 90] },
        status: { in: ["SENT", "SCHEDULED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!followupEvent) {
      await dbDirect.auditEvent.create({
        data: {
          entityType: "email_inbound",
          entityId: data.provider_message_id,
          action: "RECEIVED_NO_FOLLOWUP",
          actorType: "SYSTEM",
          metadata: { traineeId: trainee.id, fromEmail: data.from_email },
        },
      });
      return NextResponse.json({ matched: false });
    }

    // Log the inbound email
    await dbDirect.auditEvent.create({
      data: {
        entityType: "email_inbound",
        entityId: data.provider_message_id,
        action: "RECEIVED",
        actorType: "TRAINEE",
        actorId: trainee.id,
        metadata: {
          fromEmail: data.from_email,
          subject: data.subject,
          text: data.text,
          followupEventId: followupEvent.id,
        },
      },
    });

    // For email, we can't easily do interactive state machine like WhatsApp
    // So we'll parse the response and create a simple claim if possible
    // In a real implementation, you'd want a more sophisticated email parser

    return NextResponse.json({
      matched: true,
      traineeId: trainee.id,
      message: "Email received and logged. Manual processing may be required for email channel.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/email/inbound error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to process inbound email", 500);
  }
}