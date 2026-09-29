import crypto from "crypto";

// Employer (F25) credential hashing. Stored format: `scrypt:<saltHex>:<hashHex>`
// — a 16-byte random salt (stored hex) and a 64-byte scryptSync key.
//
// Two salt interpretations exist and verifyPassword tolerates both:
// - canonical (seed + hashPassword): the hex STRING is passed to scryptSync,
//   so the salt bytes are the ASCII of the hex chars;
// - tolerated: the salt hex is decoded to bytes before scryptSync.
// Verification is constant-time on the hash portion only, so the salt never
// participates in a timing comparison.

const SALT_BYTES = 16;
const KEY_BYTES = 64;

/** Hash `password` into the `scrypt:<saltHex>:<hashHex>` storage format. */
export function hashPassword(password: string): string {
  const saltHex = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = crypto.scryptSync(password, saltHex, KEY_BYTES);
  return `scrypt:${saltHex}:${hash.toString("hex")}`;
}

/**
 * Verify `password` against a stored `scrypt:<saltHex>:<hashHex>` hash.
 * Tolerates both salt interpretations (hex string passed to scryptSync —
 * the canonical format — and hex-decoded salt bytes). Malformed stored
 * formats (wrong prefix, bad hex, empty parts) return false instead of
 * throwing.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const saltHex = parts[1] ?? "";
  const expected = Buffer.from(parts[2] ?? "", "hex");
  if (saltHex.length === 0 || expected.length === 0) return false;

  // Canonical: scryptSync received the salt as the hex string.
  const fromHexString = crypto.scryptSync(password, saltHex, expected.length);
  if (crypto.timingSafeEqual(fromHexString, expected)) return true;

  // Tolerated: scryptSync received the hex-decoded salt bytes.
  const salt = Buffer.from(saltHex, "hex");
  if (salt.length === 0) return false;
  const fromBytes = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(fromBytes, expected);
}
