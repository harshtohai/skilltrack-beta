import { db } from "~/server/db";
import { buildCertificateKey, validateCertificateFile } from "~/server/certificates";
import { isStorageConfigured, signCertificateUrl, uploadCertificateFile } from "~/server/storage";

/**
 * Certificate domain actions (ADR-003, provenance-only model): SELF_REPORTED
 * certificates are born VERIFIED and live immediately — there is no review
 * step. ISSUED certificates carry the institute's authority. Every state
 * change writes an audit event.
 */

export class CertificateActionError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Thrown when a fileKey exists but storage is not configured (503). */
export class StorageNotConfiguredError extends Error {}

/**
 * Institute-scoping gate (INST-01) shared by every certificate route: loads
 * the trainee by publicId and checks centre scope for the institute role
 * (admin is unscoped). Throws CertificateActionError NOT_FOUND / FORBIDDEN —
 * routes catch it via the standard CertificateActionError handler.
 */
export async function getTraineeInCertificateScope(publicId: string, role: string, centerId: string | null) {
  const trainee = await db.trainee.findUnique({
    where: { publicId },
    include: { enrolments: { include: { cohort: true } } },
  });
  if (!trainee) throw new CertificateActionError("NOT_FOUND", "Trainee not found", 404);
  if (role === "institute") {
    const inScope = trainee.enrolments.some((e) => e.cohort.trainingCenterId === centerId);
    if (!inScope) {
      throw new CertificateActionError("FORBIDDEN", "This trainee is not enrolled in your center's cohorts", 403);
    }
  }
  return trainee;
}

export async function issueCertificate(input: {
  traineeId: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date | null;
  file?: { bytes: Buffer; mimeType: string } | null;
  actorRole: "admin" | "institute";
  actorId: string;
}) {
  let fileKey: string | null = null;
  if (input.file) {
    if (!isStorageConfigured()) {
      throw new CertificateActionError(
        "STORAGE_NOT_CONFIGURED",
        "Certificate storage is not configured — attach the file later or ask the operator to set the storage keys.",
        503
      );
    }
    const check = validateCertificateFile(input.file.mimeType, input.file.bytes.length);
    if (!check.ok) throw new CertificateActionError("INVALID_FILE", check.reason, 400);
    fileKey = buildCertificateKey(input.traineeId, input.file.mimeType);
    await uploadCertificateFile(fileKey, input.file.bytes, input.file.mimeType);
  }

  const certificate = await db.certificate.create({
    data: {
      traineeId: input.traineeId,
      name: input.name,
      issuer: input.issuer,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate ?? null,
      fileKey,
      source: "ISSUED",
      status: "VERIFIED",
      reviewedAt: new Date(),
      reviewedBy: input.actorId,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "Certificate",
      entityId: certificate.id,
      action: "CERTIFICATE_ISSUED",
      actorType: input.actorRole === "admin" ? "ADMIN" : "SYSTEM",
      actorId: input.actorId,
      metadata: { traineeId: input.traineeId, name: input.name, issuer: input.issuer, role: input.actorRole },
    },
  });

  return certificate;
}

/**
 * Shared file-resolution for the file routes (trainee, institute/admin and
 * employer): fileKey → short-lived signed storage URL; else the recorded
 * external link; null when the certificate has no file. Throws
 * StorageNotConfiguredError for an orphaned fileKey so each route can answer 503.
 */
export async function resolveCertificateFileUrl(certificate: {
  fileKey: string | null;
  fileUrl: string | null;
}): Promise<string | null> {
  if (certificate.fileKey) {
    if (!isStorageConfigured()) throw new StorageNotConfiguredError();
    return signCertificateUrl(certificate.fileKey);
  }
  if (certificate.fileUrl) {
    try {
      return new URL(certificate.fileUrl).toString();
    } catch {
      // Malformed stored link — treated as no file.
      return null;
    }
  }
  return null;
}
