/**
 * Delta + sparkline series derivation for the dashboard KPI cards (spec #80,
 * design §9.1/§4.14). Pure functions — no DB, no clock: `now` is injected by
 * the caller so tests stay deterministic.
 *
 * Contract (spec #80):
 * - Rates (outcomeCoverage, verifiedEmployment, placementRate) are
 *   percent-POINT deltas (today − yesterday); counts are percent CHANGE
 *   ((today−yesterday)/yesterday×100) — StatCard renders the delta via
 *   percent(), so counts must be relative, never absolute.
 * - Deltas render only when the history has ≥2 rows AND the last row is today
 *   (no fabricated day-one deltas). "vs yesterday" when the previous row is
 *   exactly one calendar day before, else "vs previous".
 * - A count delta from a zero baseline is omitted: 0 → n has no honest
 *   percentage.
 * - Rate values are rounded to integer percents exactly like the KPI API does
 *   (0 with no denominator), so the sparkline's last point matches the card's
 *   displayed rate.
 */

export interface KpiSnapshotRow {
  snapshotDate: string;
  totalTrainees: number;
  certified: number;
  outcomeKnown: number;
  employed: number;
  verified: number;
  conflicts: number;
  followupsSent: number;
  followupsResponded: number;
}

/** The KPI cards wired to deltas/sparklines, keyed by metric. */
export type KpiMetric =
  | "totalTrainees" // count — "Total trainees" / institute "Trainees produced"
  | "outcomeCoverage" // rate — "Outcome coverage"
  | "verifiedEmployment" // rate — "Verified employment"
  | "conflicts" // count — "Conflicts"
  | "certified" // count — institute "Certified"
  | "placed" // count — institute "Placed" (snapshot `employed`)
  | "placementRate"; // rate — institute "Placement rate"

export interface KpiDelta {
  /** Percent points for rates, percent change for counts. */
  delta: number;
  /** "vs yesterday" or "vs previous". */
  label: string;
}

const MS_PER_DAY = 86_400_000;
/** The sparkline window: the last 7 daily snapshots. */
const SERIES_DAYS = 7;

const RATE_METRICS: ReadonlySet<KpiMetric> = new Set([
  "outcomeCoverage",
  "verifiedEmployment",
  "placementRate",
]);

/** Calendar-day number (UTC) of a Date — immune to time-of-day and DST. */
function dayNumber(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / MS_PER_DAY;
}

/** Invalid ISO strings yield NaN (not a throw) — callers treat NaN as "no match". */
function dayNumberFromIso(iso: string): number {
  return dayNumber(new Date(iso));
}

function readMetric(row: KpiSnapshotRow, metric: KpiMetric): number {
  switch (metric) {
    case "totalTrainees":
      return row.totalTrainees;
    case "certified":
      return row.certified;
    case "placed":
      return row.employed;
    case "conflicts":
      return row.conflicts;
    case "outcomeCoverage":
      return row.totalTrainees > 0
        ? Math.round((row.outcomeKnown / row.totalTrainees) * 100)
        : 0;
    case "verifiedEmployment":
      return row.outcomeKnown > 0 ? Math.round((row.verified / row.outcomeKnown) * 100) : 0;
    case "placementRate":
      return row.outcomeKnown > 0 ? Math.round((row.employed / row.outcomeKnown) * 100) : 0;
  }
}

/**
 * Delta vs the previous snapshot row, or null when it must not render
 * (history <2 rows, last row isn't today, or a zero count baseline).
 */
export function kpiDelta(
  history: readonly KpiSnapshotRow[],
  now: Date,
  metric: KpiMetric,
): KpiDelta | null {
  if (history.length < 2) return null;
  const todayRow = history[history.length - 1]!;
  const prevRow = history[history.length - 2]!;
  // Only real history: the last row must be today (no fabricated day-one deltas)
  if (dayNumberFromIso(todayRow.snapshotDate) !== dayNumber(now)) return null;
  const todayValue = readMetric(todayRow, metric);
  const prevValue = readMetric(prevRow, metric);
  const delta = RATE_METRICS.has(metric)
    ? todayValue - prevValue
    : prevValue === 0
      ? null
      : ((todayValue - prevValue) / prevValue) * 100;
  if (delta === null) return null;
  const dayGap = dayNumberFromIso(todayRow.snapshotDate) - dayNumberFromIso(prevRow.snapshotDate);
  return { delta, label: dayGap === 1 ? "vs yesterday" : "vs previous" };
}

/**
 * Daily series for the card's DotSparkline (oldest → newest, last 7 rows).
 * Empty unless the history has ≥2 rows — one snapshot alone shows no trend.
 */
export function kpiSeries(
  history: readonly KpiSnapshotRow[],
  metric: KpiMetric,
): number[] {
  if (history.length < 2) return [];
  return history.slice(-SERIES_DAYS).map((row) => readMetric(row, metric));
}
