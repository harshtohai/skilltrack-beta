import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { applicantsResponseSchema, jobIdParamSchema } from "~/lib/job-board-contracts";
import { maskPhone } from "~/server/phone-mask";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Applicants for a job posting (F25). Own job only (admin allowed). Contact
 * reveal is symmetric: the full E.164 phone (and the trainee email when
 * present) appear once the application is SHORTLISTED or HIRED; masked
 * otherwise.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "employer" && session.user.role !== "admin")) {
      return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
    }

    const { id } = await params;
    jobIdParamSchema.parse({ id });

    const job = await db.jobPosting.findUnique({
      where: { id },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            trainee: { include: { certificates: { orderBy: { issueDate: "desc" } } } },
          },
        },
      },
    });
    if (!job) {
      return createErrorResponse("NOT_FOUND", "Job posting not found", 404);
    }

    if (session.user.role !== "admin") {
      const employer = await db.employer.findUnique({ where: { id: session.user.id } });
      if (!employer) {
        return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
      }
      if (job.employerId !== employer.id) {
        return createErrorResponse(
          "FORBIDDEN",
          "You can only view applicants for your own job postings",
          403
        );
      }
    }

    const applicants = job.applications.map((application) => {
      const revealed = application.status === "SHORTLISTED" || application.status === "HIRED";
      return {
        applicationId: application.id,
        traineeId: application.traineeId,
        publicId: application.trainee.publicId,
        name: application.trainee.fullName,
        district: application.trainee.district,
        // Enrolment → cohort → programme carries no course/skill list in the
        // current schema, so skills derive to [] until a course link exists
        // (the contract allows an empty array).
        skills: [] as string[],
        certificates: application.trainee.certificates.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate.toISOString(),
        })),
        phoneMasked: maskPhone(application.trainee.phoneE164),
        ...(revealed
          ? {
              phone: application.trainee.phoneE164,
              email: application.trainee.email ?? undefined,
            }
          : {}),
        status: application.status,
        appliedAt: application.createdAt.toISOString(),
      };
    });

    return NextResponse.json(applicantsResponseSchema.parse({ applicants }));
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/employer/jobs/[id]/applicants error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch applicants", 500);
  }
}
