import { format as fnsFormat } from "date-fns";

/**
 * Formatting helpers implementing the design consistency law CL-13/CL-14:
 * - currency symbol prefix with no space (₹9,102 — en-IN separators)
 * - compact 12.4k / 1.2M only in charts and stat sublines
 * - deltas with sign and 2 decimals (+4.02% / -7.06%)
 * - dates MMM d, yyyy (Jul 16, 2026); times 12h with AM/PM
 * - every number consumer pairs these with `tabular-nums`
 */

export function currency(n: number, symbol = "₹"): string {
  return `${symbol}${n.toLocaleString("en-IN")}`;
}

export function number(n: number): string {
  return n.toLocaleString("en-IN");
}

export function compact(n: number): string {
  if (Math.abs(n) < 1000) return String(n);
  if (Math.abs(n) < 1_000_000) {
    const v = (n / 1000).toFixed(1);
    return `${v.endsWith(".0") ? v.slice(0, -2) : v}k`;
  }
  const v = (n / 1_000_000).toFixed(1);
  return `${v.endsWith(".0") ? v.slice(0, -2) : v}M`;
}

/** Delta format per CL-13: sign + 2 decimals. `sign: false` drops the leading +. */
export function percent(n: number, opts?: { sign?: boolean; digits?: number }): string {
  const digits = opts?.digits ?? 2;
  const v = n.toFixed(digits);
  if (opts?.sign === false) return `${v}%`;
  return n > 0 ? `+${v}%` : `${v}%`;
}

/** Dates as MMM d, yyyy — "Jul 16, 2026" (CL-14). */
export function date(d: Date | string): string {
  return fnsFormat(new Date(d), "MMM d, yyyy");
}

/** 12h time with AM/PM — "Jul 16, 2026, 4:05 PM" (CL-14). */
export function datetime(d: Date | string): string {
  return fnsFormat(new Date(d), "MMM d, yyyy, h:mm a");
}

/** Time-only 12h — "4:05 PM" (CL-14), for chat bubbles and compact rows. */
export function time(d: Date | string): string {
  return fnsFormat(new Date(d), "h:mm a");
}

export const format = { currency, number, compact, percent, date, datetime, time };
