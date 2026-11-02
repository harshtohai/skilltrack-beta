import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge taught the Merivo type scale (§2.1). Without this, custom
 * text sizes (text-caption, text-body-sm, …) are unknown to tailwind-merge,
 * fall into its text-color group, and get DROPPED when merged with any
 * text-color class — e.g. cn("text-caption text-muted-foreground") kept only
 * "text-muted-foreground", rendering descriptions at inherited 16px.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-caption",
        "text-body-sm",
        "text-body",
        "text-title",
        "text-h2",
        "text-h1",
        "text-stat",
        "text-display",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function maskPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 XXXXX ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 XXXXX ${cleaned.slice(7)}`;
  }
  return phone;
}

/** "harsh@example.com" → "h****@example.com" (used where a code was sent). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}

/** Education select options — shared by add-trainee, SkillID confirm and detail. */
export const EDUCATION_LEVELS = [
  { value: "BELOW_10TH", label: "Below 10th" },
  { value: "TENTH", label: "10th pass" },
  { value: "TWELFTH", label: "12th pass" },
  { value: "ITI_DIPLOMA", label: "ITI / Diploma" },
  { value: "GRADUATE", label: "Graduate" },
  { value: "POST_GRADUATE", label: "Post-graduate" },
  { value: "OTHER", label: "Other" },
] as const;

export type EducationLevelValue = (typeof EDUCATION_LEVELS)[number]["value"];

export function educationLabel(value: string | null | undefined): string {
  return EDUCATION_LEVELS.find((e) => e.value === value)?.label ?? "—";
}

/** Real date, 10–100 years before today — the DOB sanity bound at add/link. */
export function isPlausibleDateOfBirth(value: Date): boolean {
  if (Number.isNaN(value.getTime())) return false;
  const ageYears = (Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears >= 10 && ageYears <= 100;
}

export function generatePublicId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRN-${timestamp}-${random}`;
}
