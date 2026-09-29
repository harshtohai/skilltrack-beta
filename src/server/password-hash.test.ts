import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password-hash";

describe("hashPassword", () => {
  it("produces the scrypt:<saltHex>:<hashHex> format", () => {
    const parts = hashPassword("employer123").split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("scrypt");
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/); // 16-byte salt
    expect(parts[2]).toMatch(/^[0-9a-f]{128}$/); // 64-byte key
  });

  it("is salted — the same password hashes differently each time", () => {
    expect(hashPassword("employer123")).not.toBe(hashPassword("employer123"));
  });
});

describe("verifyPassword", () => {
  it("round-trips a hashed password", () => {
    expect(verifyPassword("employer123", hashPassword("employer123"))).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(verifyPassword("wrong-password", hashPassword("employer123"))).toBe(false);
  });

  it("rejects malformed stored formats without throwing", () => {
    expect(verifyPassword("employer123", "")).toBe(false);
    expect(verifyPassword("employer123", "plain-hash-no-prefix")).toBe(false);
    expect(verifyPassword("employer123", "md5:abc123")).toBe(false);
    expect(verifyPassword("employer123", "scrypt:only-two-parts")).toBe(false);
    expect(verifyPassword("employer123", "scrypt:zzzz:abcd")).toBe(false); // invalid hex salt
  });
});
