/**
 * Branding flavors — one codebase, two faces.
 *
 * NEXT_PUBLIC_BRANDING = "maharashtra" → the SIH 2026 demo flavor (Government
 * of Maharashtra / MSSDS / PMKVY attribution, maharashtra.gov.in demo login).
 * Unset or "default" → neutral SkillsTrack copy.
 *
 * Both flavors ship the same features; new user-facing copy that differs per
 * flavor goes through this module. Per-project login credentials stay
 * env-driven (ADMIN_EMAIL / INSTITUTE_EMAIL) — the demo hints below must
 * match the env of the deployment rendering them.
 */

export type BrandingFlavor = "maharashtra" | "default";

type BotReplacements = Partial<Record<"en" | "hi" | "mr", Array<[string, string]>>>;

const flavor: BrandingFlavor =
  process.env.NEXT_PUBLIC_BRANDING === "maharashtra" ? "maharashtra" : "default";

/**
 * WhatsApp bot copy patches for the maharashtra flavor: exact substring
 * replacements applied to the (neutral) message templates at module load.
 * Harvested from the de-branding diff (commit 3d22c5f) — find = pre-de-brand
 * text, replace = neutral text. A pair matching nothing is a bug —
 * applyBotReplacements (messages/index.ts) warns loudly.
 */
/**
 * WhatsApp bot copy patches for the maharashtra flavor: exact substring
 * replacements applied to the (neutral) message templates at module load —
 * neutral → branded, the inverse of the de-branding diff (commit 3d22c5f).
 * Anchored on longer phrases where short substrings could collide. A pair
 * matching nothing is a bug — applyBotReplacements (messages/index.ts) warns.
 */
const MAHARASHTRA_BOT_REPLACEMENTS: BotReplacements = {
  en: [
    [
      "career guidance platform.",
      "career guidance platform by the *Maharashtra State Skill Development Society (MSSDS)* under the *Pradhan Mantri Kaushal Vikas Yojana (PMKVY)*.",
    ],
    ["your training", "your PMKVY training"],
    ["Your Suggestions for the Programme", "Your Suggestions for PMKVY"],
    ["for thousands of students", "for thousands of students across Maharashtra"],
    ["goes to the programme team for improvements", "goes to MSSDS & NSDC for program improvements"],
    ["building a skilled future", "building a skilled Maharashtra"],
    ["— Team SkillsTrack", "— Team SkillsTrack (MSSDS / PMKVY)"],
  ],
  hi: [
    [
      "आधिकारिक प्लेसमेंट ट्रैकिंग व करियर मार्गदर्शन प्लेटफ़ॉर्म।",
      "महाराष्ट्र राज्य स्किल डेवलपमेंट सोसाइटी (MSSDS) का आधिकारिक प्लेसमेंट ट्रैकिंग व करियर मार्गदर्शन प्लेटफ़ॉर्म, प्रधानमंत्री कौशल विकास योजना (PMKVY) के अंतर्गत।",
    ],
    ["आपकी ट्रेनिंग,", "आपकी PMKVY ट्रेनिंग,"],
    ["प्रोग्राम के लिए आपके सुझाव", "PMKVY के लिए आपके सुझाव"],
    ["हज़ारों छात्रों", "महाराष्ट्र के हज़ारों छात्रों"],
    ["प्रोग्राम टीम तक जाएगी", "MSSDS व NSDC तक जाएगी"],
    ["एक कुशल भविष्य", "एक कुशल महाराष्ट्र"],
    ["— टीम SkillsTrack", "— टीम SkillsTrack (MSSDS / PMKVY)"],
  ],
  mr: [
    [
      "अधिकृत प्लेसमेंट ट्रॅकिंग व करिअर मार्गदर्शन प्लॅटफॉर्म.",
      "महाराष्ट्र राज्य कौशल्य विकास सोसायटी (MSSDS) चे अधिकृत प्लेसमेंट ट्रॅकिंग व करिअर मार्गदर्शन प्लॅटफॉर्म, प्रधानमंत्री कौशल्य विकास योजना (PMKVY) अंतर्गत.",
    ],
    ["तुमची ट्रेनिंग तुमच्या", "तुमची PMKVY ट्रेनिंग तुमच्या"],
    ["प्रोग्रामसाठी तुमचे सुझाव", "PMKVY साठी तुमचे सुझाव"],
    ["हजारो विद्यार्थ्यांची", "महाराष्ट्रातील हजारो विद्यार्थ्यांची"],
    ["प्रोग्राम टीमकडे जाईल", "MSSDS व NSDC कडे जाईल"],
    ["एक कुशल भविष्य", "एक कुशल महाराष्ट्र"],
    ["— टीम SkillsTrack", "— टीम SkillsTrack (MSSDS / PMKVY)"],
  ],
};

export const branding = {
  flavor,
  heroBadge:
    flavor === "maharashtra"
      ? "Government of Maharashtra | SIH 2026 Problem statement 26135"
      : "Consent-based skilling outcomes platform",
  footerTagline:
    flavor === "maharashtra"
      ? "Longitudinal skilling outcomes platform for Maharashtra. Built for SIH 2026 PS-26135."
      : "Longitudinal skilling outcomes platform — from training to verified employment.",
  copyright:
    flavor === "maharashtra"
      ? "© 2026 SkillsTrack. Government of Maharashtra — Maharashtra State Innovation Society."
      : "© 2026 SkillsTrack.",
  privacyContact:
    flavor === "maharashtra"
      ? "Trainees: start with your training institute. Institutes, employers and government administrators: route questions through the programme coordinator. Data protection concerns can be raised with the programme team at the Maharashtra State Innovation Society."
      : "Trainees: start with your training institute. Institutes, employers and administrators: route questions through the programme coordinator. Data protection concerns can be raised through the programme team.",
  signupAttribution:
    flavor === "maharashtra"
      ? "Priya Sharma · PMKVY trainee · Pune"
      : "Priya Sharma · SkillsTrack trainee · Pune",
  demoAdmin:
    flavor === "maharashtra"
      ? "admin@maharashtra.gov.in / admin123"
      : "admin@skilltrack.in / admin123",
  demoInstitute:
    flavor === "maharashtra"
      ? "institute@pmkvy.gov.in / institute123"
      : "institute@skilltrack.in / institute123",
  langPromptTitle:
    flavor === "maharashtra"
      ? "🙏 *SkillsTrack — Maharashtra Skill Development (MSSDS · PMKVY)*"
      : "🙏 *SkillsTrack*",
  botReplacements:
    flavor === "maharashtra" ? MAHARASHTRA_BOT_REPLACEMENTS : ({} as BotReplacements),
};
