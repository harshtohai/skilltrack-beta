import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const emailOutboundSchema = z.object({
  message_id: z.string().uuid(),
  to_email: z.string().email(),
  subject: z.string(),
  text: z.string(),
  html: z.string().optional(),
  trainee_id: z.string().uuid().optional(),
  followup_event_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const body = await request.json();
    const data = emailOutboundSchema.parse(body);

    // In a real implementation, you would send the email via an email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log it and return a mock success response
    console.log(`[EMAIL OUTBOUND] To: ${data.to_email}, Subject: ${data.subject}`);

    // Log the outbound email
    await dbDirect.auditEvent.create({
      data: {
        entityType: "email_outbound",
        entityId: data.message_id,
        action: "SENT",
        actorType: "SYSTEM",
        metadata: {
          toEmail: data.to_email,
          subject: data.subject,
          text: data.text,
          traineeId: data.trainee_id,
          followupEventId: data.followup_event_id,
        },
      },
    });

    // Generate a mock provider message ID
    const providerMessageId = `email_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return NextResponse.json({
      status: "queued",
      provider_message_id: providerMessageId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/email/outbound error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to queue outbound email", 500);
  }
}