import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, handleZodError, routeErrorResponse } from "~/app/api/v1/_utils";
import { issueCertificate } from "~/server/certificate-actions";

export const dynamic = "force-dynamic";

const textField = z.string().trim().min(1).max(200);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const issueSchema = z.object({
  issueDate: isoDate.optional(),
  name: textField.optional(),
  issuer: textField.optional(),
});

/**
 * T4 (spec #102): bulk completion-certificate issuance for one cohort
 * (ADR-002 issuance effect). Admin + institute roles (institutes scoped to
 * their own center's cohorts, INST-01). Every ACTIVE enrolment gets an ISSUED
 * (born VERIFIED) certificate; the enrolment's certificationDate is set to the
 * issue date and its status flips ACTIVE → COMPLETED — issuing IS the act of
 * certification. Idempotent: already-certified (COMPLETED) enrolments are
 * reported as skipped, so a re-run after a partial failure is safe.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: cohortId } = await params;
    const cohort = await db.cohort.findUnique({
      where: { id: cohortId },
      include: { programme: true, trainingCenter: true },
    });
    if (!cohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }

    if (scope.role === "institute") {
      if (!scope.centerId) {
        return createErrorResponse("FORBIDDEN", "Institute center is not configured", 403);
      }
      if (cohort.trainingCenterId !== scope.centerId) {
        return createErrorResponse("FORBIDDEN", "This cohort does not belong to your center", 403);
      }
    }

    const body = (await request.json().catch(() => ({}))) as unknown;
    const data = issueSchema.parse(body);
    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
    const name = data.name ?? `${cohort.programme.name} Certificate`;
    const issuer = data.issuer ?? cohort.trainingCenter?.name ?? "MSSDS";

    const enrolments = await db.enrolment.findMany({
      where: { cohortId: cohort.id },
      select: { id: true, traineeId: true, status: true },
    });
    const toProcess = enrolments.filter((e) => e.status === "ACTIVE");
    // certificationDate is non-nullable (seeded from the cohort end date at
    // enrolment), so "already certified" is the enrolment status this flow
    // sets — COMPLETED enrolments are the skipped ones on a re-run.
    const skipped = enrolments.filter((e) => e.status === "COMPLETED").length;

    if (toProcess.length === 0) {
      return createErrorResponse(
        "NOTHING_TO_ISSUE",
        "Nothing to issue — the cohort has no active enrolments or all are already certified",
        409
      );
    }

    let issued = 0;
    for (const enrolment of toProcess) {
      try {
        await issueCertificate({
          traineeId: enrolment.traineeId,
          name,
          issuer,
          issueDate,
          expiryDate: null,
          file: null,
          actorRole: scope.role,
          actorId: session.user.id,
        });
        await db.enrolment.update({
          where: { id: enrolment.id },
          data: { certificationDate: issueDate, status: "COMPLETED" },
        });
        issued += 1;
      } catch (enrolmentError) {
        // Partial-failure handling: each trainee's issuance commits
        // independently — log and keep going. Re-runs are idempotent
        // (COMPLETED enrolments are skipped), so the operator can retry.
        console.error(
          `POST /api/v1/cohorts/[cohortId]/certificates: failed to certify trainee ${enrolment.traineeId} in cohort ${cohort.id}:`,
          enrolmentError
        );
      }
    }

    return NextResponse.json({ issued, skipped });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/cohorts/[cohortId]/certificates error:", error);
    return routeErrorResponse("Failed to issue completion certificates", error);
  }
}
