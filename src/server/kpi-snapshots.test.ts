import { describe, expect, it } from "vitest";
import {
  buildSnapshotRow,
  snapshotHistoryWindow,
  toHistoryEntry,
  utcDay,
  type KpiCounts,
  type SnapshotRow,
} from "./kpi-snapshots";

const counts: KpiCounts = {
  totalTrainees: 120,
  certified: 120,
  outcomeKnown: 96,
  employed: 60,
  verified: 48,
  conflicts: 7,
  followupsSent: 85,
  followupsResponded: 72,
};

const day = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

describe("utcDay", () => {
  it("buckets any time of day to UTC midnight", () => {
    expect(utcDay(new Date("2026-10-09T18:26:44.000Z"))).toEqual(day("2026-10-09"));
    expect(utcDay(new Date("2026-10-09T00:00:01.000Z"))).toEqual(day("2026-10-09"));
  });

  it("is idempotent", () => {
    expect(utcDay(utcDay(new Date("2026-10-09T18:26:44.000Z")))).toEqual(day("2026-10-09"));
  });
});

describe("buildSnapshotRow", () => {
  it("builds a row from known counts with today's date and org-wide scope", () => {
    const row = buildSnapshotRow(counts);
    expect(row).toEqual({ ...counts, snapshotDate: utcDay(), trainingCenterId: null });
  });

  it("keeps every count exactly as measured (no derived math)", () => {
    const row = buildSnapshotRow(counts, "tc-1");
    expect(row.totalTrainees).toBe(120);
    expect(row.certified).toBe(120);
    expect(row.outcomeKnown).toBe(96);
    expect(row.employed).toBe(60);
    expect(row.verified).toBe(48);
    expect(row.conflicts).toBe(7);
    expect(row.followupsSent).toBe(85);
    expect(row.followupsResponded).toBe(72);
  });

  it("scopes per-center rows for institute sessions", () => {
    const row = buildSnapshotRow(counts, "tc-pun-01");
    expect(row.trainingCenterId).toBe("tc-pun-01");
  });

  it("accepts an explicit snapshot date (backfills, tests)", () => {
    const row = buildSnapshotRow(counts, null, day("2026-10-01"));
    expect(row.snapshotDate).toEqual(day("2026-10-01"));
  });

  it("returns zeroed counts as zeros (never NaN)", () => {
    const zeros: KpiCounts = {
      totalTrainees: 0,
      certified: 0,
      outcomeKnown: 0,
      employed: 0,
      verified: 0,
      conflicts: 0,
      followupsSent: 0,
      followupsResponded: 0,
    };
    const row = buildSnapshotRow(zeros);
    expect(row.totalTrainees).toBe(0);
    expect(row.followupsResponded).toBe(0);
    expect(Number.isNaN(row.totalTrainees)).toBe(false);
  });
});

describe("snapshotHistoryWindow", () => {
  const row = (iso: string, over: Partial<SnapshotRow> = {}): SnapshotRow => ({
    ...counts,
    snapshotDate: day(iso),
    trainingCenterId: null,
    ...over,
  });

  it("slices to the last 7 days including today, oldest → newest", () => {
    const rows = [
      row("2026-10-02"),
      row("2026-10-03"),
      row("2026-10-04"),
      row("2026-10-05"),
      row("2026-10-06"),
      row("2026-10-07"),
      row("2026-10-08"),
      row("2026-10-09"), // today
    ];
    const window = snapshotHistoryWindow(rows, day("2026-10-09"));
    expect(window.map((r) => r.snapshotDate.toISOString().slice(0, 10))).toEqual([
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
    ]);
    expect(window).toHaveLength(7);
    expect(window[window.length - 1]?.snapshotDate).toEqual(day("2026-10-09"));
  });

  it("drops days older than the window", () => {
    const rows = [row("2026-09-01"), row("2026-09-15"), row("2026-10-09")];
    const window = snapshotHistoryWindow(rows, day("2026-10-09"));
    expect(window).toHaveLength(1);
    expect(window[0]?.snapshotDate).toEqual(day("2026-10-09"));
  });

  it("sorts out-of-order rows oldest → newest", () => {
    const rows = [row("2026-10-07"), row("2026-10-04"), row("2026-10-09"), row("2026-10-05")];
    const window = snapshotHistoryWindow(rows, day("2026-10-09"));
    expect(window.map((r) => r.snapshotDate.getUTCDate())).toEqual([4, 5, 7, 9]);
  });

  it("returns just today on day one (no history yet)", () => {
    const window = snapshotHistoryWindow([row("2026-10-09")], day("2026-10-09"));
    expect(window).toHaveLength(1);
    expect(window[0]).toEqual(row("2026-10-09"));
  });

  it("returns empty when no snapshots exist (dashboard never breaks)", () => {
    expect(snapshotHistoryWindow([], day("2026-10-09"))).toEqual([]);
  });

  it("uses a 7-day window by default without an explicit cutoff", () => {
    const rows = [row("2026-10-01"), row("2026-10-09")];
    const window = snapshotHistoryWindow(rows);
    expect(window).toHaveLength(1);
    expect(window[0]?.snapshotDate).toEqual(day("2026-10-09"));
  });
});

describe("toHistoryEntry", () => {
  it("serializes snapshotDate as YYYY-MM-DD and keeps counts flat", () => {
    const entry = toHistoryEntry(buildSnapshotRow(counts, null, day("2026-10-09")));
    expect(entry.snapshotDate).toBe("2026-10-09");
    expect(entry).toMatchObject(counts);
  });
});
