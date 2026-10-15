import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, routeErrorResponse } from "~/app/api/v1/_utils";
import {
  CertificateActionError,
  getTraineeInCertificateScope,
  StorageNotConfiguredError,
} from "~/server/certificate-actions";
import { deleteCertificateObject } from "~/server/storage";
import { sendCertificateRemovedNoticeEmail } from "~/lib/email";

export const dynamic = "force-dynamic";

const removeSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

/**
 * Institute/admin removal of a trainee's SELF_REPORTED certificate (issue
 * #112 — the ADR-003 remediation path): with no review workflow, this is the
 * only way anyone other than the trainee can take down an uploaded
 * certificate. ISSUED certificates are the institute's own record and are
 * removed via the trainee lifecycle, not here. Institute is center-scoped
 * (INST-01), admin unscoped. Audit-logged; the trainee is emailed when they
 * have an address on file.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; certificateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }

    const { publicId, certificateId } = await params;
    const parsedIds = z
      .object({ publicId: z.string().min(1), certificateId: z.string().uuid() })
      .safeParse({ publicId, certificateId });
    if (!parsedIds.success) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    const trainee = await getTraineeInCertificateScope(parsedIds.data.publicId, scope.role, scope.centerId);

    const parsedBody = removeSchema.safeParse(await request.json().catch(() => ({})));
    const reason = parsedBody.success ? (parsedBody.data.reason ?? null) : null;

    const certificate = await db.certificate.findUnique({
      where: { id: parsedIds.data.certificateId },
      select: { id: true, traineeId: true, name: true, source: true, fileKey: true },
    });
    if (certificate?.traineeId !== trainee.id) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }
    if (certificate.source !== "SELF_REPORTED") {
      return createErrorResponse(
        "CERTIFICATE_IMMUTABLE",
        "Institute-issued certificates can't be removed here — they belong to the institute's record",
        409
      );
    }

    await db.certificate.delete({ where: { id: certificate.id } });

    // The row is gone; a storage failure here only leaves an orphan object.
    if (certificate.fileKey) {
      try {
        await deleteCertificateObject(certificate.fileKey);
      } catch (error) {
        if (error instanceof StorageNotConfiguredError) {
          console.error("DELETE removal: storage not configured, skipping object cleanup");
        } else {
          console.error("DELETE removal: storage cleanup failed:", error);
        }
      }
    }

    await db.auditEvent.create({
      data: {
        entityType: "Certificate",
        entityId: certificate.id,
        action: "CERTIFICATE_REMOVED",
        actorType: scope.role === "admin" ? "ADMIN" : "SYSTEM",
        actorId: session.user.id,
        metadata: {
          traineeId: trainee.id,
          certificateName: certificate.name,
          reason,
          role: scope.role,
        },
      },
    });

    if (trainee.email) {
      void sendCertificateRemovedNoticeEmail(trainee.email, trainee.fullName, certificate.name, reason).catch(
        (error) => console.error("Certificate-removal notice failed:", error)
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CertificateActionError) {
      return createErrorResponse(error.code, error.message, error.status);
    }
    console.error("DELETE /api/v1/trainees/[publicId]/certificates/[certificateId] error:", error);
    return routeErrorResponse("Failed to remove certificate", error);
  }
}
