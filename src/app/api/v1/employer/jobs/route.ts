import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import {
  createJobSchema,
  employerJobSchema,
  employerJobsResponseSchema,
} from "~/lib/job-board-contracts";
import { toEmployerJob } from "~/server/employer-jobs";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Employer job postings (F25). GET returns the caller's jobs (all jobs for
 * admin) with application/hire counts; POST creates a posting — a
 * VERIFIED-only capability.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "employer" && session.user.role !== "admin")) {
      return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
    }

    // Admin sees every posting; employers see their own. The employer block
    // carries the caller's verificationStatus so the dashboard can render
    // the verification state without a second call.
    if (session.user.role === "admin") {
      const allJobs = await db.jobPosting.findMany({
        orderBy: { createdAt: "desc" },
        include: { applications: { select: { status: true } } },
      });
      const adminResponse = employerJobsResponseSchema.parse({
        employer: {
          id: session.user.id,
          companyName: "All Employers (Admin)",
          verificationStatus: "VERIFIED",
        },
        jobs: allJobs.map(toEmployerJob),
      });
      return NextResponse.json(adminResponse);
    }

    const employer = await db.employer.findUnique({ where: { id: session.user.id } });
    if (!employer) {
      return createErrorResponse("NOT_FOUND", "Employer profile not found", 404);
    }

    const jobs = await db.jobPosting.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
      include: { applications: { select: { status: true } } },
    });

    const response = employerJobsResponseSchema.parse({
      employer: {
        id: employer.id,
        companyName: employer.companyName,
        verificationStatus: employer.verificationStatus,
      },
      jobs: jobs.map(toEmployerJob),
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/v1/employer/jobs error:", error);
    return routeErrorResponse("Failed to fetch job postings", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "employer" && session.user.role !== "admin")) {
      return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
    }

    // Job posting is a VERIFIED-only capability; admin sessions have no
    // Employers row and cannot post on their own behalf.
    const employer = await db.employer.findUnique({ where: { id: session.user.id } });
    if (!employer) {
      return createErrorResponse("FORBIDDEN", "Only employer accounts can post jobs", 403);
    }
    if (employer.verificationStatus !== "VERIFIED") {
      return createErrorResponse(
        "NOT_VERIFIED",
        "Your account is not verified yet — job posting unlocks once an admin verifies it",
        403
      );
    }

    const body = (await request.json()) as unknown;
    const data = createJobSchema.parse(body);

    const created = await db.jobPosting.create({
      data: {
        employerId: employer.id,
        title: data.title,
        description: data.description,
        employmentType: data.employmentType,
        workMode: data.workMode,
        salaryBand: data.salaryBand ?? null,
        district: data.district,
        skillsRequired: data.skillsRequired,
        openings: data.openings,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        status: "OPEN",
      },
    });

    await db.auditEvent.create({
      data: {
        entityType: "JobPosting",
        entityId: created.id,
        action: "CREATE_JOB",
        actorType: "EMPLOYER",
        actorId: employer.id,
        metadata: { title: created.title, district: created.district, openings: created.openings },
      },
    });

    const job = employerJobSchema.parse(toEmployerJob({ ...created, applications: [] }));
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/employer/jobs error:", error);
    return routeErrorResponse("Failed to create job posting", error);
  }
}
