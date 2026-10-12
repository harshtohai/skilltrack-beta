import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { routeErrorResponse, createErrorResponse } from "~/app/api/v1/_utils";
import { CertificateActionError, resolveCertificateFileUrl, StorageNotConfiguredError } from "~/server/certificate-actions";

export const dynamic = "force-dynamic";

/**
 * Institute/admin view of a certificate's proof file (spec #102 US 24 —
 * "readable only by the owning trainee, their institute, and admin"): 302 to a
 * short-lived signed storage URL or the recorded external link. Institutes are
 * limited to trainees in their own center (INST-01); admin is unscoped.
 */
export async function GET(
  _request: NextRequest,
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

    const certificate = await db.certificate.findUnique({
      where: { id: parsedIds.data.certificateId },
      select: { traineeId: true, fileKey: true, fileUrl: true },
    });
    if (!certificate || certificate.traineeId !== trainee.id) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    try {
      const url = await resolveCertificateFileUrl(certificate);
      if (!url) return createErrorResponse("NOT_FOUND", "Certificate has no file", 404);
      return NextResponse.redirect(url, 302);
    } catch (error) {
      if (error instanceof StorageNotConfiguredError) {
        return createErrorResponse(
          "STORAGE_NOT_CONFIGURED",
          "Certificate storage is not configured — the file is unavailable right now",
          503
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof CertificateActionError) {
      return createErrorResponse(error.code, error.message, error.status);
    }
    console.error("GET /api/v1/trainees/[publicId]/certificates/[certificateId]/file error:", error);
    return routeErrorResponse("Failed to open certificate file", error);
  }
}
