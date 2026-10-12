import { z } from "zod";

/**
 * Shared helpers for the trainee certificate routes (T2): the YYYY-MM-DD date
 * schema (native date input / multipart string fields) and the camelCase
 * certificate serializer used by GET/POST/PATCH responses. fileKey never
 * leaves the server — hasFile is the boolean the UI keys off (ADR-002).
 */

/** "YYYY-MM-DD" (native date input) → validated string; parsed to a UTC-midnight Date. */
export const certificateDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid date");

export function serializeCertificate(certificate: {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  source: string;
  status: string;
  rejectionReason: string | null;
  fileKey: string | null;
  fileUrl: string | null;
  reviewedAt: Date | null;
}) {
  return {
    id: certificate.id,
    name: certificate.name,
    issuer: certificate.issuer,
    issueDate: certificate.issueDate.toISOString(),
    expiryDate: certificate.expiryDate?.toISOString() ?? null,
    source: certificate.source,
    status: certificate.status,
    rejectionReason: certificate.rejectionReason,
    hasFile: certificate.fileKey !== null || certificate.fileUrl !== null,
    // External link (legacy/seeded rows); uploaded files go through the
    // signed-URL file route instead — never expose the storage key.
    fileUrl: certificate.fileUrl,
    reviewedAt: certificate.reviewedAt?.toISOString() ?? null,
  };
}
