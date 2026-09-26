import { Prisma } from "@prisma/client";
import { sendKapsoMessage } from "./kapso";
import {
  LANG_BUTTONS,
  LANG_PROMPT,
  T,
  VALUES,
  opts,
  type Lang,
  type Option,
} from "./messages";
import { db } from "~/server/db";

export interface InboundMessage {
  fromPhone: string;
  contactName: string;
  text: string;
  kapsoMessageId: string;
  kapsoConversationId?: string;
  kapsoPhoneNumberId?: string;
  timestamp: string;
  isInteractive?: boolean;
}

interface ConversationData {
  lang?: Lang;
  traineeId?: string | null;
  traineeName?: string;
  programme?: string;
  cohort?: string;
  employmentStatus?: string;
  employerName?: string;
  role?: string;
  salaryRange?: string;
  jobSatisfaction?: string;
  supportNeeded?: string;
  trainingRelevance?: string;
  skillGaps?: string[];
  additionalTraining?: string;
  careerGoals?: string;
  challenges?: string[];
  recommendations?: string;
}

interface ConversationState {
  step: string;
  data: ConversationData;
}

interface Ctx {
  state: ConversationState;
  phone: string;
  name: string | undefined;
  text: string;
  raw: string;
}

const STEPS = {
  LANGUAGE: "language",
  CONSENT: "consent",
  IDENTITY_VERIFY: "identity_verify",
  EMPLOYMENT_STATUS: "employment_status",
  EMPLOYER_DETAILS: "employer_details",
  ROLE_DETAILS: "role_details",
  SALARY_RANGE: "salary_range",
  JOB_SATISFACTION: "job_satisfaction",
  SUPPORT_NEEDS: "support_needs",
  TRAINING_RELEVANCE: "training_relevance",
  SKILL_GAPS: "skill_gaps",
  ADDITIONAL_TRAINING: "additional_training",
  CAREER_GOALS: "career_goals",
  CHALLENGES: "challenges",
  RECOMMENDATIONS: "recommendations",
  COMPLETE: "complete",
  DECLINED: "declined",
} as const;

const MAX_MULTI_SELECT = 3;
const PROCESSED_CAP = 1000;

const memStore = new Map<string, ConversationState>();
const processedMessageIds = new Set<string>();

const RESTART_KEYWORDS = new Set([
  "start",
  "restart",
  "begin",
  "hello",
  "hi",
  "hey",
  "namaste",
  "नमस्ते",
  "नमस्कार",
  "शुरू",
  "सुरू",
]);
const SKIP_KEYWORDS = new Set(["skip", "स्किप", "छोड़ें", "छोड़ो", "वगळा"]);
const DONE_KEYWORDS = new Set(["done", "bas", "बस", "पूर्ण", "पूरे", "झाले", "finish", "complete"]);
const CONSENT_YES = new Set([
  "consent_yes",
  "yes",
  "y",
  "हाँ",
  "हां",
  "हो",
  "होय",
  "haan",
  "ha",
]);
const CONSENT_NO = new Set([
  "consent_no",
  "no",
  "n",
  "ना",
  "नहीं",
  "नाही",
  "nahi",
  "na",
]);
const IDENTITY_YES = new Set([
  "identity_yes",
  "yes",
  "y",
  "हाँ",
  "हां",
  "हो",
  "होय",
  "haan",
  "ha",
]);
const IDENTITY_NO = new Set([
  "identity_no",
  "no",
  "n",
  "ना",
  "नहीं",
  "नाही",
  "nahi",
  "na",
]);
const LANG_KEYWORDS: Record<string, Lang> = {
  english: "en",
  en: "en",
  angrezi: "en",
  hindi: "hi",
  hi: "hi",
  "हिंदी": "hi",
  marathi: "mr",
  mr: "mr",
  "मराठी": "mr",
};

const EMPLOYED_STATUSES = new Set([
  "employed_full",
  "employed_part",
  "self_employed",
  "apprentice",
]);

function isEmployed(status: string | undefined) {
  return !!status && EMPLOYED_STATUSES.has(status);
}

function matchOption(
  text: string,
  options: Option[] | undefined,
  allowDigits: boolean
): string | undefined {
  if (!options) return undefined;
  const byValue = options.find((o) => o.value === text);
  if (byValue) return byValue.value;
  if (allowDigits) {
    const digit = /^([0-9]+)$/.exec(text);
    if (digit) {
      const idx = parseInt(digit[1] ?? "", 10);
      if (idx >= 1 && idx <= options.length) {
        const opt = options[idx - 1];
        if (opt) return opt.value;
      }
    }
  }
  return undefined;
}

function stepOptions(step: string, ctx: Ctx): Option[] | undefined {
  const lang = ctx.state.data.lang ?? "en";
  switch (step) {
    case STEPS.LANGUAGE:
      return LANG_BUTTONS;
    case STEPS.CONSENT:
      return opts(VALUES.consent, lang);
    case STEPS.IDENTITY_VERIFY:
      return opts(VALUES.identity, lang);
    case STEPS.EMPLOYMENT_STATUS:
      return opts(VALUES.employment, lang);
    case STEPS.SALARY_RANGE:
      return opts(VALUES.salary, lang);
    case STEPS.JOB_SATISFACTION:
      return opts(VALUES.satisfaction, lang);
    case STEPS.SUPPORT_NEEDS:
      return opts(VALUES.support, lang);
    case STEPS.TRAINING_RELEVANCE:
      return opts(VALUES.relevance, lang);
    case STEPS.SKILL_GAPS: {
      const selected = ctx.state.data.skillGaps ?? [];
      const all = opts(VALUES.gaps, lang);
      return selected.length === 0 ? all : all.filter((o) => !selected.includes(o.value));
    }
    case STEPS.ADDITIONAL_TRAINING:
      return opts(VALUES.training, lang);
    case STEPS.CAREER_GOALS:
      return opts(VALUES.goals, lang);
    case STEPS.CHALLENGES: {
      const selected = ctx.state.data.challenges ?? [];
      const all = opts(VALUES.challenges, lang);
      return selected.length === 0 ? all : all.filter((o) => !selected.includes(o.value));
    }
    case STEPS.RECOMMENDATIONS:
      return opts(VALUES.recommendations, lang);
    default:
      return undefined;
  }
}

async function sendInvalid(ctx: Ctx, step: string) {
  const t = T[ctx.state.data.lang ?? "en"];
  await sendKapsoMessage({
    toPhoneE164: ctx.phone,
    text: t.invalidOption,
    options: stepOptions(step, ctx),
  });
}

function freshState(): ConversationState {
  return { step: STEPS.LANGUAGE, data: {} };
}

function parseState(raw: unknown): ConversationState | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.step !== "string" || !obj.data || typeof obj.data !== "object") return null;
  const lang = (obj.data as Record<string, unknown>).lang;
  if (lang !== "en" && lang !== "hi" && lang !== "mr") return null;
  const data = { ...(obj.data as ConversationData) };
  if (Array.isArray(data.skillGaps)) data.skillGaps = [...data.skillGaps];
  if (Array.isArray(data.challenges)) data.challenges = [...data.challenges];
  return { step: obj.step, data };
}

async function loadState(phone: string): Promise<ConversationState> {
  const mem = memStore.get(phone);
  if (mem) return mem;
  let parsed: ConversationState | null = null;
  try {
    const trainee = await db.trainee.findFirst({
      where: { phoneE164: phone },
      select: { conversationState: true },
    });
    parsed = parseState(trainee?.conversationState);
  } catch (err) {
    console.error("[BOT] Failed to load state:", err);
  }
  const state = parsed ?? freshState();
  memStore.set(phone, state);
  return state;
}

async function persistState(phone: string, state: ConversationState) {
  memStore.set(phone, state);
  try {
    await db.trainee.updateMany({
      where: { phoneE164: phone },
      data: { conversationState: state as unknown as Prisma.InputJsonValue },
    });
  } catch (err) {
    console.error("[BOT] Failed to persist state:", err);
  }
}

async function clearState(phone: string) {
  memStore.delete(phone);
  try {
    await db.trainee.updateMany({
      where: { phoneE164: phone },
      data: { conversationState: Prisma.DbNull },
    });
  } catch (err) {
    console.error("[BOT] Failed to clear state:", err);
  }
}

async function askQuestion(step: string, ctx: Ctx) {
  const lang = ctx.state.data.lang ?? "en";
  const t = T[lang];
  const options = stepOptions(step, ctx);
  const d = ctx.state.data;
  switch (step) {
    case STEPS.LANGUAGE:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: LANG_PROMPT, options });
      break;
    case STEPS.CONSENT:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.consent, options });
      break;
    case STEPS.IDENTITY_VERIFY:
      await sendKapsoMessage({
        toPhoneE164: ctx.phone,
        text: t.identity
          .replace("{name}", d.traineeName ?? ctx.name ?? t.fallbackName)
          .replace("{phone}", ctx.phone)
          .replace("{programme}", d.programme ?? "—")
          .replace("{cohort}", d.cohort ?? "—"),
        options,
      });
      break;
    case STEPS.EMPLOYMENT_STATUS:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.employment, options });
      break;
    case STEPS.EMPLOYER_DETAILS:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.employer });
      break;
    case STEPS.ROLE_DETAILS:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.role });
      break;
    case STEPS.SALARY_RANGE:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.salary, options });
      break;
    case STEPS.JOB_SATISFACTION:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.satisfaction, options });
      break;
    case STEPS.SUPPORT_NEEDS:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.supportNeeds, options });
      break;
    case STEPS.TRAINING_RELEVANCE:
      await sendKapsoMessage({
        toPhoneE164: ctx.phone,
        text: isEmployed(d.employmentStatus) ? t.relevanceJob : t.relevanceSituation,
        options,
      });
      break;
    case STEPS.SKILL_GAPS: {
      const selected = d.skillGaps ?? [];
      const question = isEmployed(d.employmentStatus) ? t.skillGapsJob : t.skillGapsSituation;
      const text =
        selected.length === 0
          ? `${question}\n\n${t.selectHint}`
          : t.selectMore.replace("{count}", String(selected.length));
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text, options });
      break;
    }
    case STEPS.ADDITIONAL_TRAINING:
      await sendKapsoMessage({
        toPhoneE164: ctx.phone,
        text: isEmployed(d.employmentStatus) ? t.additionalJob : t.additionalSituation,
        options,
      });
      break;
    case STEPS.CAREER_GOALS:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.goals, options });
      break;
    case STEPS.CHALLENGES: {
      const selected = d.challenges ?? [];
      const text =
        selected.length === 0
          ? `${t.challenges}\n\n${t.selectHint}`
          : t.selectMore.replace("{count}", String(selected.length));
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text, options });
      break;
    }
    case STEPS.RECOMMENDATIONS:
      await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.recommendations, options });
      break;
  }
}

async function handleStep(ctx: Ctx) {
  switch (ctx.state.step) {
    case STEPS.LANGUAGE:
      return handleLanguage(ctx);
    case STEPS.CONSENT:
      return handleConsent(ctx);
    case STEPS.IDENTITY_VERIFY:
      return handleIdentityVerify(ctx);
    case STEPS.EMPLOYMENT_STATUS:
      return handleEmploymentStatus(ctx);
    case STEPS.EMPLOYER_DETAILS:
      return handleEmployerDetails(ctx);
    case STEPS.ROLE_DETAILS:
      return handleRoleDetails(ctx);
    case STEPS.SALARY_RANGE:
      return handleSalaryRange(ctx);
    case STEPS.JOB_SATISFACTION:
      return handleJobSatisfaction(ctx);
    case STEPS.SUPPORT_NEEDS:
      return handleSupportNeeds(ctx);
    case STEPS.TRAINING_RELEVANCE:
      return handleTrainingRelevance(ctx);
    case STEPS.SKILL_GAPS:
      return handleSkillGaps(ctx);
    case STEPS.ADDITIONAL_TRAINING:
      return handleAdditionalTraining(ctx);
    case STEPS.CAREER_GOALS:
      return handleCareerGoals(ctx);
    case STEPS.CHALLENGES:
      return handleChallenges(ctx);
    case STEPS.RECOMMENDATIONS:
      return handleRecommendations(ctx);
    default:
      ctx.state = freshState();
      memStore.set(ctx.phone, ctx.state);
      return askQuestion(STEPS.LANGUAGE, ctx);
  }
}

async function handleLanguage(ctx: Ctx) {
  const mapped =
    matchOption(ctx.text, LANG_BUTTONS, true) ??
    (LANG_KEYWORDS[ctx.text] ? `lang_${LANG_KEYWORDS[ctx.text]}` : undefined);
  if (!mapped) return sendInvalid(ctx, STEPS.LANGUAGE);
  const lang: Lang = mapped === "lang_en" ? "en" : mapped === "lang_hi" ? "hi" : "mr";
  ctx.state.data.lang = lang;
  ctx.state.step = STEPS.CONSENT;
  try {
    await db.trainee.updateMany({
      where: { phoneE164: ctx.phone },
      data: { language: lang.toUpperCase() },
    });
  } catch (err) {
    console.error("[BOT] Failed to save language:", err);
  }
  const t = T[lang];
  await sendKapsoMessage({
    toPhoneE164: ctx.phone,
    text: t.welcome.replace("{name}", ctx.name ?? t.fallbackName),
  });
  await askQuestion(STEPS.CONSENT, ctx);
}

async function handleConsent(ctx: Ctx) {
  const t = T[ctx.state.data.lang ?? "en"];
  if (CONSENT_NO.has(ctx.text)) {
    ctx.state.step = STEPS.DECLINED;
    await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.declined });
    return;
  }
  if (!CONSENT_YES.has(ctx.text)) return sendInvalid(ctx, STEPS.CONSENT);

  const trainee = await db.trainee.findFirst({
    where: { phoneE164: ctx.phone },
    include: { enrolments: { include: { cohort: { include: { programme: true } } } } },
  });

  if (trainee) {
    await db.trainee.update({
      where: { id: trainee.id },
      data: { consentGiven: true, consentGivenAt: new Date(), consentMethod: "WHATSAPP" },
    });
    ctx.state.data.traineeId = trainee.id;
    ctx.state.data.traineeName = trainee.fullName;
    ctx.state.data.programme = trainee.enrolments[0]?.cohort?.programme?.name ?? "PMKVY Training";
    ctx.state.data.cohort = trainee.enrolments[0]?.cohort?.name ?? "Your Batch";
    ctx.state.step = STEPS.IDENTITY_VERIFY;
    await askQuestion(STEPS.IDENTITY_VERIFY, ctx);
  } else {
    ctx.state.data.traineeId = null;
    ctx.state.step = STEPS.EMPLOYMENT_STATUS;
    await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.notFound });
    await askQuestion(STEPS.EMPLOYMENT_STATUS, ctx);
  }
}

async function handleIdentityVerify(ctx: Ctx) {
  const t = T[ctx.state.data.lang ?? "en"];
  if (IDENTITY_NO.has(ctx.text)) {
    ctx.state.data.traineeId = null;
    ctx.state.step = STEPS.EMPLOYMENT_STATUS;
    await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.wrongPerson });
    await askQuestion(STEPS.EMPLOYMENT_STATUS, ctx);
    return;
  }
  if (!IDENTITY_YES.has(ctx.text)) return sendInvalid(ctx, STEPS.IDENTITY_VERIFY);
  ctx.state.step = STEPS.EMPLOYMENT_STATUS;
  await askQuestion(STEPS.EMPLOYMENT_STATUS, ctx);
}

async function handleEmploymentStatus(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.EMPLOYMENT_STATUS, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.EMPLOYMENT_STATUS);
  const status = matched ?? "skipped";
  ctx.state.data.employmentStatus = status;
  const next = isEmployed(status) ? STEPS.EMPLOYER_DETAILS : STEPS.SUPPORT_NEEDS;
  ctx.state.step = next;
  await askQuestion(next, ctx);
}

async function handleEmployerDetails(ctx: Ctx) {
  const t = T[ctx.state.data.lang ?? "en"];
  if (SKIP_KEYWORDS.has(ctx.text)) {
    ctx.state.data.employerName = undefined;
    ctx.state.step = STEPS.ROLE_DETAILS;
    return askQuestion(STEPS.ROLE_DETAILS, ctx);
  }
  if (ctx.raw.length < 2) {
    await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.employerInvalid });
    return;
  }
  ctx.state.data.employerName = ctx.raw;
  ctx.state.step = STEPS.ROLE_DETAILS;
  await askQuestion(STEPS.ROLE_DETAILS, ctx);
}

async function handleRoleDetails(ctx: Ctx) {
  const t = T[ctx.state.data.lang ?? "en"];
  if (SKIP_KEYWORDS.has(ctx.text)) {
    ctx.state.data.role = undefined;
    ctx.state.step = STEPS.SALARY_RANGE;
    return askQuestion(STEPS.SALARY_RANGE, ctx);
  }
  if (ctx.raw.length < 2) {
    await sendKapsoMessage({ toPhoneE164: ctx.phone, text: t.roleInvalid });
    return;
  }
  ctx.state.data.role = ctx.raw;
  ctx.state.step = STEPS.SALARY_RANGE;
  await askQuestion(STEPS.SALARY_RANGE, ctx);
}

async function handleSalaryRange(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.SALARY_RANGE, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.SALARY_RANGE);
  ctx.state.data.salaryRange = matched;
  ctx.state.step = STEPS.JOB_SATISFACTION;
  await askQuestion(STEPS.JOB_SATISFACTION, ctx);
}

async function handleJobSatisfaction(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.JOB_SATISFACTION, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.JOB_SATISFACTION);
  ctx.state.data.jobSatisfaction = matched;
  ctx.state.step = STEPS.TRAINING_RELEVANCE;
  await askQuestion(STEPS.TRAINING_RELEVANCE, ctx);
}

async function handleSupportNeeds(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.SUPPORT_NEEDS, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.SUPPORT_NEEDS);
  ctx.state.data.supportNeeded = matched;
  ctx.state.step = STEPS.TRAINING_RELEVANCE;
  await askQuestion(STEPS.TRAINING_RELEVANCE, ctx);
}

async function handleTrainingRelevance(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.TRAINING_RELEVANCE, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.TRAINING_RELEVANCE);
  ctx.state.data.trainingRelevance = matched;
  ctx.state.step = STEPS.SKILL_GAPS;
  await askQuestion(STEPS.SKILL_GAPS, ctx);
}

async function handleSkillGaps(ctx: Ctx) {
  const selected = ctx.state.data.skillGaps ?? [];

  if (DONE_KEYWORDS.has(ctx.text)) {
    if (selected.length === 0) return sendInvalid(ctx, STEPS.SKILL_GAPS);
    ctx.state.step = STEPS.ADDITIONAL_TRAINING;
    return askQuestion(STEPS.ADDITIONAL_TRAINING, ctx);
  }
  if (SKIP_KEYWORDS.has(ctx.text)) {
    ctx.state.data.skillGaps = selected.length > 0 ? selected : ["skipped"];
    ctx.state.step = STEPS.ADDITIONAL_TRAINING;
    return askQuestion(STEPS.ADDITIONAL_TRAINING, ctx);
  }

  const matched = matchOption(ctx.text, stepOptions(STEPS.SKILL_GAPS, ctx), false);
  if (!matched) return sendInvalid(ctx, STEPS.SKILL_GAPS);

  if (matched === "gap_none") {
    ctx.state.data.skillGaps = ["none"];
  } else if (!selected.includes(matched)) {
    ctx.state.data.skillGaps = [...selected, matched];
  }

  const now = ctx.state.data.skillGaps ?? [];
  if (now.includes("none") || now.length >= MAX_MULTI_SELECT) {
    ctx.state.step = STEPS.ADDITIONAL_TRAINING;
    return askQuestion(STEPS.ADDITIONAL_TRAINING, ctx);
  }
  await askQuestion(STEPS.SKILL_GAPS, ctx);
}

async function handleAdditionalTraining(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.ADDITIONAL_TRAINING, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.ADDITIONAL_TRAINING);
  ctx.state.data.additionalTraining = matched;
  ctx.state.step = STEPS.CAREER_GOALS;
  await askQuestion(STEPS.CAREER_GOALS, ctx);
}

async function handleCareerGoals(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.CAREER_GOALS, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.CAREER_GOALS);
  ctx.state.data.careerGoals = matched;
  ctx.state.step = STEPS.CHALLENGES;
  await askQuestion(STEPS.CHALLENGES, ctx);
}

async function handleChallenges(ctx: Ctx) {
  const selected = ctx.state.data.challenges ?? [];

  if (DONE_KEYWORDS.has(ctx.text)) {
    if (selected.length === 0) return sendInvalid(ctx, STEPS.CHALLENGES);
    ctx.state.step = STEPS.RECOMMENDATIONS;
    return askQuestion(STEPS.RECOMMENDATIONS, ctx);
  }
  if (SKIP_KEYWORDS.has(ctx.text)) {
    ctx.state.data.challenges = selected.length > 0 ? selected : ["skipped"];
    ctx.state.step = STEPS.RECOMMENDATIONS;
    return askQuestion(STEPS.RECOMMENDATIONS, ctx);
  }

  const matched = matchOption(ctx.text, stepOptions(STEPS.CHALLENGES, ctx), false);
  if (!matched) return sendInvalid(ctx, STEPS.CHALLENGES);

  if (matched === "challenge_none") {
    ctx.state.data.challenges = ["none"];
  } else if (!selected.includes(matched)) {
    ctx.state.data.challenges = [...selected, matched];
  }

  const now = ctx.state.data.challenges ?? [];
  if (now.includes("none") || now.length >= MAX_MULTI_SELECT) {
    ctx.state.step = STEPS.RECOMMENDATIONS;
    return askQuestion(STEPS.RECOMMENDATIONS, ctx);
  }
  await askQuestion(STEPS.CHALLENGES, ctx);
}

async function handleRecommendations(ctx: Ctx) {
  const matched = matchOption(ctx.text, stepOptions(STEPS.RECOMMENDATIONS, ctx), true);
  if (!matched && !SKIP_KEYWORDS.has(ctx.text)) return sendInvalid(ctx, STEPS.RECOMMENDATIONS);
  ctx.state.data.recommendations = matched;
  await completeSurvey(ctx);
}

async function completeSurvey(ctx: Ctx) {
  await saveSurveyResponse(ctx.phone, ctx.state.data);
  ctx.state.step = STEPS.COMPLETE;
  const lang = ctx.state.data.lang ?? "en";
  const t = T[lang];
  const name = ctx.state.data.traineeName ?? ctx.name ?? t.fallbackName;
  await sendKapsoMessage({
    toPhoneE164: ctx.phone,
    text: t.complete.replace("{name}", name),
    addCareerGuidance: false,
  });
}

async function saveSurveyResponse(phone: string, data: ConversationData) {
  try {
    await db.surveyResponse.create({
      data: {
        phoneE164: phone,
        traineeId: data.traineeId ?? null,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName,
        role: data.role,
        salaryRange: data.salaryRange,
        jobSatisfaction: data.jobSatisfaction,
        supportNeeded: data.supportNeeded,
        trainingRelevance: data.trainingRelevance,
        skillGaps: data.skillGaps ?? [],
        additionalTraining: data.additionalTraining,
        careerGoals: data.careerGoals,
        challenges: data.challenges ?? [],
        recommendations: data.recommendations,
        language: data.lang ? data.lang.toUpperCase() : undefined,
        completedAt: new Date(),
      },
    });
    console.log("[SURVEY] Saved response for", phone);
  } catch (err) {
    console.error("[SURVEY] Save error:", err);
  }
}

export async function processInboundMessage(msg: InboundMessage) {
  const { fromPhone, contactName, text, kapsoMessageId } = msg;
  const normalizedText = text.trim().toLowerCase();

  if (processedMessageIds.has(kapsoMessageId)) {
    console.log("[BOT] Duplicate message ignored:", kapsoMessageId);
    return;
  }
  processedMessageIds.add(kapsoMessageId);
  if (processedMessageIds.size > PROCESSED_CAP) {
    let toDrop = processedMessageIds.size - PROCESSED_CAP;
    for (const id of processedMessageIds) {
      processedMessageIds.delete(id);
      if (--toDrop === 0) break;
    }
  }

  const state = await loadState(fromPhone);
  const ctx: Ctx = {
    state,
    phone: fromPhone,
      name: contactName || undefined,
    text: normalizedText,
    raw: text.trim(),
  };

  try {
    if (state.step !== STEPS.LANGUAGE && RESTART_KEYWORDS.has(normalizedText)) {
      ctx.state = freshState();
      memStore.set(fromPhone, ctx.state);
      await askQuestion(STEPS.LANGUAGE, ctx);
    } else {
      await handleStep(ctx);
    }
    if (ctx.state.step === STEPS.COMPLETE || ctx.state.step === STEPS.DECLINED) {
      await clearState(fromPhone);
    } else {
      await persistState(fromPhone, ctx.state);
    }
  } catch (err) {
    console.error("[BOT] Error processing:", err);
    const t = T[ctx.state.data.lang ?? "en"];
    await sendKapsoMessage({ toPhoneE164: fromPhone, text: t.error }).catch(() => undefined);
    await clearState(fromPhone);
  }
}

export async function getConversationState(phone: string): Promise<ConversationState | undefined> {
  const mem = memStore.get(phone);
  if (mem) return mem;
  try {
    const trainee = await db.trainee.findFirst({
      where: { phoneE164: phone },
      select: { conversationState: true },
    });
    return parseState(trainee?.conversationState) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function resetConversation(phone: string) {
  await clearState(phone);
}

export async function startConversation(fromPhoneE164: string, contactName: string) {
  const state = freshState();
  memStore.set(fromPhoneE164, state);
  try {
    await askQuestion(STEPS.LANGUAGE, {
      state,
      phone: fromPhoneE164,
    name: contactName || undefined,
      text: "",
      raw: "",
    });
  } catch (err) {
    console.error("[BOT] Failed to start conversation:", err);
    memStore.delete(fromPhoneE164);
  }
}
