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

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generatePublicId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRN-${timestamp}-${random}`;
}

export function calculateEvidenceLevel(verificationStatus: string): number {
  const levels: Record<string, number> = {
    UNKNOWN: 0,
    SELF_REPORTED: 1,
    PROVIDER_CONFIRMED: 2,
    EMPLOYER_CONFIRMED: 3,
    DOCUMENT_VERIFIED: 4,
    SYSTEM_VERIFIED: 5,
    CONFLICT: 3,
  };
  return levels[verificationStatus] ?? 0;
}