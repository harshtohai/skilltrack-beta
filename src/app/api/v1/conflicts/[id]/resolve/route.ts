import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const resolveSchema = z.object({
  resolution: z.enum(["CONFIRM", "REJECT"]),
});

/**
 * Bug Bag #16 conflict resolution: an admin decides a CONFLICT claim.
 * CONFIRM sides with the trainee — the claim verifies at
 * EMPLOYER_CONFIRMED. REJECT sides with the employer and voids the claim —
 * the VerificationStatus enum has no REJECTED value, so UNKNOWN is the void
 * bucket (PRD §6: unknown never counts as unemployed or verified). Every
 * decision writes a CONFLICT_RESOLVED audit event.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "Admin session required", 401);
    }
    if (session.user.role !== "admin") {
      return createErrorResponse("FORBIDDEN", "Admin role required", 403);
    }

    const { id } = await params;
    const body = resolveSchema.parse(await request.json());

    const claim = await db.employmentClaim.findUnique({ where: { id } });
    if (!claim) {
      return createErrorResponse("NOT_FOUND", "Claim not found", 404);
    }
    if (claim.verificationStatus !== "CONFLICT") {
      return createErrorResponse(
        "CONFLICT",
        `Claim is already ${claim.verificationStatus.toLowerCase()} — only conflict claims can be resolved`,
        409
      );
    }

    const toStatus = body.resolution === "CONFIRM" ? "EMPLOYER_CONFIRMED" : "UNKNOWN";
    const updated = await db.employmentClaim.update({
      where: { id },
      data: { verificationStatus: toStatus },
      select: { id: true, verificationStatus: true },
    });

    await db.auditEvent.create({
      data: {
        entityType: "employment_claim",
        entityId: id,
        action: "CONFLICT_RESOLVED",
        actorType: "ADMIN",
        actorId: session.user.id,
        metadata: {
          resolution: body.resolution,
          fromStatus: "CONFLICT",
          toStatus,
          traineeId: claim.traineeId,
          employerName: claim.employerName,
        },
      },
    });

    return NextResponse.json({
      claim: {
        id: updated.id,
        verificationStatus: updated.verificationStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/conflicts/[id]/resolve error:", error);
    return routeErrorResponse("Failed to resolve conflict", error);
  }
}
