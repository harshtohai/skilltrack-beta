/**
 * Daily KPI snapshot rollup. `buildSnapshotRow` and the history window are
 * pure (no Prisma, no IO — same discipline as scoring.ts); `upsertSnapshot`
 * is the idempotent persistence helper (upsert on (snapshotDate,
 * trainingCenterId), so a second rollup for the same day/scope updates
 * instead of duplicating).
 *
 * The KPI overview endpoint checks today's snapshot first: present → serve
 * it + 7-day history and skip the live COUNT storm; absent → run the live
 * computation once, upsert it, return it. First hit of the day pays the
 * cost, everyone after is an indexed single-row read.
 */

import { db } from "~/server/db";

/** Flat counts from the KPI overview live queries → snapshot row shape. */
export interface KpiCounts {
  totalTrainees: number;
  certified: number;
  outcomeKnown: number;
  employed: number;
  verified: number;
  conflicts: number;
  followupsSent: number;
  followupsResponded: number;
}

/** One day × one scope (trainingCenterId null = org-wide admin scope). */
export interface SnapshotRow extends KpiCounts {
  /** Date-only bucket (UTC midnight) — the snapshot's calendar day. */
  snapshotDate: Date;
  trainingCenterId: string | null;
}

/** How many days of history the overview endpoint returns (incl. today). */
export const HISTORY_DAYS = 7;

/**
 * Date-only bucket for "today" (UTC midnight). Snapshots bucket by calendar
 * day so every rollup for the same day lands on one row per scope.
 */
export function utcDay(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Live query results → snapshot row, same KPI semantics as the endpoint:
 * trainee-based funnel, ever-sent followup denominator. Defaults to today
 * (UTC) and org-wide scope; institute routes pass their centerId.
 */
export function buildSnapshotRow(
  counts: KpiCounts,
  trainingCenterId: string | null = null,
  snapshotDate: Date = utcDay(),
): SnapshotRow {
  return {
    snapshotDate,
    trainingCenterId,
    totalTrainees: counts.totalTrainees,
    certified: counts.certified,
    outcomeKnown: counts.outcomeKnown,
    employed: counts.employed,
    verified: counts.verified,
    conflicts: counts.conflicts,
    followupsSent: counts.followupsSent,
    followupsResponded: counts.followupsResponded,
  };
}

/**
 * Last `days` days of snapshots including today, oldest → newest. Rows
 * outside the window (stale days) are dropped; rows for other scopes are
 * expected to be filtered by the caller's query (trainingCenterId match).
 */
export function snapshotHistoryWindow(
  rows: SnapshotRow[],
  today: Date = utcDay(),
  days: number = HISTORY_DAYS,
): SnapshotRow[] {
  const todayKey = utcDay(today);
  const cutoff = utcDay(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  return rows
    .filter((row) => {
      const day = utcDay(row.snapshotDate);
      return day >= cutoff && day <= todayKey;
    })
    .sort((a, b) => utcDay(a.snapshotDate).getTime() - utcDay(b.snapshotDate).getTime());
}

/** Snapshot row → API history entry (snapshotDate as `YYYY-MM-DD`). */
export function toHistoryEntry(row: SnapshotRow): {
  snapshotDate: string;
  totalTrainees: number;
  certified: number;
  outcomeKnown: number;
  employed: number;
  verified: number;
  conflicts: number;
  followupsSent: number;
  followupsResponded: number;
} {
  return {
    snapshotDate: row.snapshotDate.toISOString().slice(0, 10),
    totalTrainees: row.totalTrainees,
    certified: row.certified,
    outcomeKnown: row.outcomeKnown,
    employed: row.employed,
    verified: row.verified,
    conflicts: row.conflicts,
    followupsSent: row.followupsSent,
    followupsResponded: row.followupsResponded,
  };
}

/**
 * Idempotent persistence keyed on (snapshotDate, trainingCenterId): a second
 * rollup for the same day/scope updates the existing row, never duplicates.
 * Implemented as find-then-write (Prisma's compound-unique upsert input does
 * not accept the null trainingCenterId of the org-wide admin scope), which
 * gives the same sequential idempotency for both scopes. Scoped with
 * `trainingCenterId: null` matching the org-wide admin row.
 */
export async function upsertSnapshot(row: SnapshotRow) {
  const { snapshotDate, trainingCenterId, ...counts } = row;
  const existing = await db.kpiDailySnapshot.findFirst({
    where: { snapshotDate, trainingCenterId: trainingCenterId ?? null },
    select: { id: true },
  });
  if (existing) {
    await db.kpiDailySnapshot.update({ where: { id: existing.id }, data: counts });
  } else {
    await db.kpiDailySnapshot.create({ data: { snapshotDate, trainingCenterId, ...counts } });
  }
}
