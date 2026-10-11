// Human labels for the job-board cluster (F25) — shared by the employer
// dashboard, job management and the post-job form. The trainee job card
// intentionally renders work mode with the compact "Onsite" spelling; that
// copy stays local to src/components/trainee/job-card.tsx.

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

export const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

export const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};
