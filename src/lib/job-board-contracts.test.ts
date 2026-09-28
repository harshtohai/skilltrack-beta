import { describe, expect, it } from "vitest";
import {
  EmploymentType as PrismaEmploymentType,
  EmployerVerificationStatus as PrismaEmployerVerificationStatus,
  JobPostingStatus as PrismaJobPostingStatus,
  JobApplicationStatus as PrismaJobApplicationStatus,
  NonPlacementReason as PrismaNonPlacementReason,
  SalaryBand as PrismaSalaryBand,
} from "@prisma/client";
import {
  applicationActionResponseSchema,
  createJobSchema,
  employmentTypeSchema,
  employerRegisterSchema,
  employerVerificationStatusSchema,
  jobApplicationStatusSchema,
  jobMarketplaceSchema,
  jobPostingStatusSchema,
  jobSeekSignalSchema,
  myApplicationSchema,
  nonPlacementReasonSchema,
  publicJobSchema,
  salaryBandSchema,
  verifyEmployerSchema,
  workModeSchema,
} from "./job-board-contracts";

// CONTEXT.md enum table parity — hard-coded literals from the domain doc so
// any drift between doc, schema and contracts fails loudly.
describe("enum parity with CONTEXT.md", () => {
  it("employer_verification_status values match", () => {
    expect(employerVerificationStatusSchema.options).toEqual([
      "PENDING",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED",
    ]);
  });

  it("job_posting_status values match", () => {
    expect(jobPostingStatusSchema.options).toEqual(["OPEN", "CLOSED"]);
  });

  it("job_application_status values match", () => {
    expect(jobApplicationStatusSchema.options).toEqual([
      "APPLIED",
      "SHORTLISTED",
      "HIRED",
      "REJECTED",
      "WITHDRAWN",
    ]);
  });

  it("employment_type values match", () => {
    expect(employmentTypeSchema.options).toEqual([
      "FULL_TIME",
      "PART_TIME",
      "INTERNSHIP",
      "CONTRACT",
      "FREELANCE",
    ]);
  });

  it("work_mode values match", () => {
    expect(workModeSchema.options).toEqual(["ONSITE", "REMOTE", "HYBRID"]);
  });

  it("salary_band values match the reused existing enum", () => {
    expect(salaryBandSchema.options).toEqual([
      "LT_10K",
      "B_10_20K",
      "B_20_35K",
      "B_35_50K",
      "GT_50K",
    ]);
  });

  it("non_placement_reason values match the reused existing enum", () => {
    expect(nonPlacementReasonSchema.options).toEqual([
      "NO_JOBS",
      "SKILLS_MISMATCH",
      "FAMILY",
      "HEALTH",
      "OTHER",
    ]);
  });
});

// Drift guard between prisma/schema.prisma and these contracts.
describe("enum parity with prisma client", () => {
  it("contract enums equal prisma-generated enums", () => {
    expect(employerVerificationStatusSchema.options).toEqual(
      Object.values(PrismaEmployerVerificationStatus),
    );
    expect(jobPostingStatusSchema.options).toEqual(Object.values(PrismaJobPostingStatus));
    expect(jobApplicationStatusSchema.options).toEqual(
      Object.values(PrismaJobApplicationStatus),
    );
    expect(employmentTypeSchema.options).toEqual(Object.values(PrismaEmploymentType));
    expect(salaryBandSchema.options).toEqual(Object.values(PrismaSalaryBand));
    expect(nonPlacementReasonSchema.options).toEqual(Object.values(PrismaNonPlacementReason));
  });
});

describe("employerRegisterSchema", () => {
  const valid = {
    companyName: "TechCorp",
    contactEmail: "hr@company.com",
    password: "employer123",
    sector: "IT",
    district: "Chandrapur",
  };

  it("parses a minimal valid signup", () => {
    const parsed = employerRegisterSchema.parse(valid);
    expect(parsed.companyName).toBe("TechCorp");
    expect(parsed.registrationNo).toBeUndefined();
  });

  it("coerces employeeCount from string form fields", () => {
    const parsed = employerRegisterSchema.parse({ ...valid, employeeCount: "50" });
    expect(parsed.employeeCount).toBe(50);
  });

  it("rejects passwords under 8 chars", () => {
    expect(() => employerRegisterSchema.parse({ ...valid, password: "short" })).toThrow();
  });

  it("rejects invalid emails", () => {
    expect(() => employerRegisterSchema.parse({ ...valid, contactEmail: "not-an-email" })).toThrow();
  });
});

describe("createJobSchema", () => {
  const valid = {
    title: "Full-stack Developer",
    description: "Build web dashboards for skilling analytics.",
    employmentType: "FULL_TIME",
    workMode: "ONSITE",
    district: "Chandrapur",
    skillsRequired: ["React", "SQL"],
  };

  it("defaults openings to 1", () => {
    const parsed = createJobSchema.parse(valid);
    expect(parsed.openings).toBe(1);
  });

  it("coerces openings from string form fields", () => {
    const parsed = createJobSchema.parse({ ...valid, openings: "3" });
    expect(parsed.openings).toBe(3);
  });

  it("rejects jobs without skills", () => {
    expect(() => createJobSchema.parse({ ...valid, skillsRequired: [] })).toThrow();
  });

  it("rejects invalid employment types", () => {
    expect(() => createJobSchema.parse({ ...valid, employmentType: "TEMP" })).toThrow();
  });

  it("rejects openings over the 100 cap", () => {
    expect(() => createJobSchema.parse({ ...valid, openings: "101" })).toThrow();
  });
});

describe("verifyEmployerSchema", () => {
  it("accepts only VERIFIED and REJECTED as queue decisions", () => {
    expect(verifyEmployerSchema.parse({ decision: "VERIFIED" }).decision).toBe("VERIFIED");
    expect(verifyEmployerSchema.parse({ decision: "REJECTED" }).decision).toBe("REJECTED");
    // SUSPENDED comes from the suspend lever, not the verification queue.
    expect(() => verifyEmployerSchema.parse({ decision: "SUSPENDED" })).toThrow();
    expect(() => verifyEmployerSchema.parse({ decision: "PENDING" })).toThrow();
  });
});

describe("jobSeekSignalSchema", () => {
  it("accepts a valid reason", () => {
    expect(jobSeekSignalSchema.parse({ reason: "NO_JOBS" }).reason).toBe("NO_JOBS");
  });

  it("rejects invalid reasons", () => {
    expect(() => jobSeekSignalSchema.parse({ reason: "LAZY" })).toThrow();
  });
});

describe("contact reveal contracts", () => {
  it("publicJob retention is nullable and applied defaults false", () => {
    const job = {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Full-stack Developer",
      description: "Build web dashboards.",
      companyName: "TechCorp",
      employerVerified: true,
      salaryBand: null,
      workMode: "ONSITE",
      employmentType: "FULL_TIME",
      district: "Chandrapur",
      skillsRequired: ["React"],
      openings: 2,
      applicationDeadline: null,
      retention: { hires: 0, retainedPct: null },
      applied: false,
      appliedAt: null,
    };
    const parsed = publicJobSchema.parse(job);
    expect(parsed.retention.retainedPct).toBeNull();
    expect(parsed.applied).toBe(false);
  });

  it("myApplication employerContactEmail is nullable until shortlisted", () => {
    const app = {
      id: "00000000-0000-4000-8000-000000000002",
      jobPostingId: "00000000-0000-4000-8000-000000000001",
      jobTitle: "Full-stack Developer",
      companyName: "TechCorp",
      district: "Chandrapur",
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
      employerContactEmail: null,
    };
    expect(myApplicationSchema.parse(app).employerContactEmail).toBeNull();
  });

  it("applicationActionResponse carries optional jobClosed (hire auto-close)", () => {
    const result = applicationActionResponseSchema.parse({
      application: { id: "00000000-0000-4000-8000-000000000002", status: "HIRED" },
    });
    expect(result.jobClosed).toBeUndefined();
  });
});

describe("jobMarketplaceSchema", () => {
  it("parses an empty marketplace (all zeroed, null rates)", () => {
    const parsed = jobMarketplaceSchema.parse({
      jobsPosted: 0,
      openJobs: 0,
      applications: 0,
      hires: 0,
      hireRate: null,
      demandGaps: [],
      employerReliability: [],
    });
    expect(parsed.hireRate).toBeNull();
    expect(parsed.demandGaps).toEqual([]);
  });

  it("rejects negative counts", () => {
    expect(
      () => jobMarketplaceSchema.parse({
        jobsPosted: -1,
        openJobs: 0,
        applications: 0,
        hires: 0,
        hireRate: null,
        demandGaps: [],
        employerReliability: [],
      }),
    ).toThrow();
  });
});
