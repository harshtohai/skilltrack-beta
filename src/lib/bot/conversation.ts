import { sendKapsoMessage } from "./kapso";
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
  traineeId?: string | null;
  programme?: string;
  cohort?: string;
  employmentStatus?: string;
  employerName?: string;
  role?: string;
  salaryRange?: string;
  jobSatisfaction?: string;
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

const conversationStore = new Map<string, ConversationState>();

const STEPS = {
  WELCOME: "welcome",
  CONSENT: "consent",
  IDENTITY_VERIFY: "identity_verify",
  EMPLOYMENT_STATUS: "employment_status",
  EMPLOYER_DETAILS: "employer_details",
  ROLE_DETAILS: "role_details",
  SALARY_RANGE: "salary_range",
  JOB_SATISFACTION: "job_satisfaction",
  TRAINING_RELEVANCE: "training_relevance",
  SKILL_GAPS: "skill_gaps",
  ADDITIONAL_TRAINING: "additional_training",
  CAREER_GOALS: "career_goals",
  CHALLENGES: "challenges",
  RECOMMENDATIONS: "recommendations",
  COMPLETE: "complete",
};

const WELCOME_MESSAGE = `👋 *Hello {name}!*

Welcome to *OutcomeTrack* – the official placement tracking & career guidance platform by the *Maharashtra State Skill Development Society (MSSDS)* under the *Pradhan Mantri Kaushal Vikas Yojana (PMKVY)*.

We're here to understand your career journey after training so we can:
✅ Improve training programs for future batches
✅ Connect you with better job opportunities  
✅ Provide personalized career guidance
✅ Help policymakers make data-driven decisions

*Your responses are confidential and used only for program improvement.*

Shall we begin? It takes about 3-4 minutes.`;

const CONSENT_MESSAGE = `📋 *Consent Required*

Before we proceed, we need your consent to:
1. Collect your employment & training feedback
2. Store your responses securely (encrypted)
3. Use anonymized data for program analytics
4. Contact you for future opportunities (optional)

*You can skip any question or withdraw anytime.*

Do you consent to participate?`;

const CONSENT_BUTTONS = [
  { label: "✅ Yes, I consent", value: "consent_yes" },
  { label: "❌ No, thank you", value: "consent_no" },
];

const IDENTITY_VERIFY_MESSAGE = `🔍 *Identity Verification*

To link your responses to your training record, please confirm:

*Name:* {name}
*Phone:* {phone}
*Training Program:* {programme}
*Batch:* {cohort}

Is this correct?`;

const IDENTITY_BUTTONS = [
  { label: "✅ Yes, that's me", value: "identity_yes" },
  { label: "❌ No, wrong person", value: "identity_no" },
];

const EMPLOYMENT_STATUS_MESSAGE = `💼 *Current Employment Status*

What best describes your current situation?`;

const EMPLOYMENT_BUTTONS = [
  { label: "1️⃣ Employed full-time", value: "employed_full" },
  { label: "2️⃣ Employed part-time", value: "employed_part" },
  { label: "3️⃣ Self-employed / Freelance", value: "self_employed" },
  { label: "4️⃣ Apprentice / Intern", value: "apprentice" },
  { label: "5️⃣ Looking for work", value: "looking" },
  { label: "6️⃣ Not working / Studying", value: "not_working" },
];

const EMPLOYER_DETAILS_MESSAGE = `🏢 *Employer Details*

What is the name of your current employer/organization?
(If self-employed, type your business name)`;

const ROLE_DETAILS_MESSAGE = `👔 *Your Role*

What is your current job title/role?
(e.g., "Software Developer", "Sales Executive", "Electrician", "Data Entry Operator")`;

const SALARY_RANGE_MESSAGE = `💰 *Monthly Income Range*

What is your approximate monthly income (including incentives)?`;

const SALARY_BUTTONS = [
  { label: "💵 Below ₹10,000", value: "salary_0_10k" },
  { label: "💵 ₹10,000 - ₹15,000", value: "salary_10k_15k" },
  { label: "💵 ₹15,000 - ₹25,000", value: "salary_15k_25k" },
  { label: "💵 ₹25,000 - ₹40,000", value: "salary_25k_40k" },
  { label: "💵 ₹40,000 - ₹60,000", value: "salary_40k_60k" },
  { label: "💵 ₹60,000 - ₹1,00,000", value: "salary_60k_100k" },
  { label: "💵 Above ₹1,00,000", value: "salary_100k_plus" },
  { label: "🤐 Prefer not to say", value: "salary_prefer_not" },
];

const JOB_SATISFACTION_MESSAGE = `😊 *Job Satisfaction*

How satisfied are you with your current role?`;

const SATISFACTION_BUTTONS = [
  { label: "⭐⭐⭐⭐⭐ Very Satisfied", value: "sat_5" },
  { label: "⭐⭐⭐⭐ Satisfied", value: "sat_4" },
  { label: "⭐⭐⭐ Neutral", value: "sat_3" },
  { label: "⭐⭐ Dissatisfied", value: "sat_2" },
  { label: "⭐ Very Dissatisfied", value: "sat_1" },
];

const TRAINING_RELEVANCE_MESSAGE = `🎓 *Training Relevance*

How relevant was your PMKVY training to your current job?`;

const RELEVANCE_BUTTONS = [
  { label: "🎯 Directly relevant", value: "relevance_direct" },
  { label: "🔗 Somewhat relevant", value: "relevance_partial" },
  { label: "📚 Only basics useful", value: "relevance_basics" },
  { label: "❌ Not relevant at all", value: "relevance_none" },
];

const SKILL_GAPS_MESSAGE = `📉 *Skill Gaps*

What skills did you *lack* when starting this job that training didn't cover?
(Select all that apply or type your own)`;

const SKILL_GAP_OPTIONS = [
  { label: "💻 Technical/Digital skills", value: "gap_technical", description: "Software, tools, equipment" },
  { label: "🗣️ Communication/Soft skills", value: "gap_communication", description: "English, presentation, teamwork" },
  { label: "📊 Data/Analytical skills", value: "gap_analytical", description: "Excel, reporting, analysis" },
  { label: "🔧 Domain-specific skills", value: "gap_domain", description: "Industry-specific knowledge" },
  { label: "👔 Professional etiquette", value: "gap_etiquette", description: "Workplace behavior, emails" },
  { label: "💰 Financial literacy", value: "gap_financial", description: "Salary, taxes, savings" },
  { label: "✅ No major gaps", value: "gap_none", description: "Training covered everything" },
];

const ADDITIONAL_TRAINING_MESSAGE = `📚 *Additional Training Needs*

What training would help you grow in your current role or get a better job?`;

const TRAINING_OPTIONS = [
  { label: "🚀 Advanced technical skills", value: "train_adv_tech", description: "Next-level domain skills" },
  { label: "🎯 Certification courses", value: "train_cert", description: "Industry-recognized certs" },
  { label: "🗣️ English/Communication", value: "train_english", description: "Business communication" },
  { label: "💼 Entrepreneurship", value: "train_entrepreneur", description: "Start your own business" },
  { label: "📈 Leadership/Management", value: "train_leadership", description: "Team lead, supervisor skills" },
  { label: "💻 Digital/Computer skills", value: "train_digital", description: "MS Office, coding, tools" },
  { label: "🤝 Interview preparation", value: "train_interview", description: "Resume, mock interviews" },
  { label: "✅ None needed", value: "train_none", description: "Happy with current skills" },
];

const CAREER_GOALS_MESSAGE = `🎯 *Career Goals (Next 2 Years)*

What are you aiming for?`;

const GOALS_OPTIONS = [
  { label: "📈 Promotion in current role", value: "goal_promotion" },
  { label: "🔄 Switch to better job", value: "goal_switch" },
  { label: "🎓 Higher education/degree", value: "goal_education" },
  { label: "🏢 Start own business", value: "goal_business" },
  { label: "🌍 Work abroad", value: "goal_abroad" },
  { label: "🏠 Stay in current role", value: "goal_stay" },
  { label: "🤔 Not sure yet", value: "goal_unsure" },
];

const CHALLENGES_MESSAGE = `🚧 *Biggest Career Challenges*

What's holding you back? (Select up to 3)`;

const CHALLENGES_OPTIONS = [
  { label: "💰 Low salary / No increments", value: "challenge_salary" },
  { label: "📉 Limited growth opportunities", value: "challenge_growth" },
  { label: "🎓 Skills don't match market needs", value: "challenge_skills" },
  { label: "📍 Location / Commute issues", value: "challenge_location" },
  { label: "⚖️ Work-life balance", value: "challenge_balance" },
  { label: "🤝 Workplace culture", value: "challenge_culture" },
  { label: "📋 No formal contract/benefits", value: "challenge_contract" },
  { label: "👨‍👩‍👧‍👦 Family/personal constraints", value: "challenge_family" },
  { label: "✅ No major challenges", value: "challenge_none" },
];

const RECOMMENDATIONS_MESSAGE = `💡 *Your Suggestions for PMKVY*

How can we improve the training program for future students?`;

const RECOMMENDATIONS_OPTIONS = [
  { label: "🛠️ More practical/hands-on training", value: "rec_practical" },
  { label: "🏭 Industry visits & internships", value: "rec_internship" },
  { label: "💻 Latest tools & technologies", value: "rec_tools" },
  { label: "🗣️ Soft skills & English focus", value: "rec_softskills" },
  { label: "🤝 Better placement support", value: "rec_placement" },
  { label: "📜 Recognized certifications", value: "rec_certs" },
  { label: "💰 Financial literacy module", value: "rec_financial" },
  { label: "👩‍🏫 Better trainer quality", value: "rec_trainers" },
  { label: "✅ Program is good as-is", value: "rec_good" },
];

const COMPLETE_MESSAGE = `🎉 *Thank You, {name}!*

Your responses have been recorded and will help improve skill training for thousands of students across Maharashtra.

📊 *What happens next:*
• Your feedback goes to MSSDS & NSDC for program improvements
• You'll get personalized job alerts on OutcomeTrack
• We may reach out for follow-up in 6 months

🔗 *Stay Connected:*
• Visit: https://outcometrack.vercel.app
• Job alerts | Skill courses | Career guidance

*Together, building a skilled Maharashtra! 🇮🇳*

— Team OutcomeTrack (MSSDS / PMKVY)`;

const processedMessageIds = new Set<string>();

export async function processInboundMessage(msg: InboundMessage) {
  const { fromPhone, contactName, text, kapsoMessageId } = msg;
  const normalizedText = text.trim().toLowerCase();

  // Idempotency: Kapso retries webhooks while the server is slow to
  // respond — never process the same message twice.
  if (processedMessageIds.has(kapsoMessageId)) {
    console.log("[BOT] Duplicate message ignored:", kapsoMessageId);
    return;
  }
  processedMessageIds.add(kapsoMessageId);

  let state = conversationStore.get(fromPhone);

  if (!state) {
    state = { step: STEPS.WELCOME, data: {} };
    conversationStore.set(fromPhone, state);
  }

  try {
    await handleStep(state, fromPhone, contactName, normalizedText, msg);
  } catch (err) {
    console.error("[BOT] Error processing:", err);
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Sorry, something went wrong. Please type *START* to begin again.",
    });
    conversationStore.delete(fromPhone);
  }
}

async function handleStep(
  state: ConversationState,
  fromPhone: string,
  contactName: string,
  text: string,
  msg: InboundMessage
) {
  switch (state.step) {
    case STEPS.WELCOME:
      await sendWelcome(state, fromPhone, contactName);
      break;

    case STEPS.CONSENT:
      await handleConsent(state, fromPhone, contactName, text);
      break;

    case STEPS.IDENTITY_VERIFY:
      await handleIdentityVerify(state, fromPhone, contactName, text);
      break;

    case STEPS.EMPLOYMENT_STATUS:
      await handleEmploymentStatus(state, fromPhone, contactName, text);
      break;

    case STEPS.EMPLOYER_DETAILS:
      await handleEmployerDetails(state, fromPhone, contactName, text);
      break;

    case STEPS.ROLE_DETAILS:
      await handleRoleDetails(state, fromPhone, contactName, text);
      break;

    case STEPS.SALARY_RANGE:
      await handleSalaryRange(state, fromPhone, contactName, text);
      break;

    case STEPS.JOB_SATISFACTION:
      await handleJobSatisfaction(state, fromPhone, contactName, text);
      break;

    case STEPS.TRAINING_RELEVANCE:
      await handleTrainingRelevance(state, fromPhone, contactName, text);
      break;

    case STEPS.SKILL_GAPS:
      await handleSkillGaps(state, fromPhone, contactName, text);
      break;

    case STEPS.ADDITIONAL_TRAINING:
      await handleAdditionalTraining(state, fromPhone, contactName, text);
      break;

    case STEPS.CAREER_GOALS:
      await handleCareerGoals(state, fromPhone, contactName, text);
      break;

    case STEPS.CHALLENGES:
      await handleChallenges(state, fromPhone, contactName, text);
      break;

    case STEPS.RECOMMENDATIONS:
      await handleRecommendations(state, fromPhone, contactName, text);
      break;

    case STEPS.COMPLETE:
      await sendWelcome(state, fromPhone, contactName); // Restart
      break;

    default:
      await sendWelcome(state, fromPhone, contactName);
  }
}

async function sendWelcome(state: ConversationState, fromPhone: string, contactName: string) {
  state.step = STEPS.CONSENT;
  state.data = {};

  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: WELCOME_MESSAGE.replace("{name}", contactName),
  });

  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: CONSENT_MESSAGE,
    options: CONSENT_BUTTONS,
  });
}

async function handleConsent(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  // Idempotency: consent already processed — never re-send the same step
  if (state.step !== STEPS.CONSENT || state.data.traineeId) {
    return;
  }

  if (text === "consent_no" || text.includes("no")) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "No problem! Thank you for your time. You can type *START* anytime to participate later. 🙏",
    });
    conversationStore.delete(fromPhone);
    return;
  }

  state.step = STEPS.IDENTITY_VERIFY;

  const trainee = await db.trainee.findFirst({
    where: { phoneE164: fromPhone },
    include: { enrolments: { include: { cohort: { include: { programme: true } } } } },
  });

  if (trainee) {
    // Consent given via WhatsApp — record it (this is the source of truth)
    await db.trainee.update({
      where: { id: trainee.id },
      data: { consentGiven: true, consentGivenAt: new Date(), consentMethod: "WHATSAPP" },
    });

    const enrolment = trainee.enrolments[0];
    const programmeName = enrolment?.cohort?.programme?.name ?? "PMKVY Training";
    const cohortName = enrolment?.cohort?.name ?? "Your Batch";
    
    state.data.traineeId = trainee.id;
    state.data.programme = programmeName;
    state.data.cohort = cohortName;

    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: IDENTITY_VERIFY_MESSAGE
        .replace("{name}", trainee.fullName)
        .replace("{phone}", fromPhone)
        .replace("{programme}", programmeName)
        .replace("{cohort}", cohortName),
      options: IDENTITY_BUTTONS,
    });
  } else {
    state.data.traineeId = null;
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "We couldn't find your training record. Let's continue anyway! 📝\n\n" + EMPLOYMENT_STATUS_MESSAGE,
      options: EMPLOYMENT_BUTTONS,
    });
    state.step = STEPS.EMPLOYMENT_STATUS;
  }
}

async function handleIdentityVerify(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  if (text === "identity_no" || text.includes("no")) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "No worries! Let's continue with the survey anyway. 📝\n\n" + EMPLOYMENT_STATUS_MESSAGE,
      options: EMPLOYMENT_BUTTONS,
    });
    state.step = STEPS.EMPLOYMENT_STATUS;
    state.data.traineeId = null;
    return;
  }

  state.step = STEPS.EMPLOYMENT_STATUS;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: EMPLOYMENT_STATUS_MESSAGE,
    options: EMPLOYMENT_BUTTONS,
  });
}

async function handleEmploymentStatus(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = EMPLOYMENT_BUTTONS.map(b => b.value);
  if (!validOptions.includes(text) && !/^[1-6]$/.exec(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: EMPLOYMENT_BUTTONS,
    });
    return;
  }

  const statusMap: Record<string, string> = {
    "1": "employed_full", "employed_full": "employed_full",
    "2": "employed_part", "employed_part": "employed_part",
    "3": "self_employed", "self_employed": "self_employed",
    "4": "apprentice", "apprentice": "apprentice",
    "5": "looking", "looking": "looking",
    "6": "not_working", "not_working": "not_working",
  };
  state.data.employmentStatus = statusMap[text] ?? text;

  if (["looking", "not_working"].includes(state.data.employmentStatus)) {
    state.step = STEPS.TRAINING_RELEVANCE;
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: TRAINING_RELEVANCE_MESSAGE,
      options: RELEVANCE_BUTTONS,
    });
  } else {
    state.step = STEPS.EMPLOYER_DETAILS;
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: EMPLOYER_DETAILS_MESSAGE,
    });
  }
}

async function handleEmployerDetails(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  if (text.length < 2) {
    await sendKapsoMessage({ toPhoneE164: fromPhone, text: "Please enter a valid employer name." });
    return;
  }
  state.data.employerName = text;
  state.step = STEPS.ROLE_DETAILS;
  await sendKapsoMessage({ toPhoneE164: fromPhone, text: ROLE_DETAILS_MESSAGE });
}

async function handleRoleDetails(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  if (text.length < 2) {
    await sendKapsoMessage({ toPhoneE164: fromPhone, text: "Please enter a valid role/title." });
    return;
  }
  state.data.role = text;
  state.step = STEPS.SALARY_RANGE;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: SALARY_RANGE_MESSAGE,
    options: SALARY_BUTTONS,
  });
}

async function handleSalaryRange(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = SALARY_BUTTONS.map(b => b.value);
  if (!validOptions.includes(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: SALARY_BUTTONS,
    });
    return;
  }
  state.data.salaryRange = text;
  state.step = STEPS.JOB_SATISFACTION;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: JOB_SATISFACTION_MESSAGE,
    options: SATISFACTION_BUTTONS,
  });
}

async function handleJobSatisfaction(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = SATISFACTION_BUTTONS.map(b => b.value);
  if (!validOptions.includes(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: SATISFACTION_BUTTONS,
    });
    return;
  }
  state.data.jobSatisfaction = text;
  state.step = STEPS.TRAINING_RELEVANCE;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: TRAINING_RELEVANCE_MESSAGE,
    options: RELEVANCE_BUTTONS,
  });
}

async function handleTrainingRelevance(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = RELEVANCE_BUTTONS.map(b => b.value);
  if (!validOptions.includes(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: RELEVANCE_BUTTONS,
    });
    return;
  }
  state.data.trainingRelevance = text;
  state.step = STEPS.SKILL_GAPS;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: SKILL_GAPS_MESSAGE,
    options: SKILL_GAP_OPTIONS,
  });
}

async function handleSkillGaps(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = SKILL_GAP_OPTIONS.map(b => b.value);
  if (!validOptions.includes(text) && text !== "gap_none") {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select from the options above 👆",
      options: SKILL_GAP_OPTIONS,
    });
    return;
  }
  state.data.skillGaps ??= [];
  if (text === "gap_none") {
    state.data.skillGaps = ["none"];
  } else if (!state.data.skillGaps.includes(text)) {
    state.data.skillGaps.push(text);
  }

  if (state.data.skillGaps.includes("none") || state.data.skillGaps.length >= 3) {
    state.step = STEPS.ADDITIONAL_TRAINING;
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: ADDITIONAL_TRAINING_MESSAGE,
      options: TRAINING_OPTIONS,
    });
  } else {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: `Got it! (${state.data.skillGaps.length}/3) Select more or type *DONE* to continue.`,
        options: SKILL_GAP_OPTIONS.filter(o => !(state.data.skillGaps ?? []).includes(o.value)),
    });
  }
}

async function handleAdditionalTraining(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = TRAINING_OPTIONS.map(b => b.value);
  if (!validOptions.includes(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: TRAINING_OPTIONS,
    });
    return;
  }
  state.data.additionalTraining = text;
  state.step = STEPS.CAREER_GOALS;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: CAREER_GOALS_MESSAGE,
    options: GOALS_OPTIONS,
  });
}

async function handleCareerGoals(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = GOALS_OPTIONS.map(b => b.value);
  if (!validOptions.includes(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: GOALS_OPTIONS,
    });
    return;
  }
  state.data.careerGoals = text;
  state.step = STEPS.CHALLENGES;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: CHALLENGES_MESSAGE,
    options: CHALLENGES_OPTIONS,
  });
}

async function handleChallenges(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = CHALLENGES_OPTIONS.map(b => b.value);
  if (!validOptions.includes(text) && text !== "challenge_none") {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select from the options above 👆",
      options: CHALLENGES_OPTIONS,
    });
    return;
  }
  state.data.challenges ??= [];
  if (text === "challenge_none") {
    state.data.challenges = ["none"];
  } else if (!state.data.challenges.includes(text)) {
    state.data.challenges.push(text);
  }

  if (state.data.challenges.includes("none") || state.data.challenges.length >= 3) {
    state.step = STEPS.RECOMMENDATIONS;
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: RECOMMENDATIONS_MESSAGE,
      options: RECOMMENDATIONS_OPTIONS,
    });
  } else {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: `Got it! (${state.data.challenges.length}/3) Select more or type *DONE* to continue.`,
        options: CHALLENGES_OPTIONS.filter(o => !(state.data.challenges ?? []).includes(o.value)),
    });
  }
}

async function handleRecommendations(state: ConversationState, fromPhone: string, contactName: string, text: string) {
  const validOptions = RECOMMENDATIONS_OPTIONS.map(b => b.value);
  if (!validOptions.includes(text)) {
    await sendKapsoMessage({
      toPhoneE164: fromPhone,
      text: "Please select one of the options above 👆",
      options: RECOMMENDATIONS_OPTIONS,
    });
    return;
  }
  state.data.recommendations = text;

  await saveSurveyResponse(fromPhone, state.data);
  state.step = STEPS.COMPLETE;
  await sendKapsoMessage({
    toPhoneE164: fromPhone,
    text: COMPLETE_MESSAGE.replace("{name}", contactName),
    addCareerGuidance: false,
  });

  conversationStore.delete(fromPhone);
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
        trainingRelevance: data.trainingRelevance,
        skillGaps: data.skillGaps,
        additionalTraining: data.additionalTraining,
        careerGoals: data.careerGoals,
        challenges: data.challenges,
        recommendations: data.recommendations,
        completedAt: new Date(),
      },
    });
    console.log("[SURVEY] Saved response for", phone);
  } catch (err) {
    console.error("[SURVEY] Save error:", err);
  }
}

export function getConversationState(phone: string): ConversationState | undefined {
  return conversationStore.get(phone);
}

export function resetConversation(phone: string) {
  conversationStore.delete(phone);
}

/**
 * Triggers the welcome + consent WhatsApp flow for a phone number.
 * Called after a trainee logs in (magic link verified) — consent is
 * then captured by the conversation itself and recorded in the DB.
 */
export async function startConversation(fromPhoneE164: string, contactName: string) {
  const state: ConversationState = { step: STEPS.CONSENT, data: {} };
  conversationStore.set(fromPhoneE164, state);

  try {
    await sendKapsoMessage({
      toPhoneE164: fromPhoneE164,
      text: WELCOME_MESSAGE.replace("{name}", contactName),
    });
    await sendKapsoMessage({
      toPhoneE164: fromPhoneE164,
      text: CONSENT_MESSAGE,
      options: CONSENT_BUTTONS,
    });
  } catch (err) {
    console.error("[BOT] Failed to start conversation:", err);
    conversationStore.delete(fromPhoneE164);
  }
}