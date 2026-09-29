// Employer (F25) applicants contact masking: everything but the last 4
// digits, e.g. "******1234". Distinct from maskPhoneE164 in ~/lib/utils
// (which keeps the +91 prefix) — the applicants contract masks the full
// number including the country code. Pure, so it stays unit-testable.

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return "*".repeat(digits.length);
  return "*".repeat(digits.length - 4) + digits.slice(-4);
}
