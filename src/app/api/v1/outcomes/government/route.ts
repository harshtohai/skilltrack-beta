import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { getMonthlyOutcomes, getTrainingCenterScores, EMPLOYED_STATUSES } from "~/server/analytics";
import { aggregateDemandGaps, aggregateEmployerReliability } from "~/server/job-marketplace";
import { computeEmployerRetention } from "~/server/scoring";
import { routeErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import type { JobMarketplace } from "~/lib/job-board-contracts";

export const dynamic = "force-dynamic";

const governmentAnalyticsSchema = z.object({
  timeWindow: z.enum(["6m", "12m", "24m", "all"]).default("12m"),
  programmeId: z.string().uuid().optional(),
  district: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = governmentAnalyticsSchema.parse(Object.fromEntries(searchParams));

    const { monthlyData, overall } = await getMonthlyOutcomes({
      timeWindow: query.timeWindow,
      limit: query.limit,
      programmeId: query.programmeId,
      district: query.district,
    });

    const trainingCenters = await getTrainingCenterScores();

    // ── Job marketplace (F25, append-only section) ────────────────────────
    // Batch fetch + aggregate in memory: counts, demand gaps (signals vs
    // open jobs by district) and per-employer reliability.
    const [jobsPosted, openJobs, applications, hires, signals, openJobsByDistrict, allEmployers, boardHires, sustainedOutcomes] = await Promise.all([
      db.jobPosting.count(),
      db.jobPosting.count({ where: { status: "OPEN" } }),
      db.jobApplication.count(),
      db.jobApplication.count({ where: { status: "HIRED" } }),
      db.jobSeekSignal.findMany({ select: { district: true, reason: true } }),
      db.jobPosting.groupBy({ by: ["district"], where: { status: "OPEN" }, _count: { district: true } }),
      db.employer.findMany({ select: { id: true, companyName: true, verificationStatus: true } }),
      db.jobApplication.findMany({
        where: { status: "HIRED" },
        select: { traineeId: true, jobPosting: { select: { employerId: true } } },
      }),
      // Only post-placement (checkpointDays > 0) checkpoints with a known
      // status carry retention evidence.
      db.outcomeEvent.findMany({
        where: { checkpointDays: { gt: 0 }, outcomeStatus: { not: "UNKNOWN" } },
        select: { traineeId: true, outcomeStatus: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const openJobsCounts: Record<string, number> = {};
    for (const row of openJobsByDistrict) {
      openJobsCounts[row.district] = row._count.district;
    }

    // Sustained employment per trainee: the latest known post-placement
    // checkpoint wins (ordered by createdAt asc, later rows overwrite).
    const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);
    const sustainedByTrainee = new Map<string, boolean>();
    for (const outcome of sustainedOutcomes) {
      sustainedByTrainee.set(outcome.traineeId, isEmployed(outcome.outcomeStatus));
    }

    // Board hires = confirmed claims; retention per employer uses the same
    // computeEmployerRetention the employer track uses.
    const companyNameById = new Map(allEmployers.map((e) => [e.id, e.companyName]));
    const verificationByEmployer = new Map(allEmployers.map((e) => [e.id, e.verificationStatus]));
    const claimsByEmployer = new Map<
      string,
      { employerName: string; confirmed: boolean; sustainedEmployment: boolean | null }[]
    >();
    const hiresByEmployer: Record<string, number> = {};
    for (const hire of boardHires) {
      const employerId = hire.jobPosting.employerId;
      hiresByEmployer[employerId] = (hiresByEmployer[employerId] ?? 0) + 1;
      const claims = claimsByEmployer.get(employerId) ?? [];
      claims.push({
        employerName: companyNameById.get(employerId) ?? "Unknown",
        // Only a currently-VERIFIED employer's hires count as confirmed
        // retention evidence — suspended/rejected employers stop feeding
        // the reliability score (spec: the board self-cleans).
        confirmed: verificationByEmployer.get(employerId) === "VERIFIED",
        sustainedEmployment: sustainedByTrainee.get(hire.traineeId) ?? null,
      });
      claimsByEmployer.set(employerId, claims);
    }

    const retentionScores: Record<string, number | null> = {};
    for (const [employerId, claims] of claimsByEmployer) {
      retentionScores[employerId] = computeEmployerRetention(claims).score;
    }

    const jobMarketplace: JobMarketplace = {
      jobsPosted,
      openJobs,
      applications,
      hires,
      hireRate: applications === 0 ? null : Math.round((hires / applications) * 100),
      demandGaps: aggregateDemandGaps(signals, openJobsCounts),
      employerReliability: aggregateEmployerReliability(allEmployers, hiresByEmployer, retentionScores),
    };

    return NextResponse.json({
      timeWindow: query.timeWindow,
      labels: monthlyData.map((m) => m.month),
      monthlyData,
      overall,
      trainingCenters: trainingCenters.sort((a, b) => b.overallScore - a.overallScore),
      jobMarketplace,
      targets: {
        placementRate: 70,
        retentionRate: 60,
        verifiedRate: 50,
        wageProgressionRate: 30,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/outcomes/government error:", error);
    return routeErrorResponse("Failed to fetch government analytics", error);
  }
}