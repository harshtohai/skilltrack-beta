import { describe, expect, it } from "vitest";
import { kpiDelta, kpiSeries, type KpiSnapshotRow } from "./kpi-deltas";

const row = (over: Partial<KpiSnapshotRow>): KpiSnapshotRow => ({
  snapshotDate: "2026-10-08",
  totalTrainees: 100,
  certified: 40,
  outcomeKnown: 50,
  employed: 25,
  verified: 20,
  conflicts: 3,
  followupsSent: 10,
  followupsResponded: 6,
  ...over,
});

// Midday UTC — same calendar day as the "2026-10-09" date-only snapshot strings
const NOW = new Date("2026-10-09T12:00:00.000Z");

describe("kpiDelta — rates (percent-POINT)", () => {
  const history = [
    row({ snapshotDate: "2026-10-08", outcomeKnown: 40, totalTrainees: 100, verified: 20 }),
    row({ snapshotDate: "2026-10-09", outcomeKnown: 45, totalTrainees: 100, verified: 27 }),
  ];

  it("returns today − yesterday in points for outcome coverage", () => {
    // 45/100 → 45% yesterday 40/100 → 40%
    expect(kpiDelta(history, NOW, "outcomeCoverage")).toEqual({
      delta: 5,
      label: "vs yesterday",
    });
  });

  it("returns points for verified employment (verified / outcomeKnown)", () => {
    // 27/45 → 60% today vs 20/40 → 50% yesterday
    expect(kpiDelta(history, NOW, "verifiedEmployment")).toEqual({
      delta: 10,
      label: "vs yesterday",
    });
  });

  it("returns points for placement rate (employed / outcomeKnown)", () => {
    const h = [
      row({ snapshotDate: "2026-10-08", employed: 25, outcomeKnown: 50 }),
      row({ snapshotDate: "2026-10-09", employed: 30, outcomeKnown: 50 }),
    ];
    expect(kpiDelta(h, NOW, "placementRate")).toEqual({ delta: 10, label: "vs yesterday" });
  });
});

describe("kpiDelta — counts (percent CHANGE)", () => {
  const history = [
    row({ snapshotDate: "2026-10-08", totalTrainees: 100, conflicts: 4 }),
    row({ snapshotDate: "2026-10-09", totalTrainees: 125, conflicts: 3 }),
  ];

  it("returns percent change for total trainees", () => {
    expect(kpiDelta(history, NOW, "totalTrainees")).toEqual({
      delta: 25,
      label: "vs yesterday",
    });
  });

  it("returns negative percent change for falling counts", () => {
    expect(kpiDelta(history, NOW, "conflicts")).toEqual({
      delta: -25,
      label: "vs yesterday",
    });
  });

  it("returns 0 (not null) for an unchanged count", () => {
    const same = [row({ snapshotDate: "2026-10-08" }), row({ snapshotDate: "2026-10-09" })];
    expect(kpiDelta(same, NOW, "totalTrainees")).toEqual({ delta: 0, label: "vs yesterday" });
  });

  it("omits the delta from a zero baseline (0 → n has no honest percentage)", () => {
    const fromZero = [
      row({ snapshotDate: "2026-10-08", conflicts: 0 }),
      row({ snapshotDate: "2026-10-09", conflicts: 4 }),
    ];
    expect(kpiDelta(fromZero, NOW, "conflicts")).toBeNull();
  });
});

describe("kpiDelta — omission guards", () => {
  it("omits with no history", () => {
    expect(kpiDelta([], NOW, "totalTrainees")).toBeNull();
  });

  it("omits with a single row (no fabricated day-one deltas)", () => {
    expect(kpiDelta([row({ snapshotDate: "2026-10-09" })], NOW, "totalTrainees")).toBeNull();
  });

  it("omits when the last row is not today", () => {
    const stale = [row({ snapshotDate: "2026-10-07" }), row({ snapshotDate: "2026-10-08" })];
    expect(kpiDelta(stale, NOW, "totalTrainees")).toBeNull();
  });
});

describe("kpiDelta — labels", () => {
  it("says 'vs yesterday' when the previous row is exactly 1 day before", () => {
    const h = [row({ snapshotDate: "2026-10-08" }), row({ snapshotDate: "2026-10-09" })];
    expect(kpiDelta(h, NOW, "totalTrainees")?.label).toBe("vs yesterday");
  });

  it("says 'vs yesterday' for daily timestamp snapshots (calendar-day gap)", () => {
    const h = [
      row({ snapshotDate: "2026-10-08T00:00:00.000Z" }),
      row({ snapshotDate: "2026-10-09T00:00:00.000Z" }),
    ];
    expect(kpiDelta(h, NOW, "totalTrainees")?.label).toBe("vs yesterday");
  });

  it("says 'vs previous' when the gap is more than one day (weekend gap)", () => {
    const h = [row({ snapshotDate: "2026-10-06" }), row({ snapshotDate: "2026-10-09" })];
    expect(kpiDelta(h, NOW, "totalTrainees")?.label).toBe("vs previous");
  });
});

describe("kpiSeries", () => {
  it("is empty with fewer than 2 rows", () => {
    expect(kpiSeries([], "totalTrainees")).toEqual([]);
    expect(kpiSeries([row({ snapshotDate: "2026-10-09" })], "totalTrainees")).toEqual([]);
  });

  it("maps counts oldest → newest from the same history array", () => {
    const h = [
      row({ snapshotDate: "2026-10-08", totalTrainees: 100 }),
      row({ snapshotDate: "2026-10-09", totalTrainees: 125 }),
    ];
    expect(kpiSeries(h, "totalTrainees")).toEqual([100, 125]);
  });

  it("rounds rates exactly like the KPI API (integer percents)", () => {
    const h = [
      row({ snapshotDate: "2026-10-08", outcomeKnown: 31, totalTrainees: 50 }),
      row({ snapshotDate: "2026-10-09", outcomeKnown: 1, totalTrainees: 3 }),
    ];
    // 31/50 → 62; 1/3 → round(33.33) → 33
    expect(kpiSeries(h, "outcomeCoverage")).toEqual([62, 33]);
  });

  it("returns 0 for rate rows with a zero denominator", () => {
    const h = [
      row({ snapshotDate: "2026-10-08", totalTrainees: 0, outcomeKnown: 0 }),
      row({ snapshotDate: "2026-10-09", totalTrainees: 10, outcomeKnown: 2 }),
    ];
    expect(kpiSeries(h, "outcomeCoverage")).toEqual([0, 20]);
  });

  it("caps the window at the last 7 rows", () => {
    const h = Array.from({ length: 9 }, (_, i) =>
      row({ snapshotDate: `2026-10-0${i + 1}`, totalTrainees: i + 1 }),
    );
    expect(kpiSeries(h, "totalTrainees")).toEqual([3, 4, 5, 6, 7, 8, 9]);
  });
});
