import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, handleZodError, routeErrorResponse } from "../../_utils";
import { isPlausibleDateOfBirth } from "~/lib/utils";
import { mintAndSendLoginToken } from "~/server/magic-link";

export const dynamic = "force-dynamic";

const linkEnrolSchema = z.object({
  traineeId: z.string().uuid(),
  cohortId: z.string().uuid(),
  // The institute attests identity — no link happens without the checkbox.
  confirmed: z.literal(true),
  updates: z
    .object({
      email: z.string().email(),
      dateOfBirth: z.coerce.date().refine(isPlausibleDateOfBirth, "Enter a realistic date of birth"),
      address: z.string().min(1).max(500),
      educationLevel: z.enum([
        "BELOW_10TH",
        "TENTH",
        "TWELFTH",
        "ITI_DIPLOMA",
        "GRADUATE",
        "POST_GRADUATE",
        "OTHER",
      ]),
    })
    .partial()
    .optional(),
});

/**
 * Enrol an EXISTING trainee (found via the SkillID lookup) into this
 * center's cohort (INST-04). One identity, many enrolments — the trainee
 * row is linked, never duplicated. The optional `updates` only FILL fields
 * that are still null (an institute never overwrites identity data that
 * already exists), and consent stays whatever the trainee already gave.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    }
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }
    if (scope.role === "institute" && !scope.centerId) {
      return createErrorResponse("FORBIDDEN", "Institute center is not configured", 403);
    }

    const data = linkEnrolSchema.parse(await request.json());

    const cohort = await db.cohort.findUnique({
      where: { id: data.cohortId },
      include: { programme: true },
    });
    if (!cohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }
    // INST-01: institutes only enrol into their own center's cohorts.
    if (scope.role === "institute" && cohort.trainingCenterId !== scope.centerId) {
      return createErrorResponse("FORBIDDEN", "The target cohort is not in your center", 403);
    }

    const trainee = await db.trainee.findUnique({
      where: { id: data.traineeId },
      select: {
        id: true,
        publicId: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        address: true,
        educationLevel: true,
      },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    // Explicit pre-check for a friendly message — the DB unique constraint
    // is the backstop, not the UX.
    const already = await db.enrolment.findFirst({
      where: { traineeId: trainee.id, cohortId: cohort.id },
      select: { id: true },
    });
    if (already) {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_ENROLLED",
            message: "This trainee is already enrolled in that cohort.",
          },
          traineePublicId: trainee.publicId,
        },
        { status: 409 },
      );
    }

    const u = data.updates ?? {};
    const updates: {
      email?: string;
      dateOfBirth?: Date;
      address?: string;
      educationLevel?: (typeof u)["educationLevel"];
    } = {};
    if (u.email && !trainee.email) updates.email = u.email;
    if (u.dateOfBirth && !trainee.dateOfBirth) updates.dateOfBirth = u.dateOfBirth;
    if (u.address && !trainee.address) updates.address = u.address;
    if (u.educationLevel && !trainee.educationLevel) updates.educationLevel = u.educationLevel;

    const enrolment = await db.$transaction(async (tx) => {
      if (Object.keys(updates).length > 0) {
        await tx.trainee.update({ where: { id: trainee.id }, data: updates });
      }
      const created = await tx.enrolment.create({
        data: {
          traineeId: trainee.id,
          cohortId: cohort.id,
          status: "ACTIVE",
          certificationDate: cohort.endDate,
        },
      });
      await tx.auditEvent.create({
        data: {
          entityType: "trainee",
          entityId: trainee.id,
          action: "TRAINEE_ENROLLED",
          // ActorType has no INSTITUTE yet (tracked debt) — actorId keeps the human.
          actorType: "SYSTEM",
          actorId: session.user.id,
          metadata: { via: "skill-id", cohortId: cohort.id, filled: Object.keys(updates) },
        },
      });
      return created;
    });

    // A freshly filled email on a previously email-less trainee (or an
    // existing one) gets the enrollment email — portal access + programme
    // info. Non-blocking: the enrolment already happened.
    const finalEmail = updates.email ?? trainee.email;
    if (finalEmail) {
      try {
        await mintAndSendLoginToken(
          { id: trainee.id, email: finalEmail, fullName: trainee.fullName },
          "EMAIL",
          { programme: cohort.programme.name },
        );
      } catch (sendError) {
        console.error("POST /api/v1/trainees/link-enrol: enrollment email failed:", sendError);
      }
    }

    return NextResponse.json(
      { success: true, enrolmentId: enrolment.id, traineePublicId: trainee.publicId },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target;
      const targetText = Array.isArray(target) ? target.join(" ") : typeof target === "string" ? target : "";
      if (targetText.includes("email")) {
        return createErrorResponse("EMAIL_EXISTS", "An account with this email already exists", 409);
      }
    }
    console.error("POST /api/v1/trainees/link-enrol error:", error);
    return routeErrorResponse("Failed to enrol trainee", error);
  }
}
