import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "../../../../_utils";

const triggerSchema = z.object({
  checkpointDays: z.number().int().positive().default(30),
  traineeIds: z.array(z.string().uuid()).optional(), // If not provided, trigger for all in cohort
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const data = triggerSchema.parse(body);

    const cohort = await db.cohort.findUnique({
      where: { id },
      include: { enrolments: { select: { traineeId: true } } },
    });

    if (!cohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }

    const targetTraineeIds = data.traineeIds ?? cohort.enrolments.map((e) => e.traineeId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const results = await db.$transaction(async (tx) => {
      const created = [];

      for (const traineeId of targetTraineeIds) {
        // Check if follow-up already exists
        const existing = await tx.followupEvent.findFirst({
          where: { traineeId, cohortId: id, checkpointDays: data.checkpointDays },
        });

        if (existing && existing.status !== "EXPIRED" && existing.status !== "FAILED") {
          continue;
        }

        const followup = await tx.followupEvent.upsert({
          where: {
            id: existing?.id ?? "",
          },
          create: {
            traineeId,
            cohortId: id,
            checkpointDays: data.checkpointDays,
            status: "SENT",
            sentAt: now,
            channel: "WHATSAPP",
          },
          update: {
            status: "SENT",
            sentAt: now,
          },
        });

        const botSession = await tx.botSession.create({
          data: {
            traineeId,
            followupEventId: followup.id,
            state: "AWAITING_STATUS",
            currentQuestion: "status",
            expiresAt,
          },
        });

        // Call bot service to send first message
        const botBaseUrl = process.env.BOT_BASE_URL;
        const botMode = process.env.BOT_MODE ?? "mock";

        if (botBaseUrl && botMode === "real") {
          try {
            const trainee = await tx.trainee.findUnique({ where: { id: traineeId } });
            if (trainee) {
              await fetch(`${botBaseUrl}/send`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-API-Key": process.env.INTERNAL_API_KEY ?? "",
                },
                body: JSON.stringify({
                  message_id: crypto.randomUUID(),
                  to_phone_e164: trainee.phoneE164,
                  text: "What is your current work status? Reply 1-5:\n1. Employed\n2. Self-employed\n3. Apprentice\n4. Looking for work\n5. Not working",
                  options: [
                    { label: "1. Employed", value: "1" },
                    { label: "2. Self-employed", value: "2" },
                    { label: "3. Apprentice", value: "3" },
                    { label: "4. Looking", value: "4" },
                    { label: "5. Not working", value: "5" },
                  ],
                  language: "EN",
                }),
              });
            }
          } catch (botError) {
            console.error("Bot service error:", botError);
            // Don't fail the trigger if bot fails
          }
        }

        created.push({ followupId: followup.id, botSessionId: botSession.id, traineeId });
      }

      return created;
    });

    return NextResponse.json({ triggered: results.length, followups: results });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/cohorts/[id]/followups/trigger error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to trigger follow-ups", 500);
  }
}