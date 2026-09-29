import { describe, expect, it } from "vitest";
import {
  aggregateDemandGaps,
  aggregateEmployerReliability,
  type DemandGapSignalInput,
  type EmployerReliabilityInput,
} from "./job-marketplace";

describe("aggregateDemandGaps", () => {
  const signal = (district: string, reason: DemandGapSignalInput["reason"]): DemandGapSignalInput => ({
    district,
    reason,
  });

  it("returns an empty array for empty inputs", () => {
    expect(aggregateDemandGaps([], {})).toEqual([]);
    expect(aggregateDemandGaps([], new Map())).toEqual([]);
  });

  it("groups signals by district", () => {
    const gaps = aggregateDemandGaps(
      [signal("Pune", "NO_JOBS"), signal("Pune", "FAMILY"), signal("Nashik", "NO_JOBS")],
      {}
    );
    expect(gaps).toHaveLength(2);
    const pune = gaps.find((g) => g.district === "Pune");
    const nashik = gaps.find((g) => g.district === "Nashik");
    expect(pune?.signals).toBe(2);
    expect(pune?.openJobs).toBe(0);
    expect(nashik?.signals).toBe(1);
  });

  it("defaults openJobs to 0 when the district has no open jobs", () => {
    const gaps = aggregateDemandGaps([signal("Pune", "NO_JOBS")], { Nashik: 4 });
    expect(gaps[0]?.openJobs).toBe(0);
  });

  it("reads openJobs from a plain record", () => {
    const gaps = aggregateDemandGaps(
      [signal("Pune", "NO_JOBS"), signal("Nashik", "NO_JOBS")],
      { Pune: 2, Nashik: 0 }
    );
    const pune = gaps.find((g) => g.district === "Pune");
    const nashik = gaps.find((g) => g.district === "Nashik");
    expect(pune?.openJobs).toBe(2);
    expect(nashik?.openJobs).toBe(0);
  });

  it("reads openJobs from a Map", () => {
    const gaps = aggregateDemandGaps(
      [signal("Pune", "NO_JOBS")],
      new Map([["Pune", 7]])
    );
    expect(gaps[0]?.openJobs).toBe(7);
  });

  it("sorts byReason by count desc then reason alphabetically", () => {
    const gaps = aggregateDemandGaps(
      [
        signal("Pune", "FAMILY"),
        signal("Pune", "NO_JOBS"),
        signal("Pune", "NO_JOBS"),
        signal("Pune", "SKILLS_MISMATCH"),
        signal("Pune", "SKILLS_MISMATCH"),
        signal("Pune", "OTHER"),
      ],
      {}
    );
    expect(gaps[0]?.byReason).toEqual([
      { reason: "NO_JOBS", count: 2 },
      { reason: "SKILLS_MISMATCH", count: 2 },
      { reason: "FAMILY", count: 1 },
      { reason: "OTHER", count: 1 },
    ]);
  });

  it("sorts districts by signals desc then name", () => {
    const gaps = aggregateDemandGaps(
      [
        signal("Nagpur", "NO_JOBS"),
        signal("Pune", "NO_JOBS"),
        signal("Pune", "FAMILY"),
        signal("Nashik", "NO_JOBS"),
        signal("Nashik", "HEALTH"),
      ],
      {}
    );
    // Pune and Nashik tie on 2 signals; the name tie-break puts Nashik first.
    expect(gaps.map((g) => g.district)).toEqual(["Nashik", "Pune", "Nagpur"]);
  });

  it("breaks signal-count ties by district name", () => {
    const gaps = aggregateDemandGaps(
      [signal("Nashik", "NO_JOBS"), signal("Pune", "NO_JOBS"), signal("Nagpur", "NO_JOBS")],
      {}
    );
    expect(gaps.map((g) => g.district)).toEqual(["Nagpur", "Nashik", "Pune"]);
  });
});

describe("aggregateEmployerReliability", () => {
  const employer = (over: Partial<EmployerReliabilityInput>): EmployerReliabilityInput => ({
    id: "emp-1",
    companyName: "Acme Corp",
    verificationStatus: "VERIFIED",
    ...over,
  });

  it("returns an empty array for empty inputs", () => {
    expect(aggregateEmployerReliability([], {}, {})).toEqual([]);
  });

  it("defaults hires to 0 when the employer has no board hires", () => {
    const [row] = aggregateEmployerReliability([employer({})], {}, {});
    expect(row?.hires).toBe(0);
    expect(row?.retentionScore).toBeNull();
    expect(row?.flagged).toBe(false);
  });

  it("passes through the precomputed retention score and hire count", () => {
    const [row] = aggregateEmployerReliability(
      [employer({})],
      { "emp-1": 12 },
      { "emp-1": 80 }
    );
    expect(row?.hires).toBe(12);
    expect(row?.retentionScore).toBe(80);
    expect(row?.flagged).toBe(false);
  });

  it("keeps employers in input order", () => {
    const rows = aggregateEmployerReliability(
      [employer({ id: "emp-2", companyName: "Beta Ltd" }), employer({ id: "emp-1" })],
      {},
      {}
    );
    expect(rows.map((r) => r.employerId)).toEqual(["emp-2", "emp-1"]);
    expect(rows[0]?.companyName).toBe("Beta Ltd");
  });

  it("always flags SUSPENDED employers, even with a good score", () => {
    const [row] = aggregateEmployerReliability(
      [employer({ verificationStatus: "SUSPENDED" })],
      { "emp-1": 5 },
      { "emp-1": 100 }
    );
    expect(row?.flagged).toBe(true);
  });

  it("flags low retention scores (below 50)", () => {
    const [row] = aggregateEmployerReliability(
      [employer({})],
      { "emp-1": 3 },
      { "emp-1": 49 }
    );
    expect(row?.flagged).toBe(true);
  });

  it("does not flag a score of exactly 50", () => {
    const [row] = aggregateEmployerReliability(
      [employer({})],
      {},
      { "emp-1": 50 }
    );
    expect(row?.flagged).toBe(false);
  });

  it("does not flag a null retention score (insufficient evidence)", () => {
    const [row] = aggregateEmployerReliability(
      [employer({})],
      { "emp-1": 2 },
      {}
    );
    expect(row?.retentionScore).toBeNull();
    expect(row?.flagged).toBe(false);
  });

  it("does not flag PENDING/REJECTED employers without a low score", () => {
    const rows = aggregateEmployerReliability(
      [employer({ id: "emp-2", verificationStatus: "PENDING" }), employer({ id: "emp-3", verificationStatus: "REJECTED" })],
      {},
      {}
    );
    expect(rows.every((r) => !r.flagged)).toBe(true);
  });
});
