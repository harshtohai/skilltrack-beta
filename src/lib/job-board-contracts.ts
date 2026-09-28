import { z } from "zod";

// Job Board (F25) API contracts — the frozen sync point between the
// Employer / Trainee / Government vertical tracks (spec #32, tickets
// #45/#46/#47). Request + response schemas live here so client components
// can use the inferred types and server routes validate against the same
// definitions. Enum values mirror prisma/schema.prisma and the CONTEXT.md
// enum table; parity is pinned by job-board-contracts.test.ts.
//
// Route wiring (added by the verticals, not here):
// - `/api/v1/employer/register` must be added to publicRoutes (unlisted ≠
//   blocked by middleware — reachable by direct URL only).
// - New protected paths land in protectedRoutes (~/lib/protected-routes.ts):
//   /api/v1/employer/jobs* (employer, admin), /api/v1/trainee/jobs,
//   /api/v1/trainee/applications, /api/v1/trainee/job-seek-signal (trainee),
//   /api/v1/admin/* (admin).

// ── Enums ──────────────────────────────────────────────────────────────────

export const employerVerificationStatusSchema = z.enum([
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
]);
export type EmployerVerificationStatus = z.infer<typeof employerVerificationStatusSchema>;

export const jobPostingStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type JobPostingStatus = z.infer<typeof jobPostingStatusSchema>;

export const jobApplicationStatusSchema = z.enum([
  "APPLIED",
  "SHORTLISTED",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
]);
export type JobApplicationStatus = z.infer<typeof jobApplicationStatusSchema>;

export const employmentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "FREELANCE",
]);
export type EmploymentType = z.infer<typeof employmentTypeSchema>;

export const workModeSchema = z.enum(["ONSITE", "REMOTE", "HYBRID"]);
export type WorkMode = z.infer<typeof workModeSchema>;

// Existing enums reused from the trainees/outcomes pipeline.
export const salaryBandSchema = z.enum(["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"]);
export type SalaryBand = z.infer<typeof salaryBandSchema>;

export const nonPlacementReasonSchema = z.enum([
  "NO_JOBS",
  "SKILLS_MISMATCH",
  "FAMILY",
  "HEALTH",
  "OTHER",
]);
export type NonPlacementReason = z.infer<typeof nonPlacementReasonSchema>;

// ── Shared primitives ──────────────────────────────────────────────────────

const uuidSchema = z.string().uuid();
const isoDatetimeSchema = z.string().datetime();

// ── Employer signup: POST /api/v1/employer/register ────────────────────────
// Unlisted page; creates the Employers row with verification_status PENDING.

export const employerRegisterSchema = z.object({
  companyName: z.string().min(2).max(120),
  contactEmail: z.string().email().max(254),
  password: z.string().min(8).max(72),
  sector: z.string().min(2).max(80),
  district: z.string().min(2).max(80),
  registrationNo: z.string().max(40).optional(), // GSTIN/CIN
  hiringNeeds: z.string().max(500).optional(),
  employeeCount: z.coerce.number().int().min(1).max(100000).optional(),
});
export type EmployerRegisterInput = z.infer<typeof employerRegisterSchema>;

export const employerRegisterResponseSchema = z.object({
  employer: z.object({
    id: uuidSchema,
    companyName: z.string(),
    contactEmail: z.string().email(),
    verificationStatus: employerVerificationStatusSchema,
  }),
});
export type EmployerRegisterResponse = z.infer<typeof employerRegisterResponseSchema>;

// ── Employer login: POST /api/v1/auth/employer/login (existing route) ──────
// Shape unchanged ({ email, password } → { user }); the Employer Track
// rewires resolution from claim-name matching to the Employers table.

export const employerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type EmployerLoginInput = z.infer<typeof employerLoginSchema>;

// ── Employer jobs (dashboard payload): GET /api/v1/employer/jobs ───────────
// The `employer` block carries the caller's verificationStatus so the
// dashboard renders the "verification pending" state without a second call.

export const employerJobSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  description: z.string(),
  employmentType: employmentTypeSchema,
  workMode: workModeSchema,
  salaryBand: salaryBandSchema.nullable(),
  district: z.string(),
  skillsRequired: z.array(z.string()),
  openings: z.number().int().min(0),
  applicationDeadline: isoDatetimeSchema.nullable(),
  status: jobPostingStatusSchema,
  applicationCount: z.number().int().min(0),
  hireCount: z.number().int().min(0),
  createdAt: isoDatetimeSchema,
});
export type EmployerJob = z.infer<typeof employerJobSchema>;

export const employerJobsResponseSchema = z.object({
  employer: z.object({
    id: z.string(),
    companyName: z.string(),
    verificationStatus: employerVerificationStatusSchema,
  }),
  jobs: z.array(employerJobSchema),
});
export type EmployerJobsResponse = z.infer<typeof employerJobsResponseSchema>;

// ── Create job: POST /api/v1/employer/jobs (VERIFIED only) ─────────────────

export const createJobSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  employmentType: employmentTypeSchema,
  workMode: workModeSchema,
  salaryBand: salaryBandSchema.optional(),
  district: z.string().min(2).max(80),
  skillsRequired: z.array(z.string().min(1).max(60)).min(1).max(20),
  openings: z.coerce.number().int().min(1).max(100).default(1),
  applicationDeadline: isoDatetimeSchema.optional(),
});
export type CreateJobInput = z.infer<typeof createJobSchema>;

// ── Update job (close/re-open/edit): PATCH /api/v1/employer/jobs/:id ───────

export const updateJobSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(5000).optional(),
  salaryBand: salaryBandSchema.optional(),
  openings: z.coerce.number().int().min(1).max(100).optional(),
  applicationDeadline: isoDatetimeSchema.nullable().optional(),
  status: jobPostingStatusSchema.optional(), // close / re-open
});
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// ── Route params (dynamic segments) ────────────────────────────────────────

export const jobIdParamSchema = z.object({ id: uuidSchema });
export const applicationActionParamsSchema = z.object({ id: uuidSchema, appId: uuidSchema });
export const applicationIdParamSchema = z.object({ id: uuidSchema });
export const employerIdParamSchema = z.object({ id: uuidSchema });

// ── Applicants list: GET /api/v1/employer/jobs/:id/applicants ──────────────
// Phone masked (e.g. "******1234") until SHORTLISTED; contact reveal is
// symmetric — full phone/email appear only when status === "SHORTLISTED"+.

export const applicantSchema = z.object({
  applicationId: uuidSchema,
  traineeId: z.string(),
  publicId: z.string(),
  name: z.string(),
  district: z.string(),
  skills: z.array(z.string()),
  certificates: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      issueDate: isoDatetimeSchema,
    }),
  ),
  phoneMasked: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: jobApplicationStatusSchema,
  appliedAt: isoDatetimeSchema,
});
export type Applicant = z.infer<typeof applicantSchema>;

export const applicantsResponseSchema = z.object({
  applicants: z.array(applicantSchema),
});
export type ApplicantsResponse = z.infer<typeof applicantsResponseSchema>;

// ── Application actions: POST /api/v1/employer/jobs/:id/applicants/:appId/{shortlist,hire,reject} ──

export const applicationActionResponseSchema = z.object({
  application: z.object({
    id: uuidSchema,
    status: jobApplicationStatusSchema,
  }),
  jobClosed: z.boolean().optional(), // hire only: true when hires reached openings
});
export type ApplicationActionResponse = z.infer<typeof applicationActionResponseSchema>;

// ── Trainee jobs: GET /api/v1/trainee/jobs ─────────────────────────────────
// Server returns OPEN + unexpired jobs only, relevance-sorted (same district
// first); filters are client-side so no refetch — the query schema exists for
// optional server-side narrowing during debugging.
// Job detail is a client-side expansion of this payload (it already carries
// description + skills) — no separate detail endpoint.

export const traineeJobsQuerySchema = z.object({
  district: z.string().max(80).optional(),
  workMode: workModeSchema.optional(),
  employmentType: employmentTypeSchema.optional(),
});
export type TraineeJobsQuery = z.infer<typeof traineeJobsQuerySchema>;

export const publicJobSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  description: z.string(),
  companyName: z.string(),
  employerVerified: z.boolean(),
  salaryBand: salaryBandSchema.nullable(),
  workMode: workModeSchema,
  employmentType: employmentTypeSchema,
  district: z.string(),
  skillsRequired: z.array(z.string()),
  openings: z.number().int().min(1),
  applicationDeadline: isoDatetimeSchema.nullable(),
  // "N hires · X% retained 90d" on the card (computeEmployerRetention).
  retention: z.object({
    hires: z.number().int().min(0),
    retainedPct: z.number().min(0).max(100).nullable(),
  }),
  applied: z.boolean(),
  appliedAt: isoDatetimeSchema.nullable(),
});
export type PublicJob = z.infer<typeof publicJobSchema>;

export const traineeJobsResponseSchema = z.object({
  jobs: z.array(publicJobSchema),
});
export type TraineeJobsResponse = z.infer<typeof traineeJobsResponseSchema>;

// ── Apply: POST /api/v1/trainee/jobs/:id/apply ─────────────────────────────

export const applyResponseSchema = z.object({
  application: z.object({
    id: uuidSchema,
    jobPostingId: uuidSchema,
    status: jobApplicationStatusSchema,
  }),
});
export type ApplyResponse = z.infer<typeof applyResponseSchema>;

// ── My applications: GET /api/v1/trainee/applications ──────────────────────

export const myApplicationSchema = z.object({
  id: uuidSchema,
  jobPostingId: uuidSchema,
  jobTitle: z.string(),
  companyName: z.string(),
  district: z.string(),
  status: jobApplicationStatusSchema,
  appliedAt: isoDatetimeSchema,
  // Symmetric contact reveal: employer email appears once SHORTLISTED.
  employerContactEmail: z.string().email().nullable(),
});
export type MyApplication = z.infer<typeof myApplicationSchema>;

export const myApplicationsResponseSchema = z.object({
  applications: z.array(myApplicationSchema),
});
export type MyApplicationsResponse = z.infer<typeof myApplicationsResponseSchema>;

// ── Withdraw: POST /api/v1/trainee/applications/:id/withdraw ───────────────

export const withdrawResponseSchema = z.object({
  application: z.object({
    id: uuidSchema,
    status: jobApplicationStatusSchema,
  }),
});
export type WithdrawResponse = z.infer<typeof withdrawResponseSchema>;

// ── Job seek signal: POST /api/v1/trainee/job-seek-signal ──────────────────
// District is taken from the trainee profile server-side; the client only
// chooses a reason (reuses the non_placement_reason enum).

export const jobSeekSignalSchema = z.object({
  reason: nonPlacementReasonSchema,
});
export type JobSeekSignalInput = z.infer<typeof jobSeekSignalSchema>;

export const jobSeekSignalResponseSchema = z.object({
  signal: z.object({
    id: uuidSchema,
    reason: nonPlacementReasonSchema,
    district: z.string(),
  }),
});
export type JobSeekSignalResponse = z.infer<typeof jobSeekSignalResponseSchema>;

// ── Admin: pending employers queue: GET /api/v1/admin/employers/pending ────

export const pendingEmployerSchema = z.object({
  id: uuidSchema,
  companyName: z.string(),
  contactEmail: z.string().email(),
  sector: z.string(),
  district: z.string(),
  registrationNo: z.string().nullable(),
  hiringNeeds: z.string().nullable(),
  employeeCount: z.number().int().nullable(),
  createdAt: isoDatetimeSchema,
});
export type PendingEmployer = z.infer<typeof pendingEmployerSchema>;

export const pendingEmployersResponseSchema = z.object({
  employers: z.array(pendingEmployerSchema),
});
export type PendingEmployersResponse = z.infer<typeof pendingEmployersResponseSchema>;

// ── Admin verify/reject: POST /api/v1/admin/employers/:id/verify ───────────
// ── Admin suspend: POST /api/v1/admin/employers/:id/suspend ────────────────
// Both audit-logged (ActorType ADMIN).

export const verifyEmployerSchema = z.object({
  decision: z.enum(["VERIFIED", "REJECTED"]),
});
export type VerifyEmployerInput = z.infer<typeof verifyEmployerSchema>;

export const suspendEmployerSchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});
export type SuspendEmployerInput = z.infer<typeof suspendEmployerSchema>;

export const employerStatusResponseSchema = z.object({
  employer: z.object({
    id: uuidSchema,
    companyName: z.string(),
    verificationStatus: employerVerificationStatusSchema,
  }),
});
export type EmployerStatusResponse = z.infer<typeof employerStatusResponseSchema>;

// ── Gov marketplace: GET /api/v1/outcomes/government (extended) ────────────
// Extends the existing response with a `jobMarketplace` section — existing
// fields and charts stay untouched (append-only analytics pipeline).

export const demandGapSchema = z.object({
  district: z.string(),
  signals: z.number().int().min(0),
  openJobs: z.number().int().min(0),
  byReason: z.array(
    z.object({ reason: nonPlacementReasonSchema, count: z.number().int().min(0) }),
  ),
});
export type DemandGap = z.infer<typeof demandGapSchema>;

export const employerReliabilitySchema = z.object({
  employerId: uuidSchema,
  companyName: z.string(),
  verificationStatus: employerVerificationStatusSchema,
  hires: z.number().int().min(0),
  retentionScore: z.number().min(0).max(100).nullable(),
  flagged: z.boolean(),
});
export type EmployerReliability = z.infer<typeof employerReliabilitySchema>;

export const jobMarketplaceSchema = z.object({
  jobsPosted: z.number().int().min(0),
  openJobs: z.number().int().min(0),
  applications: z.number().int().min(0),
  hires: z.number().int().min(0),
  hireRate: z.number().min(0).max(100).nullable(), // hires / applications, %
  demandGaps: z.array(demandGapSchema),
  employerReliability: z.array(employerReliabilitySchema),
});
export type JobMarketplace = z.infer<typeof jobMarketplaceSchema>;

// ── Route map (documentation + middleware wiring reference) ────────────────

export const JOB_BOARD_ROUTES = {
  employerRegister: "POST /api/v1/employer/register",
  employerLogin: "POST /api/v1/auth/employer/login",
  employerJobs: "GET|POST /api/v1/employer/jobs",
  employerJob: "PATCH /api/v1/employer/jobs/:id",
  employerApplicants: "GET /api/v1/employer/jobs/:id/applicants",
  applicationAction: "POST /api/v1/employer/jobs/:id/applicants/:appId/{shortlist|hire|reject}",
  traineeJobs: "GET /api/v1/trainee/jobs",
  traineeApply: "POST /api/v1/trainee/jobs/:id/apply",
  myApplications: "GET /api/v1/trainee/applications",
  withdraw: "POST /api/v1/trainee/applications/:id/withdraw",
  jobSeekSignal: "POST /api/v1/trainee/job-seek-signal",
  adminPendingEmployers: "GET /api/v1/admin/employers/pending",
  adminVerifyEmployer: "POST /api/v1/admin/employers/:id/verify",
  adminSuspendEmployer: "POST /api/v1/admin/employers/:id/suspend",
  govMarketplace: "GET /api/v1/outcomes/government (extended with jobMarketplace)",
} as const;
