import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { getMonthlyOutcomes, getTrainingCenterScores } from "~/server/analytics";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

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

    return NextResponse.json({
      timeWindow: query.timeWindow,
      labels: monthlyData.map((m) => m.month),
      monthlyData,
      overall,
      trainingCenters: trainingCenters.sort((a, b) => b.overallScore - a.overallScore),
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