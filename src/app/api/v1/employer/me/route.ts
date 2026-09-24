import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { computeEmployerRetention, normalizeEmployerName, percentile75 } from "~/server/scoring";
import { EMPLOYED_STATUSES, VERIFIED_STATUSES } from "~/server/analytics";
import { createErrorResponse } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

interface ClaimRow {
  id: string;
  traineeId: string;
  employerName: string | null;
  role: string | null;
  salaryBand: string | null;
  verificationStatus: string;
  evidenceLevel: number;
  createdAt: Date;
  followupEventId: string;
}

function isVerifiedStatus(status: string): boolean {
  return (VERIFIED_STATUSES as readonly string[]).includes(status);
}

/**
 * Employer analytics: retention score, claims timeline, verification
 * history, wage-band distribution and retention ranking vs peers.
 * The demo employer (no linked claim) sees the aggregate across all
 * employers, clearly labeled.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "employer") {
      return createErrorResponse("UNAUTHORIZED", "Employer session required", 401);
    }

    const allClaims = (await db.employmentClaim.findMany({
      select: {
        id: true,
        traineeId: true,
        employerName: true,
        role: true,
        salaryBand: true,
        verificationStatus: true,
        evidenceLevel: true,
        createdAt: true,
        followupEventId: true,
      },
    })) as ClaimRow[];

    // Resolve employer identity
    const isDemo = session.user.id === "employer-demo";
    let employerName: string | null = null;
    if (!isDemo && session.user.id.startsWith("employer-")) {
      const ownClaimId = session.user.id.slice("employer-".length);
      const ownClaim = allClaims.find((c) => c.id === ownClaimId);
      employerName = ownClaim?.employerName ? normalizeEmployerName(ownClaim.employerName) : null;
    }

    const scoped = isDemo
      ? allClaims
      : allClaims.filter((c) => c.employerName && normalizeEmployerName(c.employerName) === employerName);

    const allOutcomes = await db.outcomeEvent.findMany({
      select: {
        traineeId: true,
        checkpointDays: true,
        outcomeStatus: true,
        employmentClaimId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Per-trainee outcome index for O(1) lookups
    const eventsByTrainee = new Map<
      string,
      { checkpointDays: number; outcomeStatus: string; createdAt: Date; claimId: string | null }[]
    >();
    for (const o of allOutcomes) {
      const list = eventsByTrainee.get(o.traineeId) ?? [];
      list.push({
        checkpointDays: o.checkpointDays,
        outcomeStatus: o.outcomeStatus,
        createdAt: o.createdAt,
        claimId: o.employmentClaimId,
      });
      eventsByTrainee.set(o.traineeId, list);
    }

    const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);

    // Retention: sustained employment at a later checkpoint for confirmed claims
    const laterOutcome = new Map<string, string>();
    for (const claim of scoped) {
      const events = eventsByTrainee.get(claim.traineeId) ?? [];
      const own = events.find((e) => e.claimId === claim.id);
      if (!own) continue;
      const later = [...events]
        .reverse()
        .find((e) => e.createdAt > own.createdAt && e.checkpointDays > own.checkpointDays);
      // UNKNOWN later checkpoint = insufficient evidence, not "not sustained"
      if (later && later.outcomeStatus !== "UNKNOWN") {
        laterOutcome.set(claim.id, later.outcomeStatus);
      }
    }

    const retention = computeEmployerRetention(
      scoped.map((claim) => ({
        employerName: claim.employerName ?? "Unknown",
        confirmed: isVerifiedStatus(claim.verificationStatus),
        sustainedEmployment: laterOutcome.has(claim.id)
          ? isEmployed(laterOutcome.get(claim.id) ?? "")
          : null,
      }))
    );

    // Claims timeline: count by month
    const byMonth = new Map<string, number>();
    for (const claim of scoped) {
      const label = claim.createdAt.toLocaleString("en-US", { month: "short", year: "numeric" });
      byMonth.set(label, (byMonth.get(label) ?? 0) + 1);
    }
    const timeline = [...byMonth.entries()].map(([month, count]) => ({ month, count }));

    // Verification history: counts by status
    const byStatus = new Map<string, number>();
    for (const claim of scoped) {
      byStatus.set(claim.verificationStatus, (byStatus.get(claim.verificationStatus) ?? 0) + 1);
    }
    const verificationHistory = [...byStatus.entries()].map(([status, count]) => ({ status, count }));

    // Wage-band distribution
    const byBand = new Map<string, number>();
    for (const claim of scoped) {
      if (!claim.salaryBand) continue;
      byBand.set(claim.salaryBand, (byBand.get(claim.salaryBand) ?? 0) + 1);
    }
    const wageBands = [...byBand.entries()].map(([band, count]) => ({ band, count }));

    // Retention ranking vs peers (all employers with claims)
    const byEmployer = new Map<
      string,
      { employerName: string; confirmed: boolean; sustainedEmployment: boolean | null }[]
    >();
    for (const claim of allClaims) {
      if (!claim.employerName) continue;
      const key = normalizeEmployerName(claim.employerName);
      const list = byEmployer.get(key) ?? [];
      const laterStatus = laterOutcome.get(claim.id);
      list.push({
        employerName: key,
        confirmed: isVerifiedStatus(claim.verificationStatus),
        sustainedEmployment: laterStatus ? isEmployed(laterStatus) : null,
      });
      byEmployer.set(key, list);
    }

    const peerScores: number[] = [];
    for (const [, claimList] of byEmployer) {
      const r = computeEmployerRetention(claimList);
      if (r.score !== null) peerScores.push(r.score);
    }
    const myScore = retention.score;
    const rank = myScore !== null
      ? peerScores.filter((s) => s > myScore).length + 1
      : null;
    const peerAvg = peerScores.length > 0
      ? Math.round(peerScores.reduce((a, b) => a + b, 0) / peerScores.length)
      : null;
    const peerTopQuartile = peerScores.length > 0 ? Math.round(percentile75(peerScores)) : null;

    // Recent claims for the table
    const recentClaims = [...scoped]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((claim) => ({
        id: claim.id,
        traineeId: claim.traineeId,
        employerName: claim.employerName,
        role: claim.role,
        salaryBand: claim.salaryBand,
        verificationStatus: claim.verificationStatus,
        createdAt: claim.createdAt.toISOString(),
      }));

    return NextResponse.json({
      employer: {
        name: isDemo ? "All Employers (Demo View)" : employerName ?? "Employer",
        isDemo,
        totalClaims: scoped.length,
        verifiedClaims: scoped.filter((c) => isVerifiedStatus(c.verificationStatus)).length,
      },
      retention: {
        score: retention.score,
        numerator: retention.numerator,
        denominator: retention.denominator,
      },
      ranking: {
        rank,
        of: peerScores.length,
        peerAvg,
        peerTopQuartile,
      },
      timeline,
      verificationHistory,
      wageBands,
      recentClaims,
    });
  } catch (error) {
    console.error("GET /api/v1/employer/me error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch employer analytics", 500);
  }
}
