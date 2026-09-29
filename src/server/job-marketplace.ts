/**
 * Job Board (F25) marketplace aggregations. Pure functions over plain
 * data — no Prisma, no IO — the API routes fetch flat aggregates and
 * feed them in, which keeps these functions unit-testable.
 *
 * Output types come from the frozen job-board contracts so the
 * aggregation matches what the government analytics route and the
 * admin marketplace panel expect.
 */

import type {
  DemandGap,
  EmployerReliability,
  EmployerVerificationStatus,
  NonPlacementReason,
} from "~/lib/job-board-contracts";

export interface DemandGapSignalInput {
  district: string;
  reason: NonPlacementReason;
}

export interface EmployerReliabilityInput {
  id: string;
  companyName: string;
  verificationStatus: EmployerVerificationStatus;
}

/** District → count lookup that accepts either a Map or a plain record. */
function asCountMap(index: ReadonlyMap<string, number> | Record<string, number>): ReadonlyMap<string, number> {
  if (index instanceof Map) return index;
  return new Map(Object.entries(index));
}

/**
 * Demand gaps by district: job-seek signals vs open job postings.
 * Signals count, openJobs count (0 when the district has no open jobs)
 * and a byReason breakdown sorted by count desc then reason; districts
 * sorted by signals desc then name.
 */
export function aggregateDemandGaps(
  signals: DemandGapSignalInput[],
  openJobsByDistrict: ReadonlyMap<string, number> | Record<string, number>
): DemandGap[] {
  const openJobsByDistrictMap = asCountMap(openJobsByDistrict);

  const byDistrict = new Map<string, Map<NonPlacementReason, number>>();
  for (const signal of signals) {
    const reasons = byDistrict.get(signal.district) ?? new Map<NonPlacementReason, number>();
    reasons.set(signal.reason, (reasons.get(signal.reason) ?? 0) + 1);
    byDistrict.set(signal.district, reasons);
  }

  return [...byDistrict.entries()]
    .map(([district, reasons]) => ({
      district,
      signals: [...reasons.values()].reduce((sum, count) => sum + count, 0),
      openJobs: openJobsByDistrictMap.get(district) ?? 0,
      byReason: [...reasons.entries()]
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason)),
    }))
    .sort((a, b) => b.signals - a.signals || a.district.localeCompare(b.district));
}

/**
 * Employer reliability: board hires (HIRED applications), retention
 * score (precomputed per employer — null = insufficient evidence) and
 * a flag when the employer is suspended or retention falls below 50.
 * Employers keep their input order.
 */
export function aggregateEmployerReliability(
  employers: EmployerReliabilityInput[],
  hiresByEmployer: Record<string, number>,
  retentionScores: Record<string, number | null>
): EmployerReliability[] {
  return employers.map((employer) => {
    const retentionScore = retentionScores[employer.id] ?? null;
    return {
      employerId: employer.id,
      companyName: employer.companyName,
      verificationStatus: employer.verificationStatus,
      hires: hiresByEmployer[employer.id] ?? 0,
      retentionScore,
      flagged:
        employer.verificationStatus === "SUSPENDED" ||
        (retentionScore !== null && retentionScore < 50),
    };
  });
}
