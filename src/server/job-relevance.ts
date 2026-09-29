/**
 * Pure job-board relevance engine. No Prisma, no IO — the API route and the
 * client dashboard feed plain job shapes in, which keeps these functions
 * unit-testable (mirrors the scoring/recommendations split).
 *
 * Relevance order (spec #32, ticket #46): the trainee's own district first,
 * then employer-verified before non-verified, then newest first. Ties keep
 * the original order (stable sort).
 */

export interface SortableJob {
  district: string;
  employerVerified: boolean;
  /** ISO datetime string (or Date/number) — used for the recency tiebreak */
  createdAt: string | number | Date;
}

export interface JobFilter {
  district?: string;
  workMode?: string;
  employmentType?: string;
}

/** Minimal job shape needed by matchesFilters (PublicJob-compatible). */
export interface FilterableJob {
  district: string;
  workMode: string;
  employmentType: string;
}

function timeOf(value: string | number | Date): number {
  return new Date(value).getTime();
}

function sameDistrict(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Stable relevance sort: same district first (case-insensitive), then
 * employer-verified before non-verified, then newest first. The input
 * array is not mutated; equal-rank jobs keep their original order.
 */
export function sortJobsForTrainee<T extends SortableJob>(
  jobs: T[],
  traineeDistrict: string
): T[] {
  const withIndex = jobs.map((job, index) => ({ job, index }));
  withIndex.sort((a, b) => {
    const aHome = sameDistrict(a.job.district, traineeDistrict) ? 0 : 1;
    const bHome = sameDistrict(b.job.district, traineeDistrict) ? 0 : 1;
    if (aHome !== bHome) return aHome - bHome;
    if (a.job.employerVerified !== b.job.employerVerified) {
      return a.job.employerVerified ? -1 : 1;
    }
    const aTime = timeOf(a.job.createdAt);
    const bTime = timeOf(b.job.createdAt);
    if (aTime !== bTime) return bTime - aTime;
    return a.index - b.index;
  });
  return withIndex.map((entry) => entry.job);
}

/**
 * Client-side filter predicate (no refetch): district matches
 * case-insensitively; workMode/employmentType match exactly. Empty or
 * missing filter values are treated as "no filter".
 */
export function matchesFilters(job: FilterableJob, filters: JobFilter): boolean {
  if (filters.district && !sameDistrict(job.district, filters.district)) return false;
  if (filters.workMode && job.workMode !== filters.workMode) return false;
  if (filters.employmentType && job.employmentType !== filters.employmentType) return false;
  return true;
}
