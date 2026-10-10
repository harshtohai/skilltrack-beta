import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { computeEmployerRetention } from "~/server/scoring";
import { sortJobsForTrainee, matchesFilters } from "~/server/job-relevance";
import { EMPLOYED_STATUSES } from "~/server/analytics";
import { traineeJobsQuerySchema } from "~/lib/job-board-contracts";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);

// Board-hire statuses that count as "applied" for display (WITHDRAWN does
// not — the trainee can re-apply).
const APPLIED_STATUSES = ["APPLIED", "SHORTLISTED", "HIRED"] as const;

/**
 * Trainee job board: OPEN + unexpired jobs from non-suspended employers,
 * relevance-sorted for the calling trainee (same district first, verified
 * first, newest tiebreak). Retention per employer is fed to the pure
 * scoring engine; applied state comes from the trainee's own applications.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const trainee = await db.trainee.findUnique({
      where: { id: traineeId },
      select: { district: true },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    const query = traineeJobsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    const now = new Date();
    const jobs = await db.jobPosting.findMany({
      where: {
        status: "OPEN",
        OR: [{ applicationDeadline: null }, { applicationDeadline: { gt: now } }],
        employer: { verificationStatus: { not: "SUSPENDED" } },
      },
      include: { employer: { select: { companyName: true, verificationStatus: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Everything needed for retention + applied state, fetched once and
    // aggregated in memory.
    const employerIds = [...new Set(jobs.map((j) => j.employerId))];
    const [allApplications, postingsForEmployers, allOutcomes, myApplications] = await Promise.all([
      db.jobApplication.findMany({
        where: { jobPosting: { employerId: { in: employerIds } } },
        select: { jobPostingId: true, traineeId: true, status: true, createdAt: true },
      }),
      db.jobPosting.findMany({
        where: { employerId: { in: employerIds } },
        select: { id: true, employerId: true },
      }),
      db.outcomeEvent.findMany({
        select: { traineeId: true, checkpointDays: true, outcomeStatus: true },
      }),
      db.jobApplication.findMany({
        where: { traineeId },
        select: { jobPostingId: true, status: true, createdAt: true },
      }),
    ]);

    // Per-trainee followup index: employed status at any later checkpoint
    // (checkpointDays > 0, not UNKNOWN) = sustained employment.
    const eventsByTrainee = new Map<string, { checkpointDays: number; outcomeStatus: string }[]>();
    for (const o of allOutcomes) {
      const list = eventsByTrainee.get(o.traineeId) ?? [];
      list.push({ checkpointDays: o.checkpointDays, outcomeStatus: o.outcomeStatus });
      eventsByTrainee.set(o.traineeId, list);
    }

    // employerId per posting for grouping applications by employer
    const employerByPosting = new Map(postingsForEmployers.map((p) => [p.id, p.employerId]));
    const verifiedByEmployer = new Map(
      jobs.map((j) => [j.employerId, j.employer.verificationStatus])
    );
    const companyNameByEmployer = new Map(jobs.map((j) => [j.employerId, j.employer.companyName]));

    // HIRED board applications per employer, each becoming one retention
    // claim (confirmed = employer-verified).
    const hiresByEmployer = new Map<string, { traineeId: string }[]>();
    for (const app of allApplications) {
      if (app.status !== "HIRED") continue;
      const employerId = employerByPosting.get(app.jobPostingId);
      if (!employerId) continue;
      const list = hiresByEmployer.get(employerId) ?? [];
      list.push({ traineeId: app.traineeId });
      hiresByEmployer.set(employerId, list);
    }

    const retentionByEmployer = new Map<string, { hires: number; retainedPct: number | null }>();
    for (const [employerId, hires] of hiresByEmployer) {
      const verificationStatus = verifiedByEmployer.get(employerId);
      const companyName = companyNameByEmployer.get(employerId) ?? "Unknown";
      const claims = hires.map((hire) => {
        const followups = (eventsByTrainee.get(hire.traineeId) ?? []).filter(
          (e) => e.checkpointDays > 0
        );
        const known = followups.filter((e) => e.outcomeStatus !== "UNKNOWN");
        // Latest known post-placement checkpoint wins — mirrors
        // /api/v1/outcomes/government so job cards and gov analytics agree.
        const latest =
          known.length > 0
            ? known.reduce((a, b) => (b.checkpointDays >= a.checkpointDays ? b : a))
            : null;
        return {
          employerName: companyName,
          confirmed: verificationStatus === "VERIFIED",
          sustainedEmployment: latest ? isEmployed(latest.outcomeStatus) : null,
        };
      });
      retentionByEmployer.set(employerId, {
        hires: hires.length,
        retainedPct: computeEmployerRetention(claims).score,
      });
    }

    // Applied state per job from the trainee's own applications
    const myApplicationByJob = new Map(myApplications.map((a) => [a.jobPostingId, a]));

    const payload = jobs.map((job) => {
      const myApplication = myApplicationByJob.get(job.id);
      const applied =
        myApplication !== undefined &&
        (APPLIED_STATUSES as readonly string[]).includes(myApplication.status);
      const employerRetention = retentionByEmployer.get(job.employerId);
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        companyName: job.employer.companyName,
        employerVerified: job.employer.verificationStatus === "VERIFIED",
        salaryBand: job.salaryBand,
        workMode: job.workMode,
        employmentType: job.employmentType,
        district: job.district,
        skillsRequired: job.skillsRequired,
        openings: job.openings,
        applicationDeadline: job.applicationDeadline?.toISOString() ?? null,
        retention: {
          hires: employerRetention?.hires ?? 0,
          retainedPct: employerRetention?.retainedPct ?? null,
        },
        applied,
        appliedAt: applied && myApplication ? myApplication.createdAt.toISOString() : null,
        // Internal sort key, stripped from the response (publicJobSchema)
        createdAt: job.createdAt.toISOString(),
      };
    });

    const sorted = sortJobsForTrainee(payload, trainee.district);

    // Optional server-side narrowing (debugging) — the UI filters
    // client-side via the same helper, so no refetch. Empty query
    // filters are a no-op.
    const narrowed = sorted.filter((job) => matchesFilters(job, query));

    // createdAt is internal (sort tiebreak); the frozen publicJobSchema
    // response does not carry it.
    return NextResponse.json({
      jobs: narrowed.map(({ createdAt: _createdAt, ...job }) => job),
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/trainee/jobs error:", error);
    return routeErrorResponse("Failed to fetch jobs", error);
  }
}
