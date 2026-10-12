import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, routeErrorResponse } from "~/app/api/v1/_utils";
import { CertificateActionError, reviewCertificate, getTraineeInCertificateScope } from "~/server/certificate-actions";
export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  decision: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

/**
 * T3 (spec #102): review a trainee's PENDING self-reported certificate —
 * verify, or reject with a reason. Append-only per ADR-002: review fields are
 * set, history is never rewritten. Institutes may only review their own
 * center's trainees (INST-01); admin is unscoped oversight.
 */
export async function PATCH(
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
    const trainee = await getTraineeInCertificateScope(publicId, scope.role, scope.centerId);

    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return createErrorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const certificate = await reviewCertificate({
      certificateId,
      decision: parsed.data.decision,
      rejectionReason: parsed.data.rejectionReason ?? null,
      actorRole: scope.role,
      actorId: session.user.id,
    });

    return NextResponse.json({
      certificate: { id: certificate.id, status: certificate.status, rejectionReason: certificate.rejectionReason },
    });
  } catch (error) {
    if (error instanceof CertificateActionError) {
      return createErrorResponse(error.code, error.message, error.status);
    }
    console.error("PATCH /api/v1/trainees/[publicId]/certificates/[certificateId] error:", error);
    return routeErrorResponse("Failed to review certificate", error);
  }
}
