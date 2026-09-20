import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, normalizePhoneE164, validateInternalApiKey } from "~/app/api/v1/_utils";
import crypto from "crypto";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

const inboundSchema = z.object({
  provider: z.string(),
  provider_message_id: z.string(),
  from_phone_e164: z.string(),
  text: z.string(),
  received_at: z.string().datetime(),
  channel: z.enum(["whatsapp", "sms", "email"]).default("whatsapp"),
});

type BotSessionState =
  | "AWAITING_STATUS"
  | "AWAITING_EMPLOYER_NAME"
  | "AWAITING_ROLE"
  | "AWAITING_SALARY_BAND"
  | "AWAITING_NON_PLACEMENT_REASON"
  | "AWAITING_RETENTION_STATUS"
  | "AWAITING_RETENTION_SALARY_BAND"
  | "DONE";

interface CollectedData {
  status?: string;
  employer_name?: string;
  role?: string;
  salary_band?: string;
  non_placement_reason?: string;
  [key: string]: string | undefined;
}

const STATUS_OPTIONS = [
  { label: "1. Employed", value: "EMPLOYED" },
  { label: "2. Self-employed", value: "SELF_EMPLOYED" },
  { label: "3. Apprentice", value: "APPRENTICE" },
  { label: "4. Looking for work", value: "LOOKING" },
  { label: "5. Not working", value: "NOT_WORKING" },
];

const SALARY_BANDS = [
  { label: "1. < ₹10,000", value: "LT_10K" },
  { label: "2. ₹10,000 - ₹20,000", value: "B_10_20K" },
  { label: "3. ₹20,000 - ₹35,000", value: "B_20_35K" },
  { label: "4. ₹35,000 - ₹50,000", value: "B_35_50K" },
  { label: "5. > ₹50,000", value: "GT_50K" },
];

const NON_PLACEMENT_REASONS = [
  { label: "1. No jobs available", value: "NO_JOBS" },
  { label: "2. Skills mismatch", value: "SKILLS_MISMATCH" },
  { label: "3. Family responsibilities", value: "FAMILY" },
  { label: "4. Health issues", value: "HEALTH" },
  { label: "5. Other", value: "OTHER" },
];

const RETENTION_STATUS_OPTIONS = [
  { label: "1. Still with same employer", value: "SAME_EMPLOYER" },
  { label: "2. Changed employer", value: "CHANGED_EMPLOYER" },
  { label: "3. No longer working", value: "NOT_WORKING" },
];

function getStatusQuestion(): { text: string; options: Array<{ label: string; value: string }> } {
  return {
    text: "What is your current work status? Reply 1-5:",
    options: STATUS_OPTIONS,
  };
}

function getRetentionStatusQuestion(): { text: string; options: Array<{ label: string; value: string }> } {
  return {
    text: "Are you still with the same employer? Reply 1-3:",
    options: RETENTION_STATUS_OPTIONS,
  };
}

function getEmployerNameQuestion(): { text: string; options: never[] } {
  return {
    text: "What is your employer's name?",
    options: [],
  };
}

function getRoleQuestion(): { text: string; options: never[] } {
  return {
    text: "What is your role/designation?",
    options: [],
  };
}

function getSalaryBandQuestion(): { text: string; options: Array<{ label: string; value: string }> } {
  return {
    text: "What is your monthly salary band? Reply 1-5:",
    options: SALARY_BANDS,
  };
}

function getNonPlacementReasonQuestion(): { text: string; options: Array<{ label: string; value: string }> } {
  return {
    text: "What is the main reason? Reply 1-5:",
    options: NON_PLACEMENT_REASONS,
  };
}

function getRetentionSalaryBandQuestion(): { text: string; options: Array<{ label: string; value: string }> } {
  return {
    text: "What is your current monthly salary band? Reply 1-5:",
    options: SALARY_BANDS,
  };
}

async function findOrCreateBotSession(traineeId: string, followupEventId: string, checkpointDays: number) {
  const existing = await db.botSession.findFirst({
    where: { traineeId, followupEventId, state: { not: "DONE" } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  // For 90-day retention follow-ups, start with retention status question
  const initialState = checkpointDays === 90 ? "AWAITING_RETENTION_STATUS" : "AWAITING_STATUS";
  const initialQuestion = checkpointDays === 90 ? "retention_status" : "status";
  
  return db.botSession.create({
    data: {
      traineeId,
      followupEventId,
      state: initialState,
      currentQuestion: initialQuestion,
      expiresAt,
    },
  });
}

async function processStateMachine(session: any, text: string, trainee: any, followupEvent: any) {
  const collectedData = (session.collectedData as CollectedData) || {};
  let newState: BotSessionState = session.state;
  let reply: { text: string; options: Array<{ label: string; value: string }> } = { text: "", options: [] };
  let isDone = false;

  switch (session.state) {
    case "AWAITING_STATUS": {
      const statusMap: Record<string, string> = {
        "1": "EMPLOYED",
        "2": "SELF_EMPLOYED",
        "3": "APPRENTICE",
        "4": "LOOKING",
        "5": "NOT_WORKING",
      };
      const status = statusMap[text.trim()];
      if (!status) {
        reply = getStatusQuestion();
        reply.text = "Invalid option. " + reply.text;
        break;
      }
      collectedData.status = status;
      if (["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(status)) {
        newState = "AWAITING_EMPLOYER_NAME";
        reply = getEmployerNameQuestion();
      } else {
        newState = "AWAITING_NON_PLACEMENT_REASON";
        reply = getNonPlacementReasonQuestion();
      }
      break;
    }

    case "AWAITING_EMPLOYER_NAME": {
      if (text.trim().length < 2 || text.trim().length > 100) {
        reply = getEmployerNameQuestion();
        reply.text = "Employer name must be 2-100 characters. " + reply.text;
        break;
      }
      collectedData.employer_name = text.trim();
      newState = "AWAITING_ROLE";
      reply = getRoleQuestion();
      break;
    }

    case "AWAITING_ROLE": {
      if (text.trim().length < 2 || text.trim().length > 100) {
        reply = getRoleQuestion();
        reply.text = "Role must be 2-100 characters. " + reply.text;
        break;
      }
      collectedData.role = text.trim();
      newState = "AWAITING_SALARY_BAND";
      reply = getSalaryBandQuestion();
      break;
    }

    case "AWAITING_SALARY_BAND": {
      const bandMap: Record<string, string> = {
        "1": "LT_10K",
        "2": "B_10_20K",
        "3": "B_20_35K",
        "4": "B_35_50K",
        "5": "GT_50K",
      };
      const salaryBand = bandMap[text.trim()];
      if (!salaryBand) {
        reply = getSalaryBandQuestion();
        reply.text = "Invalid option. " + reply.text;
        break;
      }
      collectedData.salary_band = salaryBand;
      newState = "DONE";
      isDone = true;
      reply = { text: "Thank you! Your employment claim has been recorded.", options: [] };
      break;
    }

    case "AWAITING_NON_PLACEMENT_REASON": {
      const reasonMap: Record<string, string> = {
        "1": "NO_JOBS",
        "2": "SKILLS_MISMATCH",
        "3": "FAMILY",
        "4": "HEALTH",
        "5": "OTHER",
      };
      const reason = reasonMap[text.trim()];
      if (!reason) {
        reply = getNonPlacementReasonQuestion();
        reply.text = "Invalid option. " + reply.text;
        break;
      }
      collectedData.non_placement_reason = reason;
      newState = "DONE";
      isDone = true;
      reply = { text: "Thank you for sharing. We'll follow up later to see if we can help.", options: [] };
      break;
    }

    // Retention follow-up states (90-day)
    case "AWAITING_RETENTION_STATUS": {
      const retentionMap: Record<string, string> = {
        "1": "SAME_EMPLOYER",
        "2": "CHANGED_EMPLOYER",
        "3": "NOT_WORKING",
      };
      const retentionStatus = retentionMap[text.trim()];
      if (!retentionStatus) {
        reply = getRetentionStatusQuestion();
        reply.text = "Invalid option. " + reply.text;
        break;
      }
      collectedData.retention_status = retentionStatus;
      if (retentionStatus === "NOT_WORKING") {
        newState = "AWAITING_NON_PLACEMENT_REASON";
        reply = getNonPlacementReasonQuestion();
      } else {
        newState = "AWAITING_RETENTION_SALARY_BAND";
        reply = getRetentionSalaryBandQuestion();
      }
      break;
    }

    case "AWAITING_RETENTION_SALARY_BAND": {
      const bandMap: Record<string, string> = {
        "1": "LT_10K",
        "2": "B_10_20K",
        "3": "B_20_35K",
        "4": "B_35_50K",
        "5": "GT_50K",
      };
      const salaryBand = bandMap[text.trim()];
      if (!salaryBand) {
        reply = getRetentionSalaryBandQuestion();
        reply.text = "Invalid option. " + reply.text;
        break;
      }
      collectedData.salary_band = salaryBand;
      newState = "DONE";
      isDone = true;
      reply = { text: "Thank you! Your retention update has been recorded.", options: [] };
      break;
    }

    default:
      reply = { text: "Session completed. We'll follow up later.", options: [] };
  }

  // Update session
  await db.botSession.update({
    where: { id: session.id },
    data: {
      state: newState,
      currentQuestion: newState === "DONE" ? null : newState.toLowerCase().replace("_", " "),
      collectedData,
      expiresAt: newState === "DONE" ? new Date() : new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return { reply, isDone, collectedData };
}

async function createEmploymentClaimAndEvents(
  trainee: any,
  followupEvent: any,
  collectedData: CollectedData
) {
  const claim = await db.employmentClaim.create({
    data: {
      traineeId: trainee.id,
      followupEventId: followupEvent.id,
      employerName: collectedData.employer_name,
      role: collectedData.role,
      salaryBand: collectedData.salary_band as any,
      nonPlacementReason: collectedData.non_placement_reason as any,
      verificationStatus: "SELF_REPORTED",
      evidenceLevel: 1,
    },
  });

  await db.outcomeEvent.create({
    data: {
      traineeId: trainee.id,
      employmentClaimId: claim.id,
      checkpointDays: followupEvent.checkpointDays,
      outcomeStatus: collectedData.status as any,
      verificationStatus: "SELF_REPORTED",
      source: "TRAINEE",
      evidenceLevel: 1,
    },
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.verificationRequest.create({
    data: {
      employmentClaimId: claim.id,
      tokenHash,
      expiresAt,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "employment_claim",
      entityId: claim.id,
      action: "CREATED",
      actorType: "TRAINEE",
      actorId: trainee.id,
      metadata: { collectedData, followupEventId: followupEvent.id },
    },
  });

  // Update followup event status
  await db.followupEvent.update({
    where: { id: followupEvent.id },
    data: { status: "RESPONDED", respondedAt: new Date() },
  });

  return { claim, token, verificationUrl: `${process.env.APP_BASE_URL}/employer/verify/${token}` };
}

async function createRetentionOutcomeEvent(
  trainee: any,
  followupEvent: any,
  collectedData: CollectedData
) {
  // Determine outcome status based on retention response
  let outcomeStatus: string;
  const retentionStatus = collectedData.retention_status;
  
  if (retentionStatus === "SAME_EMPLOYER") {
    outcomeStatus = "EMPLOYED";
  } else if (retentionStatus === "CHANGED_EMPLOYER") {
    outcomeStatus = "EMPLOYED";
  } else {
    outcomeStatus = "NOT_WORKING";
  }

  await db.outcomeEvent.create({
    data: {
      traineeId: trainee.id,
      employmentClaimId: null, // Retention doesn't link to a claim
      checkpointDays: followupEvent.checkpointDays,
      outcomeStatus: outcomeStatus as any,
      verificationStatus: "SELF_REPORTED",
      source: "TRAINEE",
      evidenceLevel: 1,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "followup_event",
      entityId: followupEvent.id,
      action: "RETENTION_RESPONSE",
      actorType: "TRAINEE",
      actorId: trainee.id,
      metadata: { collectedData, checkpointDays: followupEvent.checkpointDays },
    },
  });

  // Update followup event status
  await db.followupEvent.update({
    where: { id: followupEvent.id },
    data: { status: "RESPONDED", respondedAt: new Date() },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Validate internal API key for service-to-service calls
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const body = await request.json();
    const data = inboundSchema.parse(body);

    // Idempotency check
    const existingInbound = await db.auditEvent.findFirst({
      where: {
        entityType: "bot_inbound",
        entityId: data.provider_message_id,
        action: "RECEIVED",
      },
    });
    if (existingInbound) {
      return NextResponse.json({ matched: true, duplicate: true });
    }

    // Normalize phone and find trainee
    const phoneE164 = normalizePhoneE164(data.from_phone_e164);
    const trainee = await db.trainee.findUnique({ where: { phoneE164 } });

    if (!trainee) {
      // Log unmatched inbound
      await db.auditEvent.create({
        data: {
          entityType: "bot_inbound",
          entityId: data.provider_message_id,
          action: "RECEIVED_UNMATCHED",
          actorType: "SYSTEM",
          metadata: { phoneE164, provider: data.provider },
        },
      });
      return NextResponse.json({ matched: false });
    }

    // Find active follow-up event (30-day or 90-day checkpoint)
    const followupEvent = await db.followupEvent.findFirst({
      where: {
        traineeId: trainee.id,
        checkpointDays: { in: [30, 90] },
        status: { in: ["SENT", "SCHEDULED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!followupEvent) {
      await db.auditEvent.create({
        data: {
          entityType: "bot_inbound",
          entityId: data.provider_message_id,
          action: "RECEIVED_NO_FOLLOWUP",
          actorType: "SYSTEM",
          metadata: { traineeId: trainee.id, phoneE164 },
        },
      });
      return NextResponse.json({ matched: false });
    }

    // Find or create bot session
    const session = await findOrCreateBotSession(trainee.id, followupEvent.id, followupEvent.checkpointDays);

    // Process state machine
    const { reply, isDone, collectedData } = await processStateMachine(
      session,
      data.text,
      trainee,
      followupEvent
    );

    // If done, create employment claim and verification request (for 30-day) or retention outcome event (for 90-day)
    let verificationUrl: string | undefined;
    if (isDone) {
      if (followupEvent.checkpointDays === 90) {
        await createRetentionOutcomeEvent(trainee, followupEvent, collectedData);
      } else {
        const result = await createEmploymentClaimAndEvents(trainee, followupEvent, collectedData);
        verificationUrl = result.verificationUrl;
      }
    }

    // Log inbound
    await db.auditEvent.create({
      data: {
        entityType: "bot_inbound",
        entityId: data.provider_message_id,
        action: "RECEIVED",
        actorType: "TRAINEE",
        actorId: trainee.id,
        metadata: {
          phoneE164,
          text: data.text,
          sessionState: session.state,
          newState: isDone ? "DONE" : session.state,
        },
      },
    });

    return NextResponse.json({
      matched: true,
      traineeId: trainee.id,
      sessionState: isDone ? "DONE" : session.state,
      reply: {
        ...reply,
        verificationUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/bot/inbound error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to process inbound message", 500);
  }
}