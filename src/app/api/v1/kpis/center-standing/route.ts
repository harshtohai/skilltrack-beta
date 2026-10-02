import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { getGroupedRates, getTrainingCenterScores } from "~/server/analytics";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse } from "../../_utils";

export const dynamic = "force-dynamic";

/**
 * Institute dashboard (INST-04): the center's standing in the overall
 * leaderboard (pure scoring engine via getTrainingCenterScores) plus
 * per-cohort performance rows (getGroupedRates), scoped to the session's
 * center. Institute-only — admin and other roles have no center.
 */
export async function GET() {
  try {
    const scope = await getSessionScope();
    if (scope.role !== "institute" || !scope.centerId) {
      return createErrorResponse("FORBIDDEN", "Only institute accounts have a center", 403);
    }
    const centerId = scope.centerId;

    const [scores, grouped, cohorts] = await Promise.all([
      getTrainingCenterScores(),
      getGroupedRates(),
      db.cohort.findMany({
        where: { trainingCenterId: centerId },
        select: {
          id: true,
          name: true,
          programme: { select: { name: true } },
          _count: { select: { enrolments: true } },
        },
        orderBy: { startDate: "desc" },
      }),
    ]);

    // Leaderboard rank: overallScore desc — same ordering as the analytics page
    const ranked = [...scores].sort((a, b) => b.overallScore - a.overallScore);
    const index = ranked.findIndex((c) => c.centerId === centerId);
    const mine = index >= 0 ? (ranked[index] ?? null) : null;

    const cohortRates = new Map(grouped.byCohort.map((c) => [c.key, c]));

    return NextResponse.json({
      standing: mine
        ? {
            centerName: mine.centerName,
            rank: index + 1,
            totalCenters: ranked.length,
            overallScore: mine.overallScore,
            placementScore: mine.placementScore,
            academicScore: mine.academicScore,
            volumeScore: mine.volumeScore,
          }
        : null,
      cohorts: cohorts.map((c) => ({
        id: c.id,
        name: c.name,
        programme: c.programme.name,
        trainees: c._count.enrolments,
        placementRate: cohortRates.get(c.id)?.placementRate ?? 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/kpis/center-standing error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch center standing", 500);
  }
}
