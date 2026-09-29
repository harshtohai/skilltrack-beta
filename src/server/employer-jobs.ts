// Employer job payload mapping (F25): JobPosting rows → the frozen
// employerJobSchema shape. Counts derive from non-withdrawn applications so
// withdrawn applicants never inflate the pipeline numbers. Type-only imports
// keep this unit-testable.

import type { Prisma } from "@prisma/client";
import type { EmployerJob } from "~/lib/job-board-contracts";

export type JobWithApplications = Prisma.JobPostingGetPayload<{
  include: { applications: { select: { status: true } } };
}>;

export function toEmployerJob(job: JobWithApplications): EmployerJob {
  const counted = job.applications.filter((application) => application.status !== "WITHDRAWN");
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    employmentType: job.employmentType,
    workMode: job.workMode,
    salaryBand: job.salaryBand,
    district: job.district,
    skillsRequired: job.skillsRequired,
    openings: job.openings,
    applicationDeadline: job.applicationDeadline?.toISOString() ?? null,
    status: job.status,
    applicationCount: counted.length,
    hireCount: counted.filter((application) => application.status === "HIRED").length,
    createdAt: job.createdAt.toISOString(),
  };
}
