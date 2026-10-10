import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { routeErrorResponse, createErrorResponse } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * INST-03 drop-out: marks the trainee's ACTIVE enrolment(s) DROPPED_OUT.
 * Portal access is kept and re-enrollment is a fresh add (the unique
 * (traineeId, cohortId) constraint is untouched). Institutes are limited to
 * trainees in their own center (INST-01 scope). Writes a DROPPED_OUT audit
 * event (actorType ADMIN for admins, SYSTEM for institutes — the closest fit
 * in the ActorType enum).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    }
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }
    const { role, centerId } = scope;

    const { publicId } = await params;
    const trainee = await db.trainee.findUnique({
      where: { publicId },
      include: { enrolments: { include: { cohort: true } } },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    if (role === "institute") {
      if (!centerId) {
        return createErrorResponse("FORBIDDEN", "Institute center is not configured", 403);
      }
      const inScope = trainee.enrolments.some((e) => e.cohort.trainingCenterId === centerId);
      if (!inScope) {
        return createErrorResponse(
          "FORBIDDEN",
          "This trainee is not enrolled in your center's cohorts",
          403
        );
      }
    }

    if (!trainee.enrolments.some((e) => e.status === "ACTIVE")) {
      return createErrorResponse("CONFLICT", "Trainee has no active enrolment", 409);
    }

    const updated = await db.enrolment.updateMany({
      where: { traineeId: trainee.id, status: "ACTIVE" },
      data: { status: "DROPPED_OUT" },
    });

    await db.auditEvent.create({
      data: {
        entityType: "Trainee",
        entityId: trainee.id,
        action: "DROPPED_OUT",
        actorType: role === "admin" ? "ADMIN" : "SYSTEM",
        actorId: session.user.id,
        metadata: {
          traineeId: trainee.id,
          enrolmentCount: updated.count,
          role,
        },
      },
    });

    return NextResponse.json({ droppedOut: updated.count });
  } catch (error) {
    console.error("POST /api/v1/trainees/[publicId]/drop-out error:", error);
    return routeErrorResponse("Failed to mark trainee as dropped out", error);
  }
}
