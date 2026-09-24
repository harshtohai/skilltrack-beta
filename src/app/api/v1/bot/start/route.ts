import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, normalizePhoneE164, validateInternalApiKey } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const startSchema = z.object({
  phone_e164: z.string().min(5),
});

/**
 * Direct-start for the simulator: validates the phone, auto-creates a
 * follow-up from the trainee's enrolment when none is active, and returns
 * the initial bot question so the conversation runs immediately.
 */
export async function POST(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const body = (await request.json()) as unknown;
    const data = startSchema.parse(body);
    const phoneE164 = normalizePhoneE164(data.phone_e164);

    const trainee = await db.trainee.findUnique({ where: { phoneE164 } });
    if (!trainee) {
      return createErrorResponse("TRAINEE_NOT_FOUND", "No trainee found for this phone number", 404);
    }

    let autoCreated = false;

    // Auto-create a follow-up from the trainee's enrolment if none is active
    let followupEvent = await db.followupEvent.findFirst({
      where: {
        traineeId: trainee.id,
        checkpointDays: { in: [30, 90] },
        status: { in: ["SENT", "SCHEDULED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!followupEvent) {
      const enrolment = await db.enrolment.findFirst({
        where: { traineeId: trainee.id },
        orderBy: { certificationDate: "desc" },
        select: { id: true, cohortId: true },
      });
      if (!enrolment) {
        return createErrorResponse("NO_ENROLMENT", "Trainee has no enrolment to create a follow-up from", 400);
      }

      followupEvent = await db.followupEvent.create({
        data: {
          traineeId: trainee.id,
          cohortId: enrolment.cohortId,
          checkpointDays: 30,
          status: "SENT",
          channel: "WHATSAPP",
          sentAt: new Date(),
        },
      });
      autoCreated = true;
    }

    // Initial question: consent first, retention for 90-day, else status
    const lang = trainee.language || "EN";
    let reply: { text: string; options: Array<{ label: string; value: string }> };

    if (!trainee.consentGiven) {
      reply = {
        text:
          lang === "HI"
            ? "नमस्ते! हम आपके रोजगार परिणामों पर फॉलो-अप करना चाहते हैं। क्या आप भाग लेने के लिए सहमति देते हैं? हाँ के लिए 1, नहीं के लिए 2 उत्तर दें।"
            : `Hi ${trainee.fullName}! We'd like to follow up on your employment outcomes. Do you consent to participate? Reply 1 for Yes, 2 for No.`,
        options:
          lang === "HI"
            ? [
                { label: "1. हाँ, मैं सहमत हूँ", value: "CONSENT_GIVEN" },
                { label: "2. नहीं, मैं सहमत नहीं हूँ", value: "CONSENT_DENIED" },
              ]
            : [
                { label: "1. Yes, I consent", value: "CONSENT_GIVEN" },
                { label: "2. No, I don't consent", value: "CONSENT_DENIED" },
              ],
      };
    } else if (followupEvent.checkpointDays === 90) {
      reply = {
        text: lang === "HI" ? "क्या आप अभी भी उसी नियोक्ता के साथ हैं? 1-3 से उत्तर दें:" : "Are you still with the same employer? Reply 1-3:",
        options: [
          { label: "1. Still with same employer", value: "SAME_EMPLOYER" },
          { label: "2. Changed employer", value: "CHANGED_EMPLOYER" },
          { label: "3. No longer working", value: "NOT_WORKING" },
        ],
      };
    } else {
      reply = {
        text: lang === "HI" ? "आपकी वर्तमान कार्य स्थिति क्या है? 1-5 से उत्तर दें:" : "What is your current work status? Reply 1-5:",
        options: [
          { label: "1. Employed", value: "EMPLOYED" },
          { label: "2. Self-employed", value: "SELF_EMPLOYED" },
          { label: "3. Apprentice", value: "APPRENTICE" },
          { label: "4. Looking for work", value: "LOOKING" },
          { label: "5. Not working", value: "NOT_WORKING" },
        ],
      };
    }

    await db.auditEvent.create({
      data: {
        entityType: "bot_inbound",
        entityId: `start_${Date.now()}`,
        action: "SIMULATOR_START",
        actorType: "SYSTEM",
        actorId: trainee.id,
        metadata: { phoneE164, followupEventId: followupEvent.id, autoCreated },
      },
    });

    return NextResponse.json({
      matched: true,
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      followupEventId: followupEvent.id,
      checkpointDays: followupEvent.checkpointDays,
      reply,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/bot/start error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to start simulation", 500);
  }
}
