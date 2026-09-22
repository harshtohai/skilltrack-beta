import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const dynamic = "force-dynamic";


const governmentAnalyticsSchema = z.object({
  timeWindow: z.enum(["6m", "12m", "24m", "all"]).default("12m"),
  programmeId: z.string().uuid().optional(),
  district: z.string().optional(),
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
    const query = governmentAnalyticsSchema.parse(Object.fromEntries(searchParams));

    const monthsBack = getMonthsBack(query.timeWindow);
    const labels = generateMonthlyLabels(monthsBack);
    const startDate = subMonths(new Date(), monthsBack);

    const whereClause: Record<string, unknown> = {};
    if (query.programmeId) {
      whereClause.enrolments = { some: { programmeId: query.programmeId } };
    }
    if (query.district) {
      whereClause.district = query.district;
    }

    const trainees = await dbDirect.trainee.findMany({
      where: whereClause,
      include: {
        enrolments: {
          include: { cohort: true },
        },
        outcomeEvents: {
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: "asc" },
          include: { employmentClaim: true },
        },
        employmentClaims: {
          where: { createdAt: { gte: startDate } },
          include: { verificationRequests: true },
        },
      },
    });

    const monthlyData = labels.map((label, idx) => {
      const monthStart = startOfMonth(subMonths(new Date(), monthsBack - 1 - idx));
      const monthEnd = endOfMonth(monthStart);

      const monthTrainees = trainees.filter((t: typeof trainees[0]) => {
        const enrolment = t.enrolments[0];
        return enrolment && enrolment.certificationDate >= monthStart && enrolment.certificationDate <= monthEnd;
      });

      const totalCertified = monthTrainees.length;
      const employed = monthTrainees.filter((t) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
        const latestOutcome = outcome90 || outcome30;
        return latestOutcome && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latestOutcome.outcomeStatus);
      }).length;

      const retained90 = monthTrainees.filter((t) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
        if (!outcome30 || !outcome90) return false;
        const employed30 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus);
        const employed90 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
        return employed30 && employed90;
      }).length;

      const verifiedEmployed = monthTrainees.filter((t) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
        const latestOutcome = outcome90 || outcome30;
        if (!latestOutcome) return false;
        const employed = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latestOutcome.outcomeStatus);
        if (!employed) return false;
        return latestOutcome.verificationStatus === "EMPLOYER_CONFIRMED" || latestOutcome.verificationStatus === "DOCUMENT_VERIFIED";
      }).length;

      const wageProgression = monthTrainees
        .filter((t) => {
          const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
          const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
          return outcome30 && outcome90;
        })
        .map((t) => {
          const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd)!;
          const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd)!;
          const bands = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"];
          const idx30 = bands.indexOf(outcome30.employmentClaim?.salaryBand || "LT_10K");
          const idx90 = bands.indexOf(outcome90.employmentClaim?.salaryBand || "LT_10K");
          return idx90 - idx30;
        })
        .filter((d) => d > 0).length;

      const expectedPlacementRate = 0.7;
      const expectedRetentionRate = 0.6;
      const expectedVerifiedRate = 0.5;
      const expectedWageProgressionRate = 0.3;

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
        expectedPlacement: expectedPlacementRate * 100,
        expectedRetention: expectedRetentionRate * 100,
        expectedVerified: expectedVerifiedRate * 100,
        expectedWageProgression: expectedWageProgressionRate * 100,
      };
    });

    const overall = {
      totalCertified: trainees.length,
      totalEmployed: trainees.filter((t: typeof trainees[0]) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90);
        const latest = outcome90 || outcome30;
        return latest && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latest.outcomeStatus);
      }).length,
      totalRetained: trainees.filter((t: typeof trainees[0]) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90);
        return outcome30 && outcome90 && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus) && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
      }).length,
      totalVerified: trainees.filter((t: typeof trainees[0]) => {
        const outcome30 = t.outcomeEvents.find((e) => e.checkpointDays === 30);
        const outcome90 = t.outcomeEvents.find((e) => e.checkpointDays === 90);
        const latest = outcome90 || outcome30;
        return latest && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(latest.outcomeStatus) && (latest.verificationStatus === "EMPLOYER_CONFIRMED" || latest.verificationStatus === "DOCUMENT_VERIFIED");
      }).length,
    };

    return NextResponse.json({
      timeWindow: query.timeWindow,
      labels,
      monthlyData,
      overall,
      targets: {
        placementRate: 70,
        retentionRate: 60,
        verifiedRate: 50,
        wageProgressionRate: 30,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/analytics/government error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch government analytics", 500);
  }
}