import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { employerJobSchema, jobIdParamSchema, updateJobSchema } from "~/lib/job-board-contracts";
import { toEmployerJob } from "~/server/employer-jobs";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Update a job posting (close/re-open/edit). Own job only (admin allowed);
 * editing is a VERIFIED-only capability for employers.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "employer" && session.user.role !== "admin")) {
      return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
    }

    const { id } = await params;
    jobIdParamSchema.parse({ id });

    const body = (await request.json()) as unknown;
    const data = updateJobSchema.parse(body);

    const job = await db.jobPosting.findUnique({ where: { id } });
    if (!job) {
      return createErrorResponse("NOT_FOUND", "Job posting not found", 404);
    }

    if (session.user.role !== "admin") {
      const employer = await db.employer.findUnique({ where: { id: session.user.id } });
      if (!employer) {
        return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
      }
      if (job.employerId !== employer.id) {
        return createErrorResponse("FORBIDDEN", "You can only update your own job postings", 403);
      }
      // PENDING/SUSPENDED/REJECTED employers are frozen out of job management.
      if (employer.verificationStatus !== "VERIFIED") {
        return createErrorResponse(
          "NOT_VERIFIED",
          "Your account is not verified — job management is unavailable",
          403
        );
      }
    }

    const updated = await db.jobPosting.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        salaryBand: data.salaryBand,
        openings: data.openings,
        applicationDeadline:
          data.applicationDeadline === undefined
            ? undefined
            : data.applicationDeadline === null
              ? null
              : new Date(data.applicationDeadline),
        status: data.status,
      },
      include: { applications: { select: { status: true } } },
    });

    return NextResponse.json({ job: employerJobSchema.parse(toEmployerJob(updated)) });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("PATCH /api/v1/employer/jobs/[id] error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to update job posting", 500);
  }
}
