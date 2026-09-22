import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const retentionQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  programmeId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = retentionQuerySchema.parse(Object.fromEntries(searchParams));

    // Get all trainees with their 30-day and 90-day outcome events
    const whereClause: Record<string, unknown> = {};
    if (query.cohortId) whereClause.cohortId = query.cohortId;

    // Build cohort filter
    const cohortFilter = query.cohortId ? { cohortId: query.cohortId } : {};

    // Get trainees with enrolments in the filtered cohorts
    const trainees = await dbDirect.trainee.findMany({
      where: {
        enrolments: {
          some: cohortFilter,
        },
      },
      include: {
        enrolments: {
          where: cohortFilter,
          include: { cohort: true },
        },
        outcomeEvents: {
          where: { checkpointDays: { in: [30, 90] } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Calculate retention metrics
    let employedAt30 = 0;
    let retainedAt90 = 0;
    let totalWith30DayOutcome = 0;
    const retentionByCohort: Record<string, { employed30: number; retained90: number; total30: number }> = {};

    for (const trainee of trainees) {
      const outcome30 = trainee.outcomeEvents.find((e) => e.checkpointDays === 30);
      const outcome90 = trainee.outcomeEvents.find((e) => e.checkpointDays === 90);

      if (outcome30) {
        totalWith30DayOutcome++;
        const isEmployed30 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus);
        
        if (isEmployed30) {
          employedAt30++;
          
          // Check if retained at 90 days
          if (outcome90) {
            const isEmployed90 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
            if (isEmployed90) {
              retainedAt90++;
            }
          }
        }

        // Track by cohort
        for (const enrolment of trainee.enrolments) {
          const cohortKey = enrolment.cohort.id;
          retentionByCohort[cohortKey] ??= { employed30: 0, retained90: 0, total30: 0 };
          retentionByCohort[cohortKey].total30++;
          if (isEmployed30) {
            retentionByCohort[cohortKey].employed30++;
            if (outcome90 && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus)) {
              retentionByCohort[cohortKey].retained90++;
            }
          }
        }
      }
    }

    const retentionRate30 = totalWith30DayOutcome > 0 ? (employedAt30 / totalWith30DayOutcome) * 100 : 0;
    const retentionRate90 = employedAt30 > 0 ? (retainedAt90 / employedAt30) * 100 : 0;

    // Cohort breakdown
    const cohortBreakdown = await Promise.all(
      Object.entries(retentionByCohort).map(async ([cohortId, data]) => {
        const cohort = await dbDirect.cohort.findUnique({ where: { id: cohortId } });
        return {
          cohortId,
          cohortName: cohort?.name ?? "Unknown",
          employedAt30: data.employed30,
          retainedAt90: data.retained90,
          totalWith30DayOutcome: data.total30,
          retentionRate30: data.total30 > 0 ? (data.employed30 / data.total30) * 100 : 0,
          retentionRate90: data.employed30 > 0 ? (data.retained90 / data.employed30) * 100 : 0,
        };
      })
    );

    return NextResponse.json({
      data: {
        summary: {
          totalWith30DayOutcome,
          employedAt30,
          retainedAt90,
          retentionRate30: Math.round(retentionRate30 * 100) / 100,
          retentionRate90: Math.round(retentionRate90 * 100) / 100,
        },
        byCohort: cohortBreakdown,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/kpis/retention error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch retention data", 500);
  }
}