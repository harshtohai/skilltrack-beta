import { describe, expect, it } from "vitest";
import { canApplyAction } from "./job-application-state";

describe("canApplyAction", () => {
  it("allows shortlist only from APPLIED", () => {
    expect(canApplyAction("APPLIED", "shortlist")).toBe(true);
    expect(canApplyAction("SHORTLISTED", "shortlist")).toBe(false);
    expect(canApplyAction("HIRED", "shortlist")).toBe(false);
    expect(canApplyAction("REJECTED", "shortlist")).toBe(false);
    expect(canApplyAction("WITHDRAWN", "shortlist")).toBe(false);
  });

  it("allows hire only from SHORTLISTED", () => {
    expect(canApplyAction("SHORTLISTED", "hire")).toBe(true);
    expect(canApplyAction("APPLIED", "hire")).toBe(false);
    expect(canApplyAction("HIRED", "hire")).toBe(false);
    expect(canApplyAction("REJECTED", "hire")).toBe(false);
    expect(canApplyAction("WITHDRAWN", "hire")).toBe(false);
  });

  it("allows reject from APPLIED or SHORTLISTED", () => {
    expect(canApplyAction("APPLIED", "reject")).toBe(true);
    expect(canApplyAction("SHORTLISTED", "reject")).toBe(true);
    expect(canApplyAction("HIRED", "reject")).toBe(false);
    expect(canApplyAction("REJECTED", "reject")).toBe(false);
    expect(canApplyAction("WITHDRAWN", "reject")).toBe(false);
  });
});
