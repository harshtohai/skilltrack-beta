import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse } from "~/app/api/v1/_utils";
import { resolveCertificateFileUrl, StorageNotConfiguredError } from "~/server/certificate-actions";

export const dynamic = "force-dynamic";

/**
 * Employer view of an applicant's certificate file (issue #111): 302 to a
 * short-lived signed storage URL or the recorded external link. Scoped to the
 * employer's own applicants — the certificate's trainee must hold an
 * application on a job the session employer owns (admin may peek, mirroring
 * the employer routes' role sets).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return createErrorResponse("UNAUTHORIZED", "Session required", 401);

    const isEmployer = session.user.role === "employer";
    const isAdmin = session.user.role === "admin";
    if (!isEmployer && !isAdmin) {
      return createErrorResponse("FORBIDDEN", "Employer role required", 403);
    }

    const parsedId = z.object({ certificateId: z.string().uuid() }).safeParse({
      certificateId: (await params).certificateId,
    });
    if (!parsedId.success) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    const certificate = await db.certificate.findUnique({
      where: { id: parsedId.data.certificateId },
      select: { traineeId: true, fileKey: true, fileUrl: true },
    });
    if (!certificate) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    if (isEmployer) {
      // The certificate's trainee must have applied to one of this employer's jobs.
      const application = await db.jobApplication.findFirst({
        where: { traineeId: certificate.traineeId, jobPosting: { employerId: session.user.id } },
        select: { id: true },
      });
      console.error("[EMP-CERT-DEBUG]", JSON.stringify({ sessionId: session.user.id, traineeId: certificate.traineeId, found: application?.id ?? null }));
      if (!application) {
        return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
      }
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
    console.error("GET /api/v1/employer/certificates/[certificateId]/file error:", error);
    return routeErrorResponse("Failed to open certificate file", error);
  }
}
