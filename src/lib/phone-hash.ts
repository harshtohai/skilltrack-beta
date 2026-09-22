import crypto from "crypto";

export function hashPhone(phoneE164: string): string {
  const pepper = process.env.PHONE_HASH_PEPPER ?? "default-pepper-change-in-production";
  const normalized = phoneE164.replace(/\D/g, "");
  return crypto.createHmac("sha256", pepper).update(normalized).digest("hex");
}

export function verifyPhoneHash(phoneE164: string, phoneHash: string): boolean {
  return hashPhone(phoneE164) === phoneHash;
}

export function normalizePhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  return phone;
}