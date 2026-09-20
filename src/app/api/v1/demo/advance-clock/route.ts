import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";

const advanceClockSchema = z.object({
  days: z.number().int().positive().default(1),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const body = await request.json();
    const { days } = advanceClockSchema.parse(body);

    // This is a demo-only endpoint to simulate time passing
    // In production, this would be a cron job
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Find follow-up events that are SENT but not responded to, and are older than 24 hours
    const expiredFollowups = await db.followupEvent.findMany({
      where: {
        status: "SENT",
        sentAt: { lte: cutoffDate },
      },
      include: {
        trainee: true,
        botSessions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    let expiredCount = 0;
    for (const fu of expiredFollowups) {
      // Update followup event to EXPIRED
      await db.followupEvent.update({
        where: { id: fu.id },
        data: { status: "EXPIRED" },
      });

      // Create outcome event with UNKNOWN status
      await db.outcomeEvent.create({
        data: {
          traineeId: fu.traineeId,
          checkpointDays: fu.checkpointDays,
          outcomeStatus: "UNKNOWN",
          verificationStatus: "UNKNOWN",
          source: "SYSTEM",
          evidenceLevel: 0,
        },
      });

      // Update bot session to DONE if exists
      if (fu.botSessions[0]) {
        await db.botSession.update({
          where: { id: fu.botSessions[0].id },
          data: { state: "DONE", expiresAt: new Date() },
        });
      }

      // Log audit event
      await db.auditEvent.create({
        data: {
          entityType: "followup_event",
          entityId: fu.id,
          action: "EXPIRED_NO_RESPONSE",
          actorType: "SYSTEM",
          metadata: { daysSinceSent: days, traineeId: fu.traineeId },
        },
      });

      expiredCount++;
    }

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Advanced clock by ${days} day(s). ${expiredCount} follow-up(s) expired.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/demo/advance-clock error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to advance demo clock", 500);
  }
}