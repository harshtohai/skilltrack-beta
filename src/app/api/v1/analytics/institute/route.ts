import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { getMonthlyOutcomes, EMPLOYED_STATUSES } from "~/server/analytics";
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

    return NextResponse.json({
      timeWindow: query.timeWindow,
      labels: monthlyData.map((m) => m.month),
      monthlyData,
      overall: {
        ...overall,
        totalCertificates: await db.certificate.count({
          where: { trainee: { enrolments: { some: enrolmentWhere } } },
        }),
      },
      peerComparison: {
        placementRate: latest?.placementRate ?? 0,
        retentionRate: latest?.retentionRate ?? 0,
        verifiedRate: latest?.verifiedRate ?? 0,
        wageProgressionRate: latest?.wageProgressionRate ?? 0,
      },
      cohorts: cohortRows.map((c) => ({
        id: c.id,
        name: c.name,
        programme: c.programme.name,
        traineeCount: 0,
      })),
      employedStatuses: EMPLOYED_STATUSES,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/analytics/institute error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch institute analytics", 500);
  }
}