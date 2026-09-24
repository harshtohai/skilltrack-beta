import { db } from "~/server/db";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { computeCenterScores, computePeerStats, type CenterScore, type CenterInput, type CategoryRates } from "~/server/scoring";

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

/**
 * Training-center leaderboard data: per-center aggregates computed with
 * the same flat-query + in-memory pattern as getMonthlyOutcomes, then
 * scored by the pure scoring engine.
 */
export async function getTrainingCenterScores(): Promise<CenterScore[]> {
  const [enrolments, outcomes, certificates, surveys, centers] = await Promise.all([
    db.enrolment.findMany({
      select: {
        traineeId: true,
        cohort: { select: { trainingCenterId: true, trainingCenter: { select: { name: true } } } },
      },
    }),
    db.outcomeEvent.findMany({
      select: { traineeId: true, outcomeStatus: true, verificationStatus: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.certificate.findMany({ select: { traineeId: true } }),
    db.surveyResponse.findMany({
      where: { traineeId: { not: null }, trainingRelevance: { not: null } },
      select: { traineeId: true, trainingRelevance: true },
    }),
    db.trainingCenter.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  // Latest outcome per trainee
  const latestOutcome = new Map<string, { outcomeStatus: string; verificationStatus: string }>();
  for (const o of outcomes) {
    latestOutcome.set(o.traineeId, {
      outcomeStatus: o.outcomeStatus,
      verificationStatus: o.verificationStatus,
    });
  }

  const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);
  const isVerified = (status: string) => (VERIFIED_STATUSES as readonly string[]).includes(status);

  const relevanceSums = new Map<string, number>();
  const relevanceCounts = new Map<string, number>();
  for (const s of surveys) {
    if (!s.traineeId) continue;
    const relevance = Number(s.trainingRelevance);
    if (Number.isNaN(relevance)) continue;
    relevanceSums.set(s.traineeId, (relevanceSums.get(s.traineeId) ?? 0) + relevance);
    relevanceCounts.set(s.traineeId, (relevanceCounts.get(s.traineeId) ?? 0) + 1);
  }

  // Per-center tallies (single pass over enrolments)
  const tallies = new Map<string, CenterInput & { certTotal: number; relevanceTotal: number; relevanceTrainees: number }>();
  for (const center of centers) {
    tallies.set(center.id, {
      centerId: center.id,
      centerName: center.name,
      certifiedCount: 0,
      employedKnown: 0,
      employedVerified: 0,
      outcomesKnown: 0,
      certificatesPerTrainee: 0,
      trainingRelevanceAvg: null,
      certTotal: 0,
      relevanceTotal: 0,
      relevanceTrainees: 0,
    });
  }

  const certCount = new Map<string, number>();
  for (const c of certificates) {
    certCount.set(c.traineeId, (certCount.get(c.traineeId) ?? 0) + 1);
  }

  for (const enrolment of enrolments) {
    const centerId = enrolment.cohort.trainingCenterId;
    if (!centerId) continue;
    const tally = tallies.get(centerId);
    if (!tally) continue;

    tally.certifiedCount++;
    tally.certTotal += certCount.get(enrolment.traineeId) ?? 0;

    const relCount = relevanceCounts.get(enrolment.traineeId);
    if (relCount) {
      tally.relevanceTotal += (relevanceSums.get(enrolment.traineeId) ?? 0) / relCount;
      tally.relevanceTrainees++;
    }

    const latest = latestOutcome.get(enrolment.traineeId);
    if (!latest) continue;
    if (latest.outcomeStatus === "UNKNOWN") continue;

    tally.outcomesKnown++;
    if (isEmployed(latest.outcomeStatus)) {
      tally.employedKnown++;
      if (isVerified(latest.verificationStatus)) tally.employedVerified++;
    }
  }

  // Finalize per-center averages
  const inputs: CenterInput[] = [];
  for (const tally of tallies.values()) {
    inputs.push({
      centerId: tally.centerId,
      centerName: tally.centerName,
      certifiedCount: tally.certifiedCount,
      employedKnown: tally.employedKnown,
      employedVerified: tally.employedVerified,
      outcomesKnown: tally.outcomesKnown,
      certificatesPerTrainee:
        tally.certifiedCount > 0 ? tally.certTotal / tally.certifiedCount : 0,
      trainingRelevanceAvg:
        tally.relevanceTrainees > 0 ? tally.relevanceTotal / tally.relevanceTrainees : null,
    });
  }

  return computeCenterScores(inputs);
}

export interface GroupRates extends CategoryRates {
  key: string;
  certifiedCount: number;
  traineeCount: number;
  outcomesKnown: number;
  employed: number;
  verified: number;
  retained: number;
  wageProgress: number;
  certTotal: number;
}

interface GroupTally {
  certifiedCount: number;
  trainees: Set<string>;
  outcomesKnown: number;
  employed: number;
  verified: number;
  retained: number;
  wageProgress: number;
  certTotal: number;
}

function finalizeGroup(key: string, tally: GroupTally): GroupRates {
  const certifiedCount = tally.certifiedCount;
  const employed = tally.employed;
  const traineeCount = tally.trainees.size;
  return {
    key,
    certifiedCount,
    traineeCount,
    outcomesKnown: tally.outcomesKnown,
    employed,
    verified: tally.verified,
    retained: tally.retained,
    wageProgress: tally.wageProgress,
    certTotal: tally.certTotal,
    placementRate: tally.outcomesKnown > 0 ? (employed / tally.outcomesKnown) * 100 : 0,
    retentionRate: employed > 0 ? (tally.retained / employed) * 100 : 0,
    verifiedRate: employed > 0 ? (tally.verified / employed) * 100 : 0,
    wageProgressionRate: employed > 0 ? (tally.wageProgress / employed) * 100 : 0,
    certificatesPerTrainee: certifiedCount > 0 ? tally.certTotal / certifiedCount : 0,
  };
}

/**
 * Per-center and per-cohort raw outcome rates in one flat pass, for peer
 * benchmarking and cohort comparison tables.
 */
export async function getGroupedRates(): Promise<{ byCenter: GroupRates[]; byCohort: GroupRates[] }> {
  const [enrolments, outcomes, claims, certificates] = await Promise.all([
    db.enrolment.findMany({
      select: {
        traineeId: true,
        cohortId: true,
        cohort: { select: { trainingCenterId: true } },
      },
    }),
    db.outcomeEvent.findMany({
      select: {
        traineeId: true,
        checkpointDays: true,
        outcomeStatus: true,
        verificationStatus: true,
        employmentClaimId: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.employmentClaim.findMany({ select: { id: true, salaryBand: true } }),
    db.certificate.findMany({ select: { traineeId: true } }),
  ]);

  const claimBand = new Map(claims.map((c) => [c.id, c.salaryBand]));

  // Per-trainee aggregates: latest outcome, checkpoint pairs, cert count
  const traineeAgg = new Map<string, {
    outcomeStatus: string;
    verificationStatus: string;
    has30: boolean;
    has90: boolean;
    employed30: boolean;
    employed90: boolean;
    band30: number;
    band90: number;
    certs: number;
  }>();

  for (const o of outcomes) {
    const agg = traineeAgg.get(o.traineeId) ?? {
      outcomeStatus: o.outcomeStatus,
      verificationStatus: o.verificationStatus,
      has30: false,
      has90: false,
      employed30: false,
      employed90: false,
      band30: 0,
      band90: 0,
      certs: 0,
    };

    if (o.checkpointDays === 30) {
      agg.has30 = true;
      if ((EMPLOYED_STATUSES as readonly string[]).includes(o.outcomeStatus)) {
        agg.employed30 = true;
        const band = o.employmentClaimId ? claimBand.get(o.employmentClaimId) : null;
        if (band) agg.band30 = SALARY_BAND_ORDER.indexOf(band);
      }
    }
    if (o.checkpointDays === 90) {
      agg.has90 = true;
      if ((EMPLOYED_STATUSES as readonly string[]).includes(o.outcomeStatus)) {
        agg.employed90 = true;
        const band = o.employmentClaimId ? claimBand.get(o.employmentClaimId) : null;
        if (band) agg.band90 = SALARY_BAND_ORDER.indexOf(band);
      }
    }
    traineeAgg.set(o.traineeId, agg);
  }

  const certCount = new Map<string, number>();
  for (const c of certificates) {
    certCount.set(c.traineeId, (certCount.get(c.traineeId) ?? 0) + 1);
  }
  for (const [traineeId, count] of certCount) {
    const agg = traineeAgg.get(traineeId);
    if (agg) agg.certs = count;
  }

  const isEmployed = (status: string) => (EMPLOYED_STATUSES as readonly string[]).includes(status);
  const isVerified = (status: string) => (VERIFIED_STATUSES as readonly string[]).includes(status);

  const centerTallies = new Map<string, GroupTally>();
  const cohortTallies = new Map<string, GroupTally>();

  for (const enrolment of enrolments) {
    const agg = traineeAgg.get(enrolment.traineeId);

    const applyTo = (tally: GroupTally | undefined) => {
      if (!tally) return;
      tally.certifiedCount++;
      tally.trainees.add(enrolment.traineeId);
      tally.certTotal += certCount.get(enrolment.traineeId) ?? 0;
      if (!agg) return;
      if (agg.outcomeStatus === "UNKNOWN") return;

      tally.outcomesKnown++;
      if (isEmployed(agg.outcomeStatus)) {
        tally.employed++;
        if (isVerified(agg.verificationStatus)) tally.verified++;
        if (agg.has30 && agg.has90 && agg.employed30 && agg.employed90) {
          tally.retained++;
          if (agg.band90 > agg.band30) tally.wageProgress++;
        }
      }
    };

    if (enrolment.cohort.trainingCenterId) {
      const tally = centerTallies.get(enrolment.cohort.trainingCenterId) ?? {
        certifiedCount: 0, trainees: new Set<string>(), outcomesKnown: 0,
        employed: 0, verified: 0, retained: 0, wageProgress: 0, certTotal: 0,
      };
      applyTo(tally);
      centerTallies.set(enrolment.cohort.trainingCenterId, tally);
    }

    const cohortTally = cohortTallies.get(enrolment.cohortId) ?? {
      certifiedCount: 0, trainees: new Set<string>(), outcomesKnown: 0,
      employed: 0, verified: 0, retained: 0, wageProgress: 0, certTotal: 0,
    };
    applyTo(cohortTally);
    cohortTallies.set(enrolment.cohortId, cohortTally);
  }

  const byCenter: GroupRates[] = [];
  for (const [key, tally] of centerTallies) byCenter.push(finalizeGroup(key, tally));
  const byCohort: GroupRates[] = [];
  for (const [key, tally] of cohortTallies) byCohort.push(finalizeGroup(key, tally));

  return { byCenter, byCohort };
}

/** Peer benchmark stats (avg + top quartile) across center/cohort groups. */
export async function getPeerBenchmarks(): Promise<{
  avg: CategoryRates;
  topQuartile: CategoryRates;
  centerCount: number;
}> {
  const { byCenter } = await getGroupedRates();
  const stats = computePeerStats(
    byCenter.map((c) => ({
      placementRate: c.placementRate,
      retentionRate: c.retentionRate,
      verifiedRate: c.verifiedRate,
      wageProgressionRate: c.wageProgressionRate,
      certificatesPerTrainee: c.certificatesPerTrainee,
    }))
  );
  return { ...stats, centerCount: byCenter.length };
}
