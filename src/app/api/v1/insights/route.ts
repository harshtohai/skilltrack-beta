import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const insightsQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  programmeId: z.string().uuid().optional(),
});

function generateInsights(metrics: {
  outcomeCoverage: { numerator: number; denominator: number; rate: number };
  verifiedEmployment: { numerator: number; denominator: number; rate: number };
  retention: { numerator: number; denominator: number; rate: number };
  responseRate: { numerator: number; denominator: number; rate: number };
  totalTrainees: number;
  totalCertified: number;
  wageProgression?: { upwardMobilityRate: number; stableRate: number; downwardRate: number };
  trainingRelevance?: { rate: number };
}): string[] {
  const insights: string[] = [];

  // Overall summary
  insights.push(
    `This cohort has ${metrics.totalCertified} certified trainees with an outcome coverage of ${metrics.outcomeCoverage.rate.toFixed(1)}% (${metrics.outcomeCoverage.numerator}/${metrics.outcomeCoverage.denominator}).`
  );

  // Outcome coverage insights
  if (metrics.outcomeCoverage.rate >= 80) {
    insights.push(
      `✅ Excellent outcome coverage (${metrics.outcomeCoverage.rate.toFixed(1)}%) — most trainees have known employment status.`
    );
  } else if (metrics.outcomeCoverage.rate >= 50) {
    insights.push(
      `⚠️ Moderate outcome coverage (${metrics.outcomeCoverage.rate.toFixed(1)}%) — ${metrics.outcomeCoverage.denominator - metrics.outcomeCoverage.numerator} trainees still need follow-up.`
    );
  } else {
    insights.push(
      `🔴 Low outcome coverage (${metrics.outcomeCoverage.rate.toFixed(1)}%) — urgent action needed to reach ${metrics.outcomeCoverage.denominator - metrics.outcomeCoverage.numerator} trainees with unknown status.`
    );
  }

  // Verified employment insights
  if (metrics.verifiedEmployment.rate >= 60) {
    insights.push(
      `✅ Strong verified employment rate (${metrics.verifiedEmployment.rate.toFixed(1)}%) — employer confirmations validate most claims.`
    );
  } else if (metrics.verifiedEmployment.rate >= 30) {
    insights.push(
      `⚠️ Moderate verification rate (${metrics.verifiedEmployment.rate.toFixed(1)}%) — ${metrics.verifiedEmployment.denominator - metrics.verifiedEmployment.numerator} employed trainees lack employer confirmation.`
    );
  } else {
    insights.push(
      `🔴 Low verification rate (${metrics.verifiedEmployment.rate.toFixed(1)}%) — most employment claims are self-reported only.`
    );
  }

  // Retention insights
  if (metrics.retention.rate >= 80) {
    insights.push(
      `✅ High 90-day retention (${metrics.retention.rate.toFixed(1)}%) — trainees stay employed long-term.`
    );
  } else if (metrics.retention.rate >= 50) {
    insights.push(
      `⚠️ Moderate retention (${metrics.retention.rate.toFixed(1)}%) — ${metrics.retention.denominator - metrics.retention.numerator} of ${metrics.retention.denominator} employed trainees left jobs by 90 days.`
    );
  } else {
    insights.push(
      `🔴 Low retention (${metrics.retention.rate.toFixed(1)}%) — significant job churn among placed trainees.`
    );
  }

  // Response rate insights
  if (metrics.responseRate.rate >= 70) {
    insights.push(
      `✅ Good follow-up response rate (${metrics.responseRate.rate.toFixed(1)}%) — trainees are engaging with surveys.`
    );
  } else if (metrics.responseRate.rate >= 40) {
    insights.push(
      `⚠️ Moderate response rate (${metrics.responseRate.rate.toFixed(1)}%) — consider improving outreach or incentives.`
    );
  } else {
    insights.push(
      `🔴 Low response rate (${metrics.responseRate.rate.toFixed(1)}%) — follow-up strategy may need revision.`
    );
  }

  // Wage progression insights (if available)
  if (metrics.wageProgression) {
    const { upwardMobilityRate, stableRate, downwardRate } = metrics.wageProgression;
    if (upwardMobilityRate > 30) {
      insights.push(
        `📈 Strong wage progression: ${upwardMobilityRate.toFixed(1)}% of trainees moved to higher salary bands by 90 days.`
      );
    } else if (upwardMobilityRate > 10) {
      insights.push(
        `📊 Moderate wage progression: ${upwardMobilityRate.toFixed(1)}% upward mobility, ${stableRate.toFixed(1)}% stable, ${downwardRate.toFixed(1)}% downward.`
      );
    } else {
      insights.push(
        `📉 Limited wage progression: ${upwardMobilityRate.toFixed(1)}% upward mobility — most trainees remain in same salary band.`
      );
    }
  }

  // Training relevance insights (if available)
  if (metrics.trainingRelevance) {
    const { rate } = metrics.trainingRelevance;
    if (rate >= 60) {
      insights.push(
        `🎯 High training relevance (${rate.toFixed(1)}%) — most employed trainees work in roles matching their training.`
      );
    } else if (rate >= 30) {
      insights.push(
        `📋 Moderate training relevance (${rate.toFixed(1)}%) — some mismatch between training and employment roles.`
      );
    } else {
      insights.push(
        `🔍 Low training relevance (${rate.toFixed(1)}%) — consider aligning curriculum with market demand.`
      );
    }
  }

  // Actionable recommendations
  const recommendations: string[] = [];
  if (metrics.outcomeCoverage.rate < 80) {
    recommendations.push("Prioritize reaching trainees with unknown outcomes through additional follow-up attempts.");
  }
  if (metrics.verifiedEmployment.rate < 60) {
    recommendations.push("Accelerate employer verification process to confirm more employment claims.");
  }
  if (metrics.retention.rate < 70) {
    recommendations.push("Investigate reasons for job churn; consider post-placement support programs.");
  }
  if (metrics.responseRate.rate < 70) {
    recommendations.push("Improve survey response rates through better timing, incentives, or channel optimization.");
  }
  if (recommendations.length > 0) {
    insights.push("\n📋 **Recommendations:**");
    insights.push(...recommendations.map((r, i) => `${i + 1}. ${r}`));
  }

  return insights;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = insightsQuerySchema.parse(Object.fromEntries(searchParams));

    // Build cohort filter
    const cohortFilter: Record<string, unknown> = {};
    if (query.cohortId) cohortFilter.cohortId = query.cohortId;
    if (query.programmeId) cohortFilter.cohort = { programmeId: query.programmeId };

    // Get trainees in scope
    const trainees = await db.trainee.findMany({
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
        employmentClaims: {
          include: { verificationRequests: true },
        },
        outcomeEvents: {
          where: { checkpointDays: { in: [30, 90] } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Calculate metrics
    let totalWith30DayOutcome = 0;
    let employedAt30 = 0;
    let retainedAt90 = 0;
    const totalCertified = trainees.length;
    let totalWithKnownOutcome = 0;
    let verifiedEmployed = 0;
    let responseRateDenom = 0;
    let responseRateNum = 0;

    for (const trainee of trainees) {
      const outcome30 = trainee.outcomeEvents.find((e) => e.checkpointDays === 30);
      const outcome90 = trainee.outcomeEvents.find((e) => e.checkpointDays === 90);
      const latestClaim = trainee.employmentClaims[0];
      const hasVerification = latestClaim?.verificationRequests?.some((v) => v.action === "CONFIRMED");

      if (outcome30) {
        totalWith30DayOutcome++;
        const isEmployed30 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus);
        if (isEmployed30) {
          employedAt30++;
          if (outcome90) {
            const isEmployed90 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
            if (isEmployed90) retainedAt90++;
          }
        }
      }
      if (outcome30 && outcome30.outcomeStatus !== "UNKNOWN") {
        totalWithKnownOutcome++;
        if (hasVerification && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus)) {
          verifiedEmployed++;
        }
      }

      // Response rate from followup events
      const followups = await db.followupEvent.findMany({
        where: { traineeId: trainee.id },
      });
      responseRateDenom += followups.filter((f) => f.status === "SENT" || f.status === "RESPONDED").length;
      responseRateNum += followups.filter((f) => f.status === "RESPONDED").length;
    }

    // Get wage progression data
    let wageProgressionData: { upwardMobilityRate: number; stableRate: number; downwardRate: number } | undefined;
    try {
      const claims = await db.employmentClaim.findMany({
        where: { followupEvent: cohortFilter },
        include: { followupEvent: true },
      });
      const claimsByTrainee: Record<string, typeof claims[0][]> = {};
      claims.forEach((c) => {
        const arr = claimsByTrainee[c.traineeId] ?? [];
        arr.push(c);
        claimsByTrainee[c.traineeId] = arr;
      });
      let totalWithProgression = 0;
      let upwardMobility = 0;
      let stable = 0;
      let downward = 0;
      const salaryBandOrder = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"];
      Object.entries(claimsByTrainee).forEach(([, traineeClaims]) => {
        const claim30 = traineeClaims.find((c) => c.followupEvent?.checkpointDays === 30);
        const claim90 = traineeClaims.find((c) => c.followupEvent?.checkpointDays === 90);
        if (claim30 && claim90 && claim30.salaryBand && claim90.salaryBand) {
          const idx30 = salaryBandOrder.indexOf(claim30.salaryBand);
          const idx90 = salaryBandOrder.indexOf(claim90.salaryBand);
          totalWithProgression++;
          if (idx90 > idx30) upwardMobility++;
          else if (idx90 === idx30) stable++;
          else downward++;
        }
      });
      if (totalWithProgression > 0) {
        wageProgressionData = {
          upwardMobilityRate: (upwardMobility / totalWithProgression) * 100,
          stableRate: (stable / totalWithProgression) * 100,
          downwardRate: (downward / totalWithProgression) * 100,
        };
      }
    } catch {
      // wage progression optional
    }

    // Get training relevance data
    let trainingRelevanceData: { rate: number } | undefined;
    try {
      // Get claims with followupEvent and outcomeEvents
      const claimsWithProgramme = await db.employmentClaim.findMany({
        where: { followupEvent: cohortFilter },
        include: {
          followupEvent: { include: { cohort: { include: { programme: true } } } },
          outcomeEvents: { where: { checkpointDays: 30 } },
        },
      });
      let trainingRelevanceCount = 0;
      let trainingRelevanceTotal = 0;
      claimsWithProgramme.forEach((claim) => {
        const outcome30 = claim.outcomeEvents.find((e) => e.checkpointDays === 30);
        const isEmployed = outcome30 && ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus);
        if (isEmployed && claim.role && claim.followupEvent?.cohort?.programme) {
          trainingRelevanceTotal++;
          const programmeName = claim.followupEvent.cohort.programme.name.toLowerCase();
          const role = claim.role.toLowerCase();
          const keywords = programmeName.split(/[\s\-]+/).filter((w: string) => w.length > 3);
          const matches = keywords.some((k: string) => role.includes(k));
          if (matches) trainingRelevanceCount++;
        }
      });
      if (trainingRelevanceTotal > 0) {
        trainingRelevanceData = { rate: (trainingRelevanceCount / trainingRelevanceTotal) * 100 };
      }
    } catch {
      // training relevance optional
    }

    const outcomeCoverageRate = totalCertified > 0 ? (totalWithKnownOutcome / totalCertified) * 100 : 0;
    const verifiedEmploymentRate = totalWithKnownOutcome > 0 ? (verifiedEmployed / totalWithKnownOutcome) * 100 : 0;
    const retentionRate = employedAt30 > 0 ? (retainedAt90 / employedAt30) * 100 : 0;
    const responseRate = responseRateDenom > 0 ? (responseRateNum / responseRateDenom) * 100 : 0;

    const insights = generateInsights({
      outcomeCoverage: { numerator: totalWithKnownOutcome, denominator: totalCertified, rate: outcomeCoverageRate },
      verifiedEmployment: { numerator: verifiedEmployed, denominator: totalWithKnownOutcome, rate: verifiedEmploymentRate },
      retention: { numerator: retainedAt90, denominator: employedAt30, rate: retentionRate },
      responseRate: { numerator: responseRateNum, denominator: responseRateDenom, rate: responseRate },
      totalTrainees: trainees.length,
      totalCertified,
      wageProgression: wageProgressionData,
      trainingRelevance: trainingRelevanceData,
    });

    return NextResponse.json({
      data: {
        insights,
        generatedAt: new Date().toISOString(),
        metrics: {
          outcomeCoverage: { numerator: totalWithKnownOutcome, denominator: totalCertified, rate: Math.round(outcomeCoverageRate * 10) / 10 },
          verifiedEmployment: { numerator: verifiedEmployed, denominator: totalWithKnownOutcome, rate: Math.round(verifiedEmploymentRate * 10) / 10 },
          retention: { numerator: retainedAt90, denominator: employedAt30, rate: Math.round(retentionRate * 10) / 10 },
          responseRate: { numerator: responseRateNum, denominator: responseRateDenom, rate: Math.round(responseRate * 10) / 10 },
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/insights error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to generate insights", 500);
  }
}