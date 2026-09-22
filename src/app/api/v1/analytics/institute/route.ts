import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const dynamic = "force-dynamic";

const instituteAnalyticsSchema = z.object({
  timeWindow: z.enum(["6m", "12m", "24m", "all"]).default("12m"),
  programmeId: z.string().uuid().optional(),
  cohortId: z.string().uuid().optional(),
});

function getMonthsBack(timeWindow: string): number {
  switch (timeWindow) {
    case "6m": return 6;
    case "12m": return 12;
    case "24m": return 24;
    default: return 60;
  }
}

function generateMonthlyLabels(monthsBack: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    labels.push(format(date, "MMM yyyy"));
  }
  return labels;
}

export async function GET(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = instituteAnalyticsSchema.parse(Object.fromEntries(searchParams));

    const monthsBack = getMonthsBack(query.timeWindow);
    const labels = generateMonthlyLabels(monthsBack);
    const startDate = subMonths(new Date(), monthsBack);

    const whereClause: Record<string, unknown> = {};
    if (query.programmeId) {
      whereClause.programmeId = query.programmeId;
    }
    if (query.cohortId) {
      whereClause.id = query.cohortId;
    }

    const cohorts = await dbDirect.cohort.findMany({
      where: whereClause,
      include: {
        programme: true,
        enrolments: {
          include: {
            trainee: {
              include: {
                outcomeEvents: {
                  where: { createdAt: { gte: startDate } },
                  include: { employmentClaim: true },
                },
                employmentClaims: {
                  where: { createdAt: { gte: startDate } },
                },
                certificates: true,
                employmentHistory: true,
              },
            },
          },
        },
      },
    });

    const monthlyData = labels.map((label, idx) => {
      const monthStart = startOfMonth(subMonths(new Date(), monthsBack - 1 - idx));
      const monthEnd = endOfMonth(monthStart);

      let totalCertified = 0;
      let employed = 0;
      let retained90 = 0;
      let verifiedEmployed = 0;
      let wageProgression = 0;
      let avgSalaryBandIndex = 0;
      let salaryBandCount = 0;

      for (const cohort of cohorts) {
        for (const enrolment of cohort.enrolments) {
          if (enrolment.certificationDate < monthStart || enrolment.certificationDate > monthEnd) continue;

          totalCertified++;
          const trainee = enrolment.trainee;

          const outcome30 = trainee.outcomeEvents.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
          const outcome90 = trainee.outcomeEvents.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
          const latestOutcome = outcome90 || outcome30;

          if (latestOutcome && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latestOutcome.outcomeStatus)) {
            employed++;
            if (latestOutcome.verificationStatus === "EMPLOYER_CONFIRMED" || latestOutcome.verificationStatus === "DOCUMENT_VERIFIED") {
              verifiedEmployed++;
            }

            const bands = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"];
            const idx = bands.indexOf(latestOutcome.employmentClaim?.salaryBand || "LT_10K");
            if (idx >= 0) {
              avgSalaryBandIndex += idx;
              salaryBandCount++;
            }
          }

          if (outcome30 && outcome90) {
            const employed30 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus);
            const employed90 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
            if (employed30 && employed90) {
              retained90++;
              const bands = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"];
              const idx30 = bands.indexOf(outcome30.employmentClaim?.salaryBand || "LT_10K");
              const idx90 = bands.indexOf(outcome90.employmentClaim?.salaryBand || "LT_10K");
              if (idx90 > idx30) wageProgression++;
            }
          }
        }
      }

      const allInstituteTrainees = cohorts.flatMap((c) => c.enrolments.map((e) => e.trainee));
      const peerPlacementRates = allInstituteTrainees
        .filter((t) => t.outcomeEvents.some((e) => e.checkpointDays === 30 || e.checkpointDays === 90))
        .map((t) => {
          const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30);
          const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90);
          const latest = outcome90 || outcome30;
          return latest && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latest.outcomeStatus) ? 1 : 0;
        });

      const avgPlacementRate = peerPlacementRates.length > 0
        ? (peerPlacementRates.reduce((a: number, b: number) => a + b, 0) / peerPlacementRates.length) * 100
        : 0;

      return {
        month: label,
        certified: totalCertified,
        employed,
        retained90,
        verifiedEmployed,
        wageProgression,
        placementRate: totalCertified > 0 ? (employed / totalCertified) * 100 : 0,
        retentionRate: employed > 0 ? (retained90 / employed) * 100 : 0,
        verifiedRate: employed > 0 ? (verifiedEmployed / employed) * 100 : 0,
        wageProgressionRate: employed > 0 ? (wageProgression / employed) * 100 : 0,
        avgSalaryBand: salaryBandCount > 0 ? avgSalaryBandIndex / salaryBandCount : 0,
        peerAvgPlacementRate: avgPlacementRate,
      };
    });

    const allTrainees = cohorts.flatMap((c) => c.enrolments.map((e) => e.trainee));
    const overall = {
      totalCertified: allTrainees.length,
      totalEmployed: allTrainees.filter((t) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90);
        const latest = outcome90 || outcome30;
        return latest && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latest.outcomeStatus);
      }).length,
      totalRetained: allTrainees.filter((t) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90);
        return outcome30 && outcome90 && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus) && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
      }).length,
      totalCertificates: allTrainees.reduce((sum, t) => sum + t.certificates.length, 0),
      avgCertificatesPerTrainee: allTrainees.length > 0 ? allTrainees.reduce((sum, t) => sum + t.certificates.length, 0) / allTrainees.length : 0,
    };

    const peerComparison = {
      placementRate: monthlyData[monthlyData.length - 1]?.placementRate ?? 0,
      retentionRate: monthlyData[monthlyData.length - 1]?.retentionRate ?? 0,
      verifiedRate: monthlyData[monthlyData.length - 1]?.verifiedRate ?? 0,
      wageProgressionRate: monthlyData[monthlyData.length - 1]?.wageProgressionRate ?? 0,
      avgPlacementRate: monthlyData[monthlyData.length - 1]?.peerAvgPlacementRate ?? 0,
    };

    return NextResponse.json({
      timeWindow: query.timeWindow,
      labels,
      monthlyData,
      overall,
      peerComparison,
      cohorts: cohorts.map((c) => ({
        id: c.id,
        name: c.name,
        programme: c.programme.name,
        traineeCount: c.enrolments.length,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/analytics/institute error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch institute analytics", 500);
  }
}