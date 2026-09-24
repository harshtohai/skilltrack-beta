import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { computeEmployerRetention, normalizeEmployerName } from "~/server/scoring";
import { recommendCourses, recommendEmployers } from "~/server/recommendations";
import { EMPLOYED_STATUSES } from "~/server/analytics";
import { createErrorResponse } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

// Translation layer: the bot's skill-gap option values → course skill keywords
const GAP_KEYWORDS: Record<string, string[]> = {
  gap_technical: ["technical", "digital", "computer", "electronics", "mobile-repair", "software", "web-development", "programming"],
  gap_communication: ["communication", "english", "interview-skills", "soft"],
  gap_analytical: ["data", "analytical", "excel", "reporting", "ms-office", "data-entry"],
};

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const [trainee, courses, claims, outcomes] = await Promise.all([
      db.trainee.findUnique({
        where: { id: traineeId },
        select: { district: true },
      }),
      db.course.findMany({
        select: { id: true, name: true, category: true, skills: true, durationWeeks: true, level: true, provider: true },
      }),
      db.employmentClaim.findMany({
        select: { id: true, traineeId: true, employerName: true, verificationStatus: true },
      }),
      db.outcomeEvent.findMany({
        select: { traineeId: true, checkpointDays: true, outcomeStatus: true, employmentClaimId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    // Latest known outcome determines employment status
    const latestKnown = [...outcomes].reverse().find((o) => o.outcomeStatus !== "UNKNOWN");
    const employed = latestKnown
      ? (EMPLOYED_STATUSES as readonly string[]).includes(latestKnown.outcomeStatus)
      : false;

    // Skill gaps from the most recent survey response, expanded to course keywords
    const latestSurvey = await db.surveyResponse.findFirst({
      where: { traineeId, skillGaps: { isEmpty: false } },
      orderBy: { completedAt: "desc" },
      select: { skillGaps: true },
    });
    const rawGaps = latestSurvey?.skillGaps ?? [];
    const skillGaps = [...rawGaps, ...rawGaps.flatMap((gap) => GAP_KEYWORDS[gap] ?? [])];

    // Employer retention: confirmed claims with later-checkpoint sustained employment
    const outcomeByClaim = new Map<string, { traineeId: string; checkpointDays: number; createdAt: Date }>();
    for (const o of outcomes) {
      if (o.employmentClaimId) {
        outcomeByClaim.set(o.employmentClaimId, {
          traineeId: o.traineeId,
          checkpointDays: o.checkpointDays,
          createdAt: o.createdAt,
        });
      }
    }

    const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);
    const isVerified = (status: string) =>
      (["EMPLOYER_CONFIRMED", "DOCUMENT_VERIFIED"] as readonly string[]).includes(status);

    // Sustained employment per claim: a later checkpoint for the same trainee still employed
    const sustainedByClaim = new Map<string, boolean | null>();
    for (const [claimId, ref] of outcomeByClaim) {
      const later = [...outcomes]
        .reverse()
        .find(
          (o) =>
            o.traineeId === ref.traineeId &&
            o.checkpointDays > ref.checkpointDays &&
            o.createdAt > ref.createdAt
        );
      // UNKNOWN later checkpoint = insufficient evidence, not "not sustained"
      sustainedByClaim.set(
        claimId,
        later && later.outcomeStatus !== "UNKNOWN" ? isEmployed(later.outcomeStatus) : null
      );
    }

    // Group claims by normalized employer name
    const byEmployer = new Map<
      string,
      { employerName: string; confirmed: boolean; sustainedEmployment: boolean | null }[]
    >();
    for (const claim of claims) {
      if (!claim.employerName || !claim.traineeId) continue;
      const key = normalizeEmployerName(claim.employerName);
      const list = byEmployer.get(key) ?? [];
      list.push({
        employerName: key,
        confirmed: isVerified(claim.verificationStatus),
        sustainedEmployment: sustainedByClaim.get(claim.id) ?? null,
      });
      byEmployer.set(key, list);
    }

    const employerRetentions = [...byEmployer.entries()].map(([name, claimList]) => {
      const retention = computeEmployerRetention(claimList);
      return {
        employerName: name,
        retentionScore: retention.score,
        claimCount: claimList.length,
      };
    });

    const courseRecommendations = recommendCourses(
      { skillGaps, employed, district: trainee.district },
      courses
    );
    const employerRecommendations = recommendEmployers(employerRetentions);

    return NextResponse.json({
      skillGaps,
      employed,
      courses: courseRecommendations,
      employers: employerRecommendations,
    });
  } catch (error) {
    console.error("GET /api/v1/trainee/recommendations error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch recommendations", 500);
  }
}
