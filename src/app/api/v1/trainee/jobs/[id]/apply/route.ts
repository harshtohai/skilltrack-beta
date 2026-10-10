import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { jobIdParamSchema } from "~/lib/job-board-contracts";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

function applicationPayload(application: { id: string; jobPostingId: string; status: string }) {
  return {
    id: application.id,
    jobPostingId: application.jobPostingId,
    status: application.status,
  };
}

/**
 * Apply to a job: the job must be OPEN + unexpired with a non-suspended
 * employer. Re-applying after withdraw flips the WITHDRAWN row back to
 * APPLIED (unique on [jobPostingId, traineeId]); any other existing
 * application is a 409 duplicate.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const parsed = jobIdParamSchema.safeParse({ id: (await params).id });
    if (!parsed.success) {
      return createErrorResponse("NOT_FOUND", "Job not found", 404);
    }
    const jobId = parsed.data.id;

    const job = await db.jobPosting.findUnique({
      where: { id: jobId },
      include: { employer: { select: { verificationStatus: true } } },
    });
    if (!job) {
      return createErrorResponse("NOT_FOUND", "Job not found", 404);
    }
    if (job.status !== "OPEN") {
      return createErrorResponse("JOB_CLOSED", "This job is no longer accepting applications", 409);
    }
    if (job.applicationDeadline && job.applicationDeadline <= new Date()) {
      return createErrorResponse("JOB_EXPIRED", "The application deadline has passed", 409);
    }
    if (job.employer.verificationStatus === "SUSPENDED") {
      return createErrorResponse(
        "EMPLOYER_SUSPENDED",
        "This employer is suspended and not accepting applications",
        409
      );
    }

    try {
      const created = await db.jobApplication.create({
        data: { jobPostingId: jobId, traineeId, status: "APPLIED" },
      });
      return NextResponse.json(
        { application: applicationPayload(created) },
        { status: 201 }
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await db.jobApplication.findUnique({
          where: { jobPostingId_traineeId: { jobPostingId: jobId, traineeId } },
        });
        if (existing?.status === "WITHDRAWN") {
          const updated = await db.jobApplication.update({
            where: { id: existing.id },
            data: { status: "APPLIED" },
          });
          return NextResponse.json(
            { application: applicationPayload(updated) },
            { status: 201 }
          );
        }
        return createErrorResponse(
          "DUPLICATE_APPLICATION",
          "You have already applied to this job",
          409
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/jobs/[id]/apply error:", error);
    return routeErrorResponse("Failed to apply", error);
  }
}
