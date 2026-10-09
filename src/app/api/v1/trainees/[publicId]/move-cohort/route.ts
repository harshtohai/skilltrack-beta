import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const moveCohortSchema = z.object({
  cohortId: z.string().uuid(),
});

/**
 * INST-03 move-cohort: re-points the trainee's ACTIVE enrolment(s) to a new
 * cohort. Admins may always move; institutes only while the trainee has ZERO
 * progress data (followupEvents count 0 — the checkpoints proxy) and only
 * within their own center (INST-01 scope). Every move writes a COHORT_MOVED
 * audit event (actorType ADMIN for admins, SYSTEM for institutes — the
 * closest fit in the ActorType enum).
 */
export async function POST(
  request: NextRequest,
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
    const body = moveCohortSchema.parse(await request.json());

    const trainee = await db.trainee.findUnique({
      where: { publicId },
      include: { enrolments: { include: { cohort: true } } },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    const activeEnrolments = trainee.enrolments.filter((e) => e.status === "ACTIVE");
    if (activeEnrolments.length === 0) {
      return createErrorResponse("CONFLICT", "Trainee has no active enrolment to move", 409);
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
      // The move window: zero progress data (followupEvents count 0).
      const progressCount = await db.followupEvent.count({ where: { traineeId: trainee.id } });
      if (progressCount > 0) {
        return createErrorResponse(
          "FORBIDDEN",
          "This trainee has progress data — moving them to another cohort requires an admin",
          403
        );
      }
    }

    const targetCohort = await db.cohort.findUnique({ where: { id: body.cohortId } });
    if (!targetCohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }
    if (role === "institute" && targetCohort.trainingCenterId !== centerId) {
      return createErrorResponse("FORBIDDEN", "The target cohort is not in your center", 403);
    }
    // Unique (traineeId, cohortId) — the trainee can't land in a cohort they
    // already have an enrolment record in (re-enrollment is a fresh add).
    const existing = await db.enrolment.findFirst({
      where: { traineeId: trainee.id, cohortId: body.cohortId },
    });
    if (existing) {
      return createErrorResponse(
        "CONFLICT",
        "Trainee already has an enrolment record in that cohort",
        409
      );
    }

    const moved = await db.enrolment.updateMany({
      where: { traineeId: trainee.id, status: "ACTIVE" },
      data: { cohortId: body.cohortId },
    });

    await db.auditEvent.create({
      data: {
        entityType: "Trainee",
        entityId: trainee.id,
        action: "COHORT_MOVED",
        actorType: role === "admin" ? "ADMIN" : "SYSTEM",
        actorId: session.user.id,
        metadata: {
          traineeId: trainee.id,
          fromCohortIds: activeEnrolments.map((e) => e.cohortId),
          toCohortId: body.cohortId,
          enrolmentCount: moved.count,
          role,
        },
      },
    });

    return NextResponse.json({ moved: moved.count, toCohortId: body.cohortId });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainees/[publicId]/move-cohort error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to move trainee", 500);
  }
}
