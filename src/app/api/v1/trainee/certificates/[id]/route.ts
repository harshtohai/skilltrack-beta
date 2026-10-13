import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { deleteCertificateObject } from "~/server/storage";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { certificateDateSchema, serializeCertificate } from "../_utils";

export const dynamic = "force-dynamic";

/**
 * Own-certificate lifecycle (T2, provenance-only per ADR-003): PATCH edits
 * name/issuer/dates of the trainee's own SELF_REPORTED certificate (any time —
 * no review gate); ISSUED certificates are the institute's record and stay
 * immutable. DELETE removes an owned SELF_REPORTED certificate (best-effort
 * storage cleanup). Both are trainee-scoped (another trainee's id is a 404)
 * and audit-logged.
 */

const certificateIdParamSchema = z.object({ id: z.string().uuid() });

const certificatePatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  issuer: z.string().trim().min(2).max(120).optional(),
  issueDate: certificateDateSchema.optional(),
  expiryDate: certificateDateSchema.nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const parsedId = certificateIdParamSchema.safeParse({ id: (await params).id });
    if (!parsedId.success) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    const data = certificatePatchSchema.parse((await request.json()) as unknown);
    if (Object.keys(data).length === 0) {
      return createErrorResponse("VALIDATION_ERROR", "No editable fields provided", 400);
    }

    const certificate = await db.certificate.findUnique({ where: { id: parsedId.data.id } });
    if (certificate?.traineeId !== traineeId) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }
    if (certificate.source !== "SELF_REPORTED") {
      return createErrorResponse(
        "CERTIFICATE_IMMUTABLE",
        "Institute-issued certificates can't be edited",
        409
      );
    }

    // Dates merge with the existing row, so validate the pair post-merge.
    const issueDate = data.issueDate ? new Date(data.issueDate) : certificate.issueDate;
    const expiryDate =
      data.expiryDate === undefined ? certificate.expiryDate : data.expiryDate ? new Date(data.expiryDate) : null;
    if (expiryDate && expiryDate < issueDate) {
      return createErrorResponse("VALIDATION_ERROR", "Expiry date must be on or after the issue date", 400);
    }

    const updated = await db.certificate.update({
      where: { id: certificate.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.issuer !== undefined && { issuer: data.issuer }),
        issueDate,
        expiryDate,
      },
    });

    await db.auditEvent.create({
      data: {
        entityType: "certificate",
        entityId: updated.id,
        action: "CERTIFICATE_UPDATED",
        actorType: "TRAINEE",
        actorId: traineeId,
        metadata: { certificateId: updated.id },
      },
    });

    return NextResponse.json({ certificate: serializeCertificate(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("PATCH /api/v1/trainee/certificates/[id] error:", error);
    return routeErrorResponse("Failed to update certificate", error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const parsedId = certificateIdParamSchema.safeParse({ id: (await params).id });
    if (!parsedId.success) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    const certificate = await db.certificate.findUnique({ where: { id: parsedId.data.id } });
    if (certificate?.traineeId !== traineeId) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }
    if (certificate.source !== "SELF_REPORTED") {
      return createErrorResponse(
        "CERTIFICATE_IMMUTABLE",
        "Institute-issued certificates can't be deleted",
        409
      );
    }

    await db.certificate.delete({ where: { id: certificate.id } });

    // The row is gone; a storage failure here only leaves an orphan object.
    if (certificate.fileKey) {
      await deleteCertificateObject(certificate.fileKey).catch((error) => {
        console.error("DELETE /api/v1/trainee/certificates/[id] storage cleanup failed:", error);
      });
    }

    await db.auditEvent.create({
      data: {
        entityType: "certificate",
        entityId: certificate.id,
        action: "CERTIFICATE_DELETED",
        actorType: "TRAINEE",
        actorId: traineeId,
        metadata: { certificateId: certificate.id, name: certificate.name },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/v1/trainee/certificates/[id] error:", error);
    return routeErrorResponse("Failed to delete certificate", error);
  }
}
