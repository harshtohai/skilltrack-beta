import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { getMonthlyOutcomes, getGroupedRates, getPeerBenchmarks, EMPLOYED_STATUSES } from "~/server/analytics";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const instituteAnalyticsSchema = z.object({
  timeWindow: z.enum(["6m", "12m", "24m", "all"]).default("12m"),
  programmeId: z.string().uuid().optional(),
  cohortId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = instituteAnalyticsSchema.parse(Object.fromEntries(searchParams));

    // Institute scope: filter enrolments by cohort -> programme
    const enrolmentWhere: { programmeId?: string; cohortId?: string } = {};
    if (query.programmeId) enrolmentWhere.programmeId = query.programmeId;
    if (query.cohortId) enrolmentWhere.cohortId = query.cohortId;

    const cohortRows = await db.cohort.findMany({
      where: query.programmeId ? { programmeId: query.programmeId } : query.cohortId ? { id: query.cohortId } : {},
      select: { id: true, name: true, programme: { select: { name: true } } },
      take: 50,
    });

    const { monthlyData, overall } = await getMonthlyOutcomes({
      timeWindow: query.timeWindow,
      limit: query.limit,
      programmeId: query.programmeId,
    });

    const latest = monthlyData[monthlyData.length - 1];
    const [grouped, peer] = await Promise.all([getGroupedRates(), getPeerBenchmarks()]);
    const cohortRates = new Map(grouped.byCohort.map((c) => [c.key, c]));
    const totalCertificates = await db.certificate.count({
      where: { trainee: { enrolments: { some: enrolmentWhere } } },
    });
    // Institute's own certs-per-trainee must use the same all-time
    // denominator basis as the peer stats (certTotal / certifiedCount).
    const scopedCohorts = grouped.byCohort.filter((c) =>
      cohortRows.some((row) => row.id === c.key)
    );
    const scopedCertTotal = scopedCohorts.reduce((a, c) => a + c.certTotal, 0);
    const scopedCertified = scopedCohorts.reduce((a, c) => a + c.certifiedCount, 0);
    const avgCertificatesPerTrainee =
      scopedCertified > 0 ? scopedCertTotal / scopedCertified : 0;

    return NextResponse.json({
      timeWindow: query.timeWindow,
      labels: monthlyData.map((m) => m.month),
      monthlyData,
      overall: {
        ...overall,
        totalCertificates,
        avgCertificatesPerTrainee,
      },
      peerComparison: {
        placementRate: latest?.placementRate ?? 0,
        retentionRate: latest?.retentionRate ?? 0,
        verifiedRate: latest?.verifiedRate ?? 0,
        wageProgressionRate: latest?.wageProgressionRate ?? 0,
        avgPlacementRate: peer.avg.placementRate,
        avgRetentionRate: peer.avg.retentionRate,
        avgVerifiedRate: peer.avg.verifiedRate,
        avgWageProgressionRate: peer.avg.wageProgressionRate,
        avgCertificatesPerTrainee: peer.avg.certificatesPerTrainee,
        topQuartilePlacementRate: peer.topQuartile.placementRate,
        topQuartileRetentionRate: peer.topQuartile.retentionRate,
        topQuartileVerifiedRate: peer.topQuartile.verifiedRate,
        topQuartileWageProgressionRate: peer.topQuartile.wageProgressionRate,
        topQuartileCertificatesPerTrainee: peer.topQuartile.certificatesPerTrainee,
        gaps: {
          placementRate: (latest?.placementRate ?? 0) - peer.avg.placementRate,
          retentionRate: (latest?.retentionRate ?? 0) - peer.avg.retentionRate,
          verifiedRate: (latest?.verifiedRate ?? 0) - peer.avg.verifiedRate,
          wageProgressionRate: (latest?.wageProgressionRate ?? 0) - peer.avg.wageProgressionRate,
          certificatesPerTrainee: avgCertificatesPerTrainee - peer.avg.certificatesPerTrainee,
        },
        centerCount: peer.centerCount,
      },
      cohorts: cohortRows.map((c) => {
        const rates = cohortRates.get(c.id);
        return {
          id: c.id,
          name: c.name,
          programme: c.programme.name,
          traineeCount: rates?.traineeCount ?? 0,
          placementRate: rates?.placementRate ?? 0,
          retentionRate: rates?.retentionRate ?? 0,
          verifiedRate: rates?.verifiedRate ?? 0,
          wageProgressionRate: rates?.wageProgressionRate ?? 0,
          certificatesPerTrainee: rates?.certificatesPerTrainee ?? 0,
        };
      }),
      employedStatuses: EMPLOYED_STATUSES,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/analytics/institute error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch institute analytics", 500);
  }
}