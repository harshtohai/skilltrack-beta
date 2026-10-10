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
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Reject an application (F25). State machine: APPLIED or SHORTLISTED →
 * REJECTED — direct rejection from APPLIED keeps the pipeline clean; HIRED
 * and WITHDRAWN are terminal (409). Own job only (admin allowed).
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

    if (!canApplyAction(application.status, "reject")) {
      return createErrorResponse(
        "INVALID_TRANSITION",
        `Cannot reject an application in ${application.status} status`,
        409
      );
    }

    const updated = await db.jobApplication.update({
      where: { id: application.id },
      data: { status: "REJECTED" },
    });

    const actorId = session.user.role === "admin" ? session.user.id : job.employerId;
    await db.auditEvent.create({
      data: {
        entityType: "JobApplication",
        entityId: application.id,
        action: "REJECT_APPLICANT",
        actorType: session.user.role === "admin" ? "ADMIN" : "EMPLOYER",
        actorId,
        metadata: { jobId: job.id, traineeId: application.traineeId },
      },
    });

    const response = applicationActionResponseSchema.parse({
      application: { id: updated.id, status: updated.status },
    });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/employer/jobs/[id]/applicants/[appId]/reject error:", error);
    return routeErrorResponse("Failed to reject applicant", error);
  }
}
