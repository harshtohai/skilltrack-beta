import { db } from "~/server/db";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const EMPLOYED_STATUSES = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"] as const;
export const VERIFIED_STATUSES = ["EMPLOYER_CONFIRMED", "DOCUMENT_VERIFIED"] as const;
const SALARY_BAND_ORDER = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"] as const;

export type TimeWindow = "6m" | "12m" | "24m" | "all";

export function getMonthsBack(timeWindow: TimeWindow): number {
  switch (timeWindow) {
    case "6m": return 6;
    case "12m": return 12;
    case "24m": return 24;
    default: return 60;
  }
}

export interface MonthRow {
  month: string;
  certified: number;
  employed: number;
  retained90: number;
  verifiedEmployed: number;
  wageProgression: number;
  placementRate: number;
  retentionRate: number;
  verifiedRate: number;
  wageProgressionRate: number;
  expectedPlacement: number;
  expectedRetention: number;
  expectedVerified: number;
  expectedWageProgression: number;
}

interface FlatOutcome {
  traineeId: string;
  checkpointDays: number;
  outcomeStatus: string;
  verificationStatus: string;
  createdAt: Date;
  employmentClaimId: string | null;
}

interface EnrolmentRow {
  traineeId: string;
  certificationDate: Date;
}

/**
 * Loads flat, minimal column sets (3 queries total) instead of deep-nested
 * includes over every trainee. Aggregates per month in memory.
 */
export async function getMonthlyOutcomes(opts: {
  timeWindow: TimeWindow;
  limit: number;
  programmeId?: string;
  district?: string;
}): Promise<{ monthlyData: MonthRow[]; overall: { totalCertified: number; totalEmployed: number; totalRetained: number; totalVerified: number } }> {
  const monthsBack = getMonthsBack(opts.timeWindow);
  const startDate = subMonths(new Date(), monthsBack);

  // Enrolment filter depends on programme/district
  const enrolmentWhere: { certificationDate: { gte: Date }; trainee?: { district?: string }; programmeId?: string } = {
    certificationDate: { gte: startDate },
  };
  if (opts.programmeId) enrolmentWhere.programmeId = opts.programmeId;
  if (opts.district) enrolmentWhere.trainee = { district: opts.district };

  // 3 flat queries, only the columns we need
  const [enrolments, outcomes, claims] = await Promise.all([
    db.enrolment.findMany({
      where: enrolmentWhere,
      select: { traineeId: true, certificationDate: true },
    }),
    db.outcomeEvent.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        traineeId: true,
        checkpointDays: true,
        outcomeStatus: true,
        verificationStatus: true,
        createdAt: true,
        employmentClaimId: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.employmentClaim.findMany({
      where: { createdAt: { gte: startDate } },
      select: { id: true, salaryBand: true },
    }),
  ]);

  const claimBand = new Map(claims.map((c) => [c.id, c.salaryBand]));

  // Index outcomes by trainee for O(1) lookup
  const byTrainee = new Map<string, FlatOutcome[]>();
  for (const o of outcomes) {
    const list = byTrainee.get(o.traineeId) ?? [];
    list.push(o);
    byTrainee.set(o.traineeId, list);
  }

  // Bucket enrolments by certification month
  const byMonth = new Map<string, EnrolmentRow[]>();
  for (const e of enrolments) {
    const label = format(e.certificationDate, "MMM yyyy");
    const list = byMonth.get(label) ?? [];
    list.push(e);
    byMonth.set(label, list);
  }

  const labels: string[] = [];
  for (let i = monthsBack - 1; i >= 0 && labels.length < opts.limit; i--) {
    labels.push(format(subMonths(new Date(), i), "MMM yyyy"));
  }

  const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);
  const isVerified = (status: string) => (VERIFIED_STATUSES as readonly string[]).includes(status);

  let totalCertified = 0;
  let totalEmployed = 0;
  let totalRetained = 0;
  let totalVerified = 0;

  const monthlyData = labels.map((label) => {
    const monthStart = startOfMonth(new Date(`${label} 1`));
    const monthEnd = endOfMonth(monthStart);

    const rows = byMonth.get(label) ?? [];
    let employed = 0;
    let retained90 = 0;
    let verifiedEmployed = 0;
    let wageProgression = 0;

    for (const row of rows) {
      const events = byTrainee.get(row.traineeId) ?? [];
      const o30 = events.find((e) => e.checkpointDays === 30 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
      const o90 = events.find((e) => e.checkpointDays === 90 && e.createdAt >= monthStart && e.createdAt <= monthEnd);
      const latest = o90 ?? o30;

      if (latest && isEmployed(latest.outcomeStatus)) {
        employed++;
        if (isVerified(latest.verificationStatus)) verifiedEmployed++;
      }

      if (o30 && o90 && isEmployed(o30.outcomeStatus) && isEmployed(o90.outcomeStatus)) {
        retained90++;
        const band30 = o30.employmentClaimId ? claimBand.get(o30.employmentClaimId) : null;
        const band90 = o90.employmentClaimId ? claimBand.get(o90.employmentClaimId) : null;
        const idx30 = band30 ? SALARY_BAND_ORDER.indexOf(band30) : 0;
        const idx90 = band90 ? SALARY_BAND_ORDER.indexOf(band90) : 0;
        if (idx90 > idx30) wageProgression++;
      }
    }

    totalCertified += rows.length;
    totalEmployed += employed;
    totalRetained += retained90;
    totalVerified += verifiedEmployed;

    return {
      month: label,
      certified: rows.length,
      employed,
      retained90,
      verifiedEmployed,
      wageProgression,
      placementRate: rows.length > 0 ? (employed / rows.length) * 100 : 0,
      retentionRate: employed > 0 ? (retained90 / employed) * 100 : 0,
      verifiedRate: employed > 0 ? (verifiedEmployed / employed) * 100 : 0,
      wageProgressionRate: employed > 0 ? (wageProgression / employed) * 100 : 0,
      expectedPlacement: 70,
      expectedRetention: 60,
      expectedVerified: 50,
      expectedWageProgression: 30,
    };
  });

  return {
    monthlyData,
    overall: { totalCertified, totalEmployed, totalRetained, totalVerified },
  };
}
