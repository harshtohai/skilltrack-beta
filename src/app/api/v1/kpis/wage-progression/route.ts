import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

const wageProgressionQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  programmeId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = wageProgressionQuerySchema.parse(Object.fromEntries(searchParams));

    // Build cohort filter
    const cohortFilter: Record<string, unknown> = {};
    if (query.cohortId) cohortFilter.cohortId = query.cohortId;
    if (query.programmeId) cohortFilter.cohort = { programmeId: query.programmeId };

    // Get all employment claims with salary bands and trainee info
    const claims = await db.employmentClaim.findMany({
      where: {
        salaryBand: { not: null },
        followupEvent: cohortFilter,
      },
      include: {
        trainee: {
          select: { id: true, publicId: true, fullName: true, district: true },
        },
        followupEvent: {
          include: {
            cohort: { select: { id: true, name: true, programmeId: true }, include: { programme: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get all outcome events for 30-day and 90-day to track progression
    const traineesWithClaims = claims.map((c) => c.traineeId);
    const outcomeEvents = await db.outcomeEvent.findMany({
      where: {
        traineeId: { in: traineesWithClaims },
        checkpointDays: { in: [30, 90] },
        outcomeStatus: { in: ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"] },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by salary band at 30-day
    const salaryBandOrder = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"];
    const bandLabels: Record<string, string> = {
      LT_10K: "< ₹10K",
      B_10_20K: "₹10-20K",
      B_20_35K: "₹20-35K",
      B_35_50K: "₹35-50K",
      GT_50K: "> ₹50K",
    };

    // Track progression: 30-day band -> 90-day band
    const progressionMatrix: Record<string, Record<string, number>> = {};
    salaryBandOrder.forEach((band) => {
      progressionMatrix[band] = {};
      salaryBandOrder.forEach((band2) => {
        progressionMatrix[band]![band2] = 0;
      });
    });

    // Map trainee -> their 30-day outcome event
    const traineeTo30Day: Record<string, { salaryBand: string | null; outcomeStatus: string }> = {};
    const traineeTo90Day: Record<string, { salaryBand: string | null; outcomeStatus: string }> = {};

    outcomeEvents.forEach((e) => {
      if (e.checkpointDays === 30) {
        traineeTo30Day[e.traineeId] = { salaryBand: e.verificationStatus === "EMPLOYER_CONFIRMED" ? "EMPLOYED" : e.outcomeStatus, outcomeStatus: e.outcomeStatus };
      } else if (e.checkpointDays === 90) {
        traineeTo90Day[e.traineeId] = { salaryBand: e.verificationStatus === "EMPLOYER_CONFIRMED" ? "EMPLOYED" : e.outcomeStatus, outcomeStatus: e.outcomeStatus };
      }
    });

    // For wage progression, we need to get the salary band from claims at different checkpoints
    // For now, use the claim's salary band as 30-day, and find 90-day retention events
    const claimsByTrainee: Record<string, typeof claims[0][]> = {};
    claims.forEach((c) => {
      const arr = claimsByTrainee[c.traineeId] ?? [];
      arr.push(c);
      claimsByTrainee[c.traineeId] = arr;
    });

    // Build progression data
    let totalWithProgression = 0;
    let upwardMobility = 0;
    let stable = 0;
    let downward = 0;

    Object.entries(claimsByTrainee).forEach(([traineeId, traineeClaims]) => {
      const claim30 = traineeClaims.find((c) => c.followupEvent?.checkpointDays === 30);
      const claim90 = traineeClaims.find((c) => c.followupEvent?.checkpointDays === 90);

      if (claim30 && claim90 && claim30.salaryBand && claim90.salaryBand) {
        const band30 = claim30.salaryBand;
        const band90 = claim90.salaryBand;
        if (!progressionMatrix[band30]) progressionMatrix[band30] = {};
        progressionMatrix[band30][band90] = (progressionMatrix[band30][band90] || 0) + 1;
        totalWithProgression++;

        const idx30 = salaryBandOrder.indexOf(band30);
        const idx90 = salaryBandOrder.indexOf(band90);
        if (idx90 > idx30) upwardMobility++;
        else if (idx90 === idx30) stable++;
        else downward++;
      }
    });

    // Training relevance: percentage of employed whose role matches their training
    // This is a proxy - we'll use self-reported data if available
    const employedClaims = claims.filter((c) => ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(c.verificationStatus || ""));
    // Since we don't have training field data, we'll compute a proxy metric
    // based on role keywords matching programme names (simplified)
    let trainingRelevanceCount = 0;
    let trainingRelevanceTotal = 0;

    employedClaims.forEach((claim) => {
      if (claim.role && claim.followupEvent?.cohort?.programme) {
        trainingRelevanceTotal++;
        const programmeName = claim.followupEvent.cohort.programme.name.toLowerCase();
        const role = claim.role.toLowerCase();
        // Simple keyword matching
        const keywords = programmeName.split(/[\s\-]+/).filter((w) => w.length > 3);
        const matches = keywords.some((k) => role.includes(k));
        if (matches) trainingRelevanceCount++;
      }
    });

    const trainingRelevanceRate = trainingRelevanceTotal > 0 ? (trainingRelevanceCount / trainingRelevanceTotal) * 100 : 0;

    // Build response
    const progressionData = salaryBandOrder.map((band30) => ({
      band30: bandLabels[band30],
      progression: salaryBandOrder.map((band90) => ({
        band90: bandLabels[band90],
        count: progressionMatrix[band30]?.[band90] ?? 0,
      })),
      total: salaryBandOrder.reduce((sum, b) => sum + (progressionMatrix[band30]?.[b] ?? 0), 0),
    }));

    return NextResponse.json({
      data: {
        progressionMatrix: progressionData,
        summary: {
          totalWithProgression,
          upwardMobility,
          stable,
          downward,
          upwardMobilityRate: totalWithProgression > 0 ? Math.round((upwardMobility / totalWithProgression) * 10000) / 100 : 0,
          stableRate: totalWithProgression > 0 ? Math.round((stable / totalWithProgression) * 10000) / 100 : 0,
          downwardRate: totalWithProgression > 0 ? Math.round((downward / totalWithProgression) * 10000) / 100 : 0,
        },
        trainingRelevance: {
          relevant: trainingRelevanceCount,
          total: trainingRelevanceTotal,
          rate: Math.round(trainingRelevanceRate * 100) / 100,
        },
        salaryBandDistribution: salaryBandOrder.map((band) => ({
          band: bandLabels[band],
          count: claims.filter((c) => c.salaryBand === band).length,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/kpis/wage-progression error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch wage progression data", 500);
  }
}