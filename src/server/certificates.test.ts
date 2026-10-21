import { describe, expect, it } from "vitest";
import { buildCertificateKey, CERT_MAX_BYTES, validateCertificateFile } from "./certificates";

describe("validateCertificateFile", () => {
  it("accepts pdf/jpeg/png within 1 MB", () => {
    expect(validateCertificateFile("application/pdf", 1024)).toEqual({ ok: true });
    expect(validateCertificateFile("image/jpeg", CERT_MAX_BYTES)).toEqual({ ok: true });
    expect(validateCertificateFile("image/png", 1)).toEqual({ ok: true });
  });

  it("rejects other mime types", () => {
    expect(validateCertificateFile("application/zip", 100).ok).toBe(false);
    expect(validateCertificateFile("image/webp", 100).ok).toBe(false);
  });

  it("rejects empty and oversized files", () => {
    expect(validateCertificateFile("application/pdf", 0).ok).toBe(false);
    expect(validateCertificateFile("application/pdf", CERT_MAX_BYTES + 1).ok).toBe(false);
  });
});

describe("buildCertificateKey", () => {
  it("namespaces by trainee and keeps the mime extension", () => {
    const key = buildCertificateKey("tr-1", "application/pdf");
    expect(key).toMatch(/^trainees\/tr-1\/[0-9a-f-]+\.pdf$/);
    expect(buildCertificateKey("tr-1", "image/png")).toMatch(/\.png$/);
    expect(buildCertificateKey("tr-1", "image/jpeg")).toMatch(/\.jpg$/);
  });

  it("generates unique keys", () => {
    expect(buildCertificateKey("tr-1", "application/pdf")).not.toBe(buildCertificateKey("tr-1", "application/pdf"));
  });
});
