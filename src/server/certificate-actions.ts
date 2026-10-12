import { db } from "~/server/db";
import { buildCertificateKey, validateCertificateFile } from "~/server/certificates";
import { isStorageConfigured, uploadCertificateFile } from "~/server/storage";

/**
 * Certificate domain actions shared by the per-trainee and per-cohort flows
 * (ADR-002). ISSUED certificates are born VERIFIED (the issuer is the
 * authority); review decisions append — never overwrite history. Every state
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

export async function reviewCertificate(input: {
  certificateId: string;
  decision: "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  actorRole: "admin" | "institute";
  actorId: string;
}) {
  const certificate = await db.certificate.findUnique({ where: { id: input.certificateId } });
  if (!certificate) throw new CertificateActionError("NOT_FOUND", "Certificate not found", 404);
  if (certificate.status !== "PENDING") {
    throw new CertificateActionError("CERTIFICATE_IMMUTABLE", "Only pending certificates can be reviewed", 409);
  }
  const reason = input.rejectionReason?.trim() ?? "";
  if (input.decision === "REJECTED" && !reason) {
    throw new CertificateActionError("REASON_REQUIRED", "A rejection reason is required", 400);
  }

  const updated = await db.certificate.update({
    where: { id: certificate.id },
    data: {
      status: input.decision,
      rejectionReason: input.decision === "REJECTED" ? reason : null,
      reviewedAt: new Date(),
      reviewedBy: input.actorId,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "Certificate",
      entityId: certificate.id,
      action: "CERTIFICATE_REVIEWED",
      actorType: input.actorRole === "admin" ? "ADMIN" : "SYSTEM",
      actorId: input.actorId,
      metadata: {
        traineeId: certificate.traineeId,
        decision: input.decision,
        rejectionReason: reason || null,
        certificateSource: certificate.source,
        role: input.actorRole,
      },
    },
  });

  return updated;
}
