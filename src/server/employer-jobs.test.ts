import { describe, expect, it } from "vitest";
import { toEmployerJob, type JobWithApplications } from "./employer-jobs";

function makeJob(overrides: Partial<JobWithApplications> = {}): JobWithApplications {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    employerId: "22222222-2222-2222-2222-222222222222",
    title: "CNC Machine Operator",
    description: "Runs and maintains CNC machines on the shop floor.",
    employmentType: "FULL_TIME",
    workMode: "ONSITE",
    salaryBand: "B_10_20K",
    district: "Chandrapur",
    skillsRequired: ["CNC", "Safety"],
    openings: 2,
    applicationDeadline: null,
    status: "OPEN",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    applications: [],
    ...overrides,
  };
}

describe("toEmployerJob", () => {
  it("counts non-withdrawn applications and hires", () => {
    const job = makeJob({
      applications: [
        { status: "APPLIED" },
        { status: "SHORTLISTED" },
        { status: "WITHDRAWN" },
        { status: "HIRED" },
      ],
    });
    const mapped = toEmployerJob(job);
    expect(mapped.applicationCount).toBe(3); // withdrawn excluded
    expect(mapped.hireCount).toBe(1);
  });

  it("reports zero counts for a fresh posting", () => {
    const mapped = toEmployerJob(makeJob());
    expect(mapped.applicationCount).toBe(0);
    expect(mapped.hireCount).toBe(0);
    expect(mapped.status).toBe("OPEN");
  });

  it("converts dates to ISO and keeps a nullable deadline", () => {
    const mapped = toEmployerJob(
      makeJob({ applicationDeadline: new Date("2026-10-15T00:00:00.000Z") })
    );
    expect(mapped.applicationDeadline).toBe("2026-10-15T00:00:00.000Z");
    expect(toEmployerJob(makeJob()).applicationDeadline).toBeNull();
    expect(toEmployerJob(makeJob()).createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("keeps a nullable salary band", () => {
    expect(toEmployerJob(makeJob({ salaryBand: null })).salaryBand).toBeNull();
    expect(toEmployerJob(makeJob()).salaryBand).toBe("B_10_20K");
  });
});
