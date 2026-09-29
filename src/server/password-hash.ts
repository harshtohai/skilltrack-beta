import crypto from "crypto";

// Employer (F25) credential hashing. Stored format: `scrypt:<saltHex>:<hashHex>`
// — a 16-byte random salt (stored hex, scryptSync receives the decoded bytes)
// and a 64-byte scryptSync key. Verification is constant-time on the hash
// portion only, so the salt never participates in a timing comparison.

const SALT_BYTES = 16;
const KEY_BYTES = 64;

/** Hash `password` into the `scrypt:<saltHex>:<hashHex>` storage format. */
export function hashPassword(password: string, saltHex?: string): string {
  const salt = saltHex !== undefined ? Buffer.from(saltHex, "hex") : crypto.randomBytes(SALT_BYTES);
  const hash = crypto.scryptSync(password, salt, KEY_BYTES);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify `password` against a stored `scrypt:<saltHex>:<hashHex>` hash.
 * Malformed stored formats (wrong prefix, bad hex, empty parts) return
 * false instead of throwing.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1] ?? "", "hex");
  const expected = Buffer.from(parts[2] ?? "", "hex");
  if (salt.length === 0 || expected.length === 0) return false;
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}
