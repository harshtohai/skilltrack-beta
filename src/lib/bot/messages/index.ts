import { en, type Messages } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";
import { branding } from "~/lib/branding";

export type { Messages };
export type Lang = "en" | "hi" | "mr";

/**
 * Flavor patches (branding.ts): exact substring replacements for the
 * maharashtra flavor. A replacement that matches nothing means the neutral
 * template drifted — say so loudly instead of silently leaking neutral copy.
 */
function applyBotReplacements(m: Messages, reps: Array<[string, string]>): Messages {
  const out = m as unknown as Record<string, string>;
  for (const [find, rep] of reps) {
    let hit = false;
    for (const key of Object.keys(out)) {
      if (typeof out[key] === "string" && out[key].includes(find)) {
        out[key] = out[key].replaceAll(find, rep);
        hit = true;
      }
    }
    if (!hit) console.warn(`[branding] bot replacement matched nothing: "${find.slice(0, 40)}…"`);
  }
  return out as unknown as Messages;
}

export const T: Record<Lang, Messages> = {
  en: branding.botReplacements.en ? applyBotReplacements(en, branding.botReplacements.en) : en,
  hi: branding.botReplacements.hi ? applyBotReplacements(hi, branding.botReplacements.hi) : hi,
  mr: branding.botReplacements.mr ? applyBotReplacements(mr, branding.botReplacements.mr) : mr,
};

export interface Option {
  label: string;
  value: string;
  description?: string;
}

export const LANG_PROMPT = `${branding.langPromptTitle}

*Choose your language / अपनी भाषा चुनें / तुमची भाषा निवडा:*`;

export const LANG_BUTTONS: Option[] = [
  { label: "English", value: "lang_en" },
  { label: "हिन्दी", value: "lang_hi" },
  { label: "मराठी", value: "lang_mr" },
];

export const VALUES = {
  consent: ["consent_yes", "consent_no"],
  identity: ["identity_yes", "identity_no"],
  employment: [
    "employed_full",
    "employed_part",
    "self_employed",
    "apprentice",
    "looking",
    "not_working",
  ],
  salary: [
    "salary_0_10k",
    "salary_10k_15k",
    "salary_15k_25k",
    "salary_25k_40k",
    "salary_40k_60k",
    "salary_60k_100k",
    "salary_100k_plus",
    "salary_prefer_not",
  ],
  satisfaction: ["sat_5", "sat_4", "sat_3", "sat_2", "sat_1"],
  support: [
    "support_job_alerts",
    "support_interview",
    "support_training",
    "support_counselling",
    "support_none",
  ],
  relevance: ["relevance_direct", "relevance_partial", "relevance_basics", "relevance_none"],
  gaps: [
    "gap_technical",
    "gap_communication",
    "gap_analytical",
    "gap_domain",
    "gap_etiquette",
    "gap_financial",
    "gap_none",
  ],
  training: [
    "train_adv_tech",
    "train_cert",
    "train_english",
    "train_entrepreneur",
    "train_leadership",
    "train_digital",
    "train_interview",
    "train_none",
  ],
  goals: [
    "goal_promotion",
    "goal_switch",
    "goal_education",
    "goal_business",
    "goal_abroad",
    "goal_stay",
    "goal_unsure",
  ],
  challenges: [
    "challenge_salary",
    "challenge_growth",
    "challenge_skills",
    "challenge_location",
    "challenge_balance",
    "challenge_culture",
    "challenge_contract",
    "challenge_family",
    "challenge_none",
  ],
  recommendations: [
    "rec_practical",
    "rec_internship",
    "rec_tools",
    "rec_softskills",
    "rec_placement",
    "rec_certs",
    "rec_financial",
    "rec_trainers",
    "rec_good",
  ],
} as const;

export function opts(values: readonly string[], lang: Lang): Option[] {
  const t = T[lang];
  return values.map((v) => ({
    label: t.labels[v] ?? v,
    value: v,
    ...(t.descriptions[v] ? { description: t.descriptions[v] } : {}),
  }));
}
