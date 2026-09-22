import crypto from "crypto";

const ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY ?? crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  return Buffer.from(ENCRYPTION_KEY, "hex");
}

export function encryptPhone(phoneE164: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  const normalized = phoneE164.replace(/\D/g, "");
  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, encrypted, authTag]).toString("base64");
}

export function decryptPhone(encryptedData: string): string {
  const combined = Buffer.from(encryptedData, "base64");
  
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(-AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, -AUTH_TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return `+91${decrypted.toString("utf8")}`;
}

export function hashPhone(phoneE164: string): string {
  const pepper = process.env.PHONE_HASH_PEPPER ?? "outcometrack-phone-hash-pepper-2024-change-me";
  const normalized = phoneE164.replace(/\D/g, "");
  return crypto.createHmac("sha256", pepper).update(normalized).digest("hex");
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

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}