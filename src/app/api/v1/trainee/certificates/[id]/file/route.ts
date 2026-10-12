import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { isStorageConfigured, signCertificateUrl } from "~/server/storage";
import { routeErrorResponse, createErrorResponse } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * View a certificate file (T2): 302 to a short-lived signed storage URL when
 * the row has an uploaded file, else to the recorded external link. The
 * session trainee's own certificate only — anything else is a 404 so ids
 * aren't enumerable. A fileKey without configured storage is a 503.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const parsedId = z.object({ id: z.string().uuid() }).safeParse({ id: (await params).id });
    if (!parsedId.success) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    const certificate = await db.certificate.findUnique({
      where: { id: parsedId.data.id },
      select: { traineeId: true, fileKey: true, fileUrl: true },
    });
    if (certificate?.traineeId !== traineeId) {
      return createErrorResponse("NOT_FOUND", "Certificate not found", 404);
    }

    if (certificate.fileKey) {
      if (!isStorageConfigured()) {
        return createErrorResponse(
          "STORAGE_NOT_CONFIGURED",
          "Certificate storage is not configured — the file is unavailable right now",
          503
        );
      }
      const signedUrl = await signCertificateUrl(certificate.fileKey);
      return NextResponse.redirect(signedUrl, 302);
    }

    if (certificate.fileUrl) {
      try {
        return NextResponse.redirect(new URL(certificate.fileUrl), 302);
      } catch {
        // Malformed stored link — fall through to the 404 below.
      }
    }

    return createErrorResponse("NOT_FOUND", "Certificate has no file", 404);
  } catch (error) {
    console.error("GET /api/v1/trainee/certificates/[id]/file error:", error);
    return routeErrorResponse("Failed to open certificate file", error);
  }
}
