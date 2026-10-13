import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { buildCertificateKey, validateCertificateFile } from "~/server/certificates";
import { isStorageConfigured, uploadCertificateFile, deleteCertificateObject } from "~/server/storage";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { certificateDateSchema, serializeCertificate } from "./_utils";

export const dynamic = "force-dynamic";

/**
 * Trainee certificates (T2, provenance-only model per ADR-003): GET lists the
 * session trainee's own certificates newest-first; POST accepts
 * multipart/form-data (file + fields), uploads to the private certificates
 * bucket and creates a SELF_REPORTED / VERIFIED row — live immediately, no
 * review step. Uploaded files are PDF/JPG/PNG ≤ 1 MB;
 * storage is env-gated — without SUPABASE_URL + SERVICE_ROLE_KEY uploads
 * report STORAGE_NOT_CONFIGURED (503).
 */

const certificateFormSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    issuer: z.string().trim().min(2).max(120),
    issueDate: certificateDateSchema,
    // Multipart gives null (field absent) or "" (empty input) — both mean "no expiry".
    expiryDate: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      certificateDateSchema.optional()
    ),
  })
  .refine((v) => !v.expiryDate || v.expiryDate >= v.issueDate, {
    message: "Expiry date must be on or after the issue date",
  });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }

    const certificates = await db.certificate.findMany({
      where: { traineeId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ certificates: certificates.map(serializeCertificate) });
  } catch (error) {
    console.error("GET /api/v1/trainee/certificates error:", error);
    return routeErrorResponse("Failed to fetch certificates", error);
  }
}

export async function POST(request: NextRequest) {
  let uploadedKey: string | null = null;
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    if (!isStorageConfigured()) {
      return createErrorResponse(
        "STORAGE_NOT_CONFIGURED",
        "Certificate storage is not configured — uploads are unavailable right now",
        503
      );
    }

    const formData = await request.formData();
    const data = certificateFormSchema.parse({
      name: formData.get("name"),
      issuer: formData.get("issuer"),
      issueDate: formData.get("issueDate"),
      expiryDate: formData.get("expiryDate"),
    });

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return createErrorResponse("VALIDATION_ERROR", "file: A certificate file is required", 400);
    }
    const fileCheck = validateCertificateFile(file.type, file.size);
    if (!fileCheck.ok) {
      return createErrorResponse("VALIDATION_ERROR", fileCheck.reason, 400);
    }

    // Upload first, then the row — if the row fails, roll the object back
    // best-effort so no orphan file is left behind.
    uploadedKey = buildCertificateKey(traineeId, file.type);
    const bytes = Buffer.from(await file.arrayBuffer());
    await uploadCertificateFile(uploadedKey, bytes, file.type);

    const certificate = await db.certificate.create({
      data: {
        traineeId,
        name: data.name,
        issuer: data.issuer,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        fileKey: uploadedKey,
        source: "SELF_REPORTED",
        status: "VERIFIED",
      },
    });

    await db.auditEvent.create({
      data: {
        entityType: "certificate",
        entityId: certificate.id,
        action: "CERTIFICATE_UPLOADED",
        actorType: "TRAINEE",
        actorId: traineeId,
        metadata: { certificateId: certificate.id },
      },
    });

    return NextResponse.json({ certificate: serializeCertificate(certificate) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    if (uploadedKey) {
      await deleteCertificateObject(uploadedKey).catch((cleanupError) => {
        console.error("POST /api/v1/trainee/certificates rollback failed:", cleanupError);
      });
    }
    console.error("POST /api/v1/trainee/certificates error:", error);
    return routeErrorResponse("Failed to upload certificate", error);
  }
}
