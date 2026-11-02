import { describe, expect, it } from "vitest";
import { canAccessCohort } from "~/lib/cohort-scope";

const cohort = { trainingCenterId: "center-a" };

describe("canAccessCohort (INST-01)", () => {
  it("lets admin read any cohort", () => {
    expect(canAccessCohort({ role: "admin", centerId: null }, cohort)).toBe(true);
  });

  it("lets an institute read its own center's cohort", () => {
    expect(canAccessCohort({ role: "institute", centerId: "center-a" }, cohort)).toBe(true);
  });

  it("denies another center's cohort", () => {
    expect(canAccessCohort({ role: "institute", centerId: "center-b" }, cohort)).toBe(false);
  });

  it("denies an institute with no center configured", () => {
    expect(canAccessCohort({ role: "institute", centerId: null }, cohort)).toBe(false);
  });

  it("denies non-admin, non-institute roles", () => {
    expect(canAccessCohort({ role: "employer", centerId: null }, cohort)).toBe(false);
    expect(canAccessCohort({ role: "trainee", centerId: "center-a" }, cohort)).toBe(false);
  });

  it("denies a missing cohort", () => {
    expect(canAccessCohort({ role: "admin", centerId: null }, null)).toBe(false);
  });

  it("denies a cohort with no center assigned", () => {
    expect(canAccessCohort({ role: "institute", centerId: null }, { trainingCenterId: null })).toBe(false);
  });
});
