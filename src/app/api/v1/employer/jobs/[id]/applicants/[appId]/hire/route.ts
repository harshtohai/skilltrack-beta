import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import {
  applicationActionParamsSchema,
  applicationActionResponseSchema,
} from "~/lib/job-board-contracts";
import { canApplyAction } from "~/server/job-application-state";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Hire an applicant (F25). State machine: SHORTLISTED → HIRED; anything else
 * is a 409. One transaction writes the application status, the trainee's
 * employment history and an append-only employer-confirmed outcome event,
 * then auto-closes the job when hires reach the number of openings.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "employer" && session.user.role !== "admin")) {
      return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
    }

    const { id, appId } = await params;
    applicationActionParamsSchema.parse({ id, appId });

    const job = await db.jobPosting.findUnique({ where: { id }, include: { employer: true } });
    if (!job) {
      return createErrorResponse("NOT_FOUND", "Job posting not found", 404);
    }

    if (session.user.role !== "admin") {
      const employer = await db.employer.findUnique({ where: { id: session.user.id } });
      if (!employer) {
        return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
      }
      if (job.employerId !== employer.id) {
        return createErrorResponse("FORBIDDEN", "You can only manage your own job postings", 403);
      }
      // PENDING/SUSPENDED/REJECTED employers are frozen out of the pipeline.
      if (employer.verificationStatus !== "VERIFIED") {
        return createErrorResponse(
          "NOT_VERIFIED",
          "Your account is not verified — applicant management is unavailable",
          403
        );
      }
    }

    const application = await db.jobApplication.findUnique({ where: { id: appId } });
    if (application?.jobPostingId !== job.id) {
      return createErrorResponse("NOT_FOUND", "Application not found", 404);
    }

    if (!canApplyAction(application.status, "hire")) {
      return createErrorResponse(
        "INVALID_TRANSITION",
        `Cannot hire an application in ${application.status} status — shortlist it first`,
        409
      );
    }

    const now = new Date();
    const result = await db.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id: application.id },
        data: { status: "HIRED" },
      });

      // Employment history row for the trainee profile.
      await tx.employmentHistory.create({
        data: {
          traineeId: application.traineeId,
          employer: job.employer.companyName,
          role: job.title,
          salaryBand: job.salaryBand,
          startDate: now,
          isCurrent: true,
        },
      });

      // Append-only outcome event — never overwrite: employer-confirmed
      // employment at day 0 (evidence level 3).
      await tx.outcomeEvent.create({
        data: {
          traineeId: application.traineeId,
          checkpointDays: 0,
          outcomeStatus: "EMPLOYED",
          verificationStatus: "EMPLOYER_CONFIRMED",
          source: "EMPLOYER",
          evidenceLevel: 3,
        },
      });

      // Auto-close: hires reached the number of openings.
      let jobClosed = false;
      const hireCount = await tx.jobApplication.count({
        where: { jobPostingId: job.id, status: "HIRED" },
      });
      if (job.status === "OPEN" && hireCount >= job.openings) {
        await tx.jobPosting.update({ where: { id: job.id }, data: { status: "CLOSED" } });
        jobClosed = true;
      }

      return { application: { id: updated.id, status: updated.status }, jobClosed };
    });

    const actorId = session.user.role === "admin" ? session.user.id : job.employerId;
    await db.auditEvent.create({
      data: {
        entityType: "JobApplication",
        entityId: application.id,
        action: "HIRE_APPLICANT",
        actorType: session.user.role === "admin" ? "ADMIN" : "EMPLOYER",
        actorId,
        metadata: { jobId: job.id, traineeId: application.traineeId, jobClosed: result.jobClosed },
      },
    });

    const response = applicationActionResponseSchema.parse(result);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/employer/jobs/[id]/applicants/[appId]/hire error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to hire applicant", 500);
  }
}
