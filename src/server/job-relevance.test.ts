import { describe, expect, it } from "vitest";
import { matchesFilters, sortJobsForTrainee, type SortableJob } from "./job-relevance";

describe("sortJobsForTrainee", () => {
  const job = (over: Partial<SortableJob> & { id?: string }): SortableJob & { id: string } => ({
    id: "job-1",
    district: "Pune",
    employerVerified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...over,
  });

  it("puts same-district jobs first regardless of case/whitespace", () => {
    const sorted = sortJobsForTrainee(
      [
        job({ id: "nagpur", district: "Nagpur" }),
        job({ id: "pune" }),
        job({ id: "mumbai", district: "Mumbai" }),
      ],
      "pune"
    );
    expect(sorted.map((j) => j.id)).toEqual(["pune", "nagpur", "mumbai"]);
    // Case-insensitive + trimmed compare
    const sorted2 = sortJobsForTrainee(
      [
        job({ id: "mumbai", district: "Mumbai" }),
        job({ id: "pune", district: "  PUNE " }),
      ],
      "Pune"
    );
    expect(sorted2.map((j) => j.id)).toEqual(["pune", "mumbai"]);
  });

  it("ranks verified before non-verified within the same district", () => {
    const sorted = sortJobsForTrainee(
      [
        job({ id: "unverified", employerVerified: false }),
        job({ id: "verified", employerVerified: true }),
      ],
      "Pune"
    );
    expect(sorted.map((j) => j.id)).toEqual(["verified", "unverified"]);
  });

  it("ranks out-of-district verified after in-district unverified", () => {
    const sorted = sortJobsForTrainee(
      [
        job({ id: "other-verified", district: "Nagpur", employerVerified: true }),
        job({ id: "home-unverified", district: "Pune", employerVerified: false }),
      ],
      "Pune"
    );
    expect(sorted.map((j) => j.id)).toEqual(["home-unverified", "other-verified"]);
  });

  it("breaks recency ties newest first within the same district and verification", () => {
    const sorted = sortJobsForTrainee(
      [
        job({ id: "older", createdAt: "2026-01-01T00:00:00.000Z" }),
        job({ id: "newer", createdAt: "2026-06-01T00:00:00.000Z" }),
      ],
      "Pune"
    );
    expect(sorted.map((j) => j.id)).toEqual(["newer", "older"]);
  });

  it("applies the full order: district, then verified, then recency", () => {
    const sorted = sortJobsForTrainee(
      [
        job({ id: "other-verified-old", district: "Nagpur", employerVerified: true, createdAt: "2025-01-01T00:00:00.000Z" }),
        job({ id: "home-unverified-new", district: "Pune", employerVerified: false, createdAt: "2026-09-01T00:00:00.000Z" }),
        job({ id: "home-verified-old", district: "Pune", employerVerified: true, createdAt: "2025-01-01T00:00:00.000Z" }),
        job({ id: "other-unverified-new", district: "Nashik", employerVerified: false, createdAt: "2026-09-01T00:00:00.000Z" }),
      ],
      "Pune"
    );
    expect(sorted.map((j) => j.id)).toEqual([
      "home-verified-old",
      "home-unverified-new",
      "other-verified-old",
      "other-unverified-new",
    ]);
  });

  it("keeps original order for fully equal ranks (stable)", () => {
    const input = [
      job({ id: "a" }),
      job({ id: "b" }),
      job({ id: "c" }),
    ];
    const sorted = sortJobsForTrainee(input, "Pune");
    expect(sorted.map((j) => j.id)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      job({ id: "newer", createdAt: "2026-06-01T00:00:00.000Z" }),
      job({ id: "older", createdAt: "2026-01-01T00:00:00.000Z" }),
    ];
    const copy = [...input];
    sortJobsForTrainee(input, "Pune");
    expect(input.map((j) => j.id)).toEqual(copy.map((j) => j.id));
  });

  it("returns an empty array unchanged", () => {
    expect(sortJobsForTrainee([], "Pune")).toEqual([]);
  });
});

describe("matchesFilters", () => {
  const job = {
    district: "Pune",
    workMode: "REMOTE",
    employmentType: "FULL_TIME",
  };

  it("matches when no filters are set", () => {
    expect(matchesFilters(job, {})).toBe(true);
    expect(matchesFilters(job, { district: "", workMode: "", employmentType: "" })).toBe(true);
  });

  it("matches district case-insensitively (trimmed)", () => {
    expect(matchesFilters(job, { district: "pune" })).toBe(true);
    expect(matchesFilters(job, { district: " PUNE " })).toBe(true);
    expect(matchesFilters(job, { district: "Nagpur" })).toBe(false);
  });

  it("matches workMode exactly", () => {
    expect(matchesFilters(job, { workMode: "REMOTE" })).toBe(true);
    expect(matchesFilters(job, { workMode: "ONSITE" })).toBe(false);
    expect(matchesFilters(job, { workMode: "remote" })).toBe(false);
  });

  it("matches employmentType exactly", () => {
    expect(matchesFilters(job, { employmentType: "FULL_TIME" })).toBe(true);
    expect(matchesFilters(job, { employmentType: "INTERNSHIP" })).toBe(false);
  });

  it("ANDs all provided filters together", () => {
    expect(
      matchesFilters(job, { district: "pune", workMode: "REMOTE", employmentType: "FULL_TIME" })
    ).toBe(true);
    expect(
      matchesFilters(job, { district: "pune", workMode: "ONSITE", employmentType: "FULL_TIME" })
    ).toBe(false);
  });
});
