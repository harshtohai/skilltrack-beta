import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import {
  buildSnapshotRow,
  HISTORY_DAYS,
  toHistoryEntry,
  upsertSnapshot,
  utcDay,
  type SnapshotRow,
} from "~/server/kpi-snapshots";
import { createErrorResponse } from "../../_utils";

export const dynamic = "force-dynamic";

// Shared metric shape (one day × one scope) — the live computation and the
// daily snapshot row both feed the same response builder.
interface OverviewMetrics {
  totalTrainees: number;
  certified: number;
  outcomeKnown: number;
  employed: number;
  verified: number;
  conflicts: number;
  followupsSent: number;
  followupsResponded: number;
}

type RecentActivityItem = {
  type: "FOLLOWUP" | "CLAIM" | "VERIFICATION";
  date: string;
  title: string;
  traineeName: string;
  traineePublicId?: string | null;
};

function overviewResponse(
  metrics: OverviewMetrics,
  recentActivity: RecentActivityItem[],
  history: Array<ReturnType<typeof toHistoryEntry>>,
) {
  return NextResponse.json({
    trainees: {
      total: metrics.totalTrainees,
      numerator: metrics.totalTrainees,
      denominator: metrics.totalTrainees,
    },
    outcomeCoverage: {
      rate: metrics.totalTrainees > 0 ? Math.round((metrics.outcomeKnown / metrics.totalTrainees) * 100) : 0,
      numerator: metrics.outcomeKnown,
      denominator: metrics.totalTrainees,
    },
    verifiedEmployment: {
      rate: metrics.outcomeKnown > 0 ? Math.round((metrics.verified / metrics.outcomeKnown) * 100) : 0,
      numerator: metrics.verified,
      denominator: metrics.outcomeKnown,
    },
    conflicts: {
      count: metrics.conflicts,
    },
    funnel: {
      certified: { count: metrics.certified, label: "Certified" },
      outcomeKnown: { count: metrics.outcomeKnown, label: "Outcome Known" },
      employed: { count: metrics.employed, label: "Employed" },
      verified: { count: metrics.verified, label: "Verified" },
    },
    followupResponseRate: {
      rate: metrics.followupsSent > 0 ? Math.round((metrics.followupsResponded / metrics.followupsSent) * 100) : 0,
      numerator: metrics.followupsResponded,
      denominator: metrics.followupsSent,
    },
    recentActivity,
    history,
  });
}

export async function GET(request: NextRequest) {
  try {
    // INST-04: institutes see only their center's numbers, filtered through
    // cohorts (same center claim as the trainees route); admin stays unscoped.
    // Claims and followups reach the center via the trainee's enrolments.
    const scope = await getSessionScope();
    const centerFilter = scope.centerId
      ? { cohort: { trainingCenterId: scope.centerId } }
      : null;
    const viaTrainee = centerFilter
      ? { trainee: { enrolments: { some: centerFilter } } }
      : {};

    const loadRecentActivity = async (): Promise<RecentActivityItem[]> => {
      // Recent activity timeline (latest events across the scoped trainees)
      const [recentFollowups, recentClaims, recentVerifications] = await Promise.all([
        db.followupEvent.findMany({
          where: { status: { in: ["SENT", "RESPONDED"] }, ...viaTrainee },
          include: { trainee: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        db.employmentClaim.findMany({
          where: viaTrainee,
          include: { trainee: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        db.verificationRequest.findMany({
          where: {
            usedAt: { not: null },
            ...(centerFilter
              ? { employmentClaim: { trainee: { enrolments: { some: centerFilter } } } }
              : {}),
          },
          include: { employmentClaim: { include: { trainee: true } } },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);

      return [
        ...recentFollowups.map((f) => ({
          type: "FOLLOWUP" as const,
          date: (f.sentAt ?? f.createdAt).toISOString(),
          title: `${f.checkpointDays}-day follow-up ${f.status === "RESPONDED" ? "responded" : "sent"}`,
          traineeName: f.trainee.fullName,
          traineePublicId: f.trainee.publicId,
        })),
        ...recentClaims.map((c) => ({
          type: "CLAIM" as const,
          date: c.createdAt.toISOString(),
          title: `Employment claim (${c.verificationStatus.toLowerCase().replace(/_/g, " ")})`,
          traineeName: c.trainee.fullName,
          traineePublicId: c.trainee.publicId,
        })),
        ...recentVerifications.map((v) => ({
          type: "VERIFICATION" as const,
          date: (v.usedAt ?? v.createdAt).toISOString(),
          title: `Employer ${v.action?.toLowerCase() ?? "pending"}`,
          traineeName: v.employmentClaim?.trainee.fullName ?? "Unknown",
          traineePublicId: v.employmentClaim?.trainee.publicId,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 15);
    };

    // Daily KPI snapshot (perf #1/#5): the first hit of the day computes and
    // stores; every later hit is an indexed read + history query instead of
    // the COUNT storm. `?fresh=1` (dashboard Refresh button) skips the
    // snapshot read and recomputes live — the upsert then refreshes the shared
    // row, so every subsequent viewer gets the fresh numbers too. The snapshot
    // read is wrapped so a missing/unapplied table or a pooler flake falls
    // back to the live computation — the dashboard never breaks.
    // trainingCenterId null matches the org-wide (admin) row; find-then-write
    // also covers the admin scope on persist.
    const forceFresh = request.nextUrl.searchParams.get("fresh") === "1";
    const today = utcDay();
    let todaySnapshot: OverviewMetrics | null = null;
    if (!forceFresh) {
      try {
        todaySnapshot = await db.kpiDailySnapshot.findFirst({
          where: { snapshotDate: today, trainingCenterId: scope.centerId },
          orderBy: { updatedAt: "desc" },
        });
      } catch (error) {
        console.error("Snapshot read failed — falling back to live computation:", error);
      }
    }

    if (todaySnapshot) {
      // Snapshot present: serve the stored row + last 7 days of history
      // (single indexed findMany, oldest → newest, today included). Recent
      // activity stays live — cheap take-8 queries, contract unchanged.
      // Deltas are derived client-side from history.
      const cutoff = utcDay(today);
      cutoff.setUTCDate(cutoff.getUTCDate() - (HISTORY_DAYS - 1));
      const [historyRows, recentActivity] = await Promise.all([
        db.kpiDailySnapshot.findMany({
          where: {
            trainingCenterId: scope.centerId,
            snapshotDate: { gte: cutoff, lte: today },
          },
          orderBy: { snapshotDate: "asc" },
        }),
        loadRecentActivity(),
      ]);
      return overviewResponse(
        todaySnapshot,
        recentActivity,
        historyRows.map(toHistoryEntry),
      );
    }

    // Snapshot miss → run the existing live computation once, upsert it,
    // return it. Parallelized counts — all 7 independent COUNT queries run
    // concurrently to avoid the sequential DB round-trip storm that causes
    // 6.5–8.3s warm latency and 24s+ during pooler flakiness.
    const [
      totalTraineesResult,
      traineesWithOutcomeResult,
      verifiedEmployedResult,
      conflictsResult,
      employedResult,
      followupsSentResult,
      followupsRespondedResult,
    ] = await Promise.all([
      db.trainee.count({
        where: {
          enrolments: { some: centerFilter ?? {} },
        },
      }),
      db.trainee.count({
        where: {
          ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
          outcomeEvents: { some: { outcomeStatus: { not: "UNKNOWN" } } },
        },
      }),
      db.trainee.count({
        where: {
          employmentClaims: { some: { verificationStatus: "EMPLOYER_CONFIRMED" } },
          ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
        },
      }),
      db.employmentClaim.count({
        where: { verificationStatus: "CONFLICT", ...viaTrainee },
      }),
      db.trainee.count({
        where: {
          employmentClaims: {
            some: {
              verificationStatus: { in: ["SELF_REPORTED", "EMPLOYER_CONFIRMED"] },
              OR: [
                { employerName: { not: null } },
                { nonPlacementReason: { not: null } },
              ],
            },
          },
          ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
        },
      }),
      // Follow-up response rate — denominator counts followups EVER sent
      // (SENT, RESPONDED, FAILED, EXPIRED), not just those currently in the
      // SENT state: a RESPONDED followup was sent first (SCHEDULED → SENT →
      // RESPONDED), so counting only status === "SENT" undercounted the
      // denominator and produced an impossible 903% response rate.
      db.followupEvent.count({
        where: { status: { in: ["SENT", "RESPONDED", "FAILED", "EXPIRED"] }, ...viaTrainee },
      }),
      db.followupEvent.count({
        where: { status: "RESPONDED", ...viaTrainee },
      }),
    ]);

    const totalTrainees = totalTraineesResult;
    const traineesWithOutcome = traineesWithOutcomeResult;
    const verifiedEmployed = verifiedEmployedResult;
    const conflicts = conflictsResult;
    const employed = employedResult;
    const followupsSent = followupsSentResult;
    const followupsResponded = followupsRespondedResult;

    // Funnel aliases (same units as the stages above)
    const certified = totalTrainees;
    const outcomeKnown = traineesWithOutcome;
    const verified = verifiedEmployed;

    const snapshotRow: SnapshotRow = buildSnapshotRow(
      {
        totalTrainees,
        certified,
        outcomeKnown,
        employed,
        verified,
        conflicts,
        followupsSent,
        followupsResponded,
      },
      scope.centerId,
      today,
    );

    // Persistence is best-effort: a pooler flake must not fail the request —
    // the live numbers are already in hand.
    try {
      await upsertSnapshot(snapshotRow);
    } catch (error) {
      console.error("Snapshot upsert failed — serving live numbers:", error);
    }

    const recentActivity = await loadRecentActivity();

    return overviewResponse(
      snapshotRow,
      recentActivity,
      [toHistoryEntry(snapshotRow)],
    );
  } catch (error) {
    console.error("GET /api/v1/kpis/overview error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch KPIs", 500);
  }
}
