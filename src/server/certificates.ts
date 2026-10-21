export const CERT_ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;
export const CERT_MAX_BYTES = 1024 * 1024; // 1 MB (grilling Q14)

export type CertificateFileCheck = { ok: true } | { ok: false; reason: string };

/** Pure validation rules for a certificate upload (ADR-002: PDF/JPG/PNG, ≤ 1 MB). */
export function validateCertificateFile(mimeType: string, sizeBytes: number): CertificateFileCheck {
  if (!CERT_ALLOWED_MIME.includes(mimeType as (typeof CERT_ALLOWED_MIME)[number])) {
    return { ok: false, reason: "Only PDF, JPG or PNG files are allowed." };
  }
  if (sizeBytes <= 0) {
    return { ok: false, reason: "The file is empty." };
  }
  if (sizeBytes > CERT_MAX_BYTES) {
    return { ok: false, reason: "The file is larger than 1 MB." };
  }
  return { ok: true };
}

/** Object key inside the private `certificates` bucket. */
export function buildCertificateKey(traineeId: string, mimeType: string): string {
  const ext = mimeType === "application/pdf" ? "pdf" : mimeType === "image/png" ? "png" : "jpg";
  return `trainees/${traineeId}/${crypto.randomUUID()}.${ext}`;
}
