/**
 * Pure scoring engine. No Prisma, no IO — the API routes fetch flat
 * aggregates and feed them in, which keeps these functions unit-testable.
 *
 * All scores are 0–100 and always paired with their numerators/
 * denominators (trust display: never show a bare percentage).
 */

export interface CenterInput {
  centerId: string;
  centerName: string;
  /** Trainees certified at this center */
  certifiedCount: number;
  /** Employed (any evidence) among trainees with known outcomes */
  employedKnown: number;
  /** Subset of employedKnown that is employer-confirmed */
  employedVerified: number;
  /** Trainees with a known (non-UNKNOWN) outcome */
  outcomesKnown: number;
  /** Average certificates per trainee */
  certificatesPerTrainee: number;
  /** Average training relevance 0–5 from surveys, or null when none */
  trainingRelevanceAvg: number | null;
}

export interface CenterScore {
  centerId: string;
  centerName: string;
  placementScore: number;
  academicScore: number;
  volumeScore: number;
  overallScore: number;
  numerators: {
    employedKnown: number;
    employedVerified: number;
    outcomesKnown: number;
    certifiedCount: number;
    certificatesPerTrainee: number;
    trainingRelevanceAvg: number | null;
  };
}

const CERT_BENCHMARK = 2; // certificates per trainee that maps to a full score
const WEIGHTS = { placement: 0.5, academic: 0.3, volume: 0.2 } as const;

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Placement score: verified-weighted percentage of trainees with known
 * outcomes that are employed. Employer-confirmed employment counts 1.0,
 * self-reported counts 0.5.
 */
function placementScore(input: CenterInput): number {
  if (input.outcomesKnown === 0) return 0;
  const weightedEmployed =
    input.employedVerified + 0.5 * Math.max(0, input.employedKnown - input.employedVerified);
  return clamp100((weightedEmployed / input.outcomesKnown) * 100);
}

/**
 * Academic score: 60% training relevance (0–5 → 0–100) + 40% certificates
 * per trainee (benchmark: 2). Falls back to certificates-only when no
 * survey data exists.
 */
function academicScore(input: CenterInput): number {
  const certScore = clamp100((input.certificatesPerTrainee / CERT_BENCHMARK) * 100);
  if (input.trainingRelevanceAvg === null) return certScore;
  const relevanceScore = clamp100((input.trainingRelevanceAvg / 5) * 100);
  return clamp100(0.6 * relevanceScore + 0.4 * certScore);
}

/**
 * Institute scores across all centers. Volume is relative to the largest
 * center; everything else is absolute. Overall = 50/30/20 placement/
 * academic/volume.
 */
export function computeCenterScores(centers: CenterInput[]): CenterScore[] {
  const maxCertified = Math.max(...centers.map((c) => c.certifiedCount), 0);

  return centers.map((input) => {
    const placement = placementScore(input);
    const academic = academicScore(input);
    const volume =
      maxCertified === 0 ? 0 : clamp100((input.certifiedCount / maxCertified) * 100);
    const overall = Math.round(
      WEIGHTS.placement * placement + WEIGHTS.academic * academic + WEIGHTS.volume * volume
    );

    return {
      centerId: input.centerId,
      centerName: input.centerName,
      placementScore: Math.round(placement),
      academicScore: Math.round(academic),
      volumeScore: Math.round(volume),
      overallScore: overall,
      numerators: {
        employedKnown: input.employedKnown,
        employedVerified: input.employedVerified,
        outcomesKnown: input.outcomesKnown,
        certifiedCount: input.certifiedCount,
        certificatesPerTrainee: Math.round(input.certificatesPerTrainee * 10) / 10,
        trainingRelevanceAvg:
          input.trainingRelevanceAvg === null
            ? null
            : Math.round(input.trainingRelevanceAvg * 10) / 10,
      },
    };
  });
}

export interface EmployerClaimInput {
  employerName: string;
  /** Claim is employer-confirmed (only confirmed claims are scoreable) */
  confirmed: boolean;
  /** Trainee still employed at a later checkpoint; null = no later data */
  sustainedEmployment: boolean | null;
}

export interface RetentionScore {
  /** null = insufficient evidence (no confirmed claim with later data) */
  score: number | null;
  numerator: number;
  denominator: number;
}

/**
 * Employer retention score: of the employer's confirmed claims that have
 * later checkpoint data, the share showing sustained employment.
 */
export function computeEmployerRetention(claims: EmployerClaimInput[]): RetentionScore {
  const scoreable = claims.filter((c) => c.confirmed && c.sustainedEmployment !== null);
  const numerator = scoreable.filter((c) => c.sustainedEmployment === true).length;
  const denominator = scoreable.length;
  if (denominator === 0) return { score: null, numerator, denominator };
  return { score: Math.round((numerator / denominator) * 100), numerator, denominator };
}

/**
 * Employer identity: free-text names grouped by a normalized form.
 */
export function normalizeEmployerName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toUpperCase();
}

export interface CategoryRates {
  placementRate: number;
  retentionRate: number;
  verifiedRate: number;
  wageProgressionRate: number;
  certificatesPerTrainee: number;
}

export interface PeerStats {
  avg: CategoryRates;
  topQuartile: CategoryRates;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Nearest-rank 75th percentile: smallest value with 75% of data at or below it. */
export function percentile75(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(0.75 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))] ?? 0;
}

/**
 * Peer benchmark stats across a set of centers/cohorts: per-category
 * average and top-quartile (p75) values.
 */
export function computePeerStats(groups: CategoryRates[]): PeerStats {
  return {
    avg: {
      placementRate: mean(groups.map((g) => g.placementRate)),
      retentionRate: mean(groups.map((g) => g.retentionRate)),
      verifiedRate: mean(groups.map((g) => g.verifiedRate)),
      wageProgressionRate: mean(groups.map((g) => g.wageProgressionRate)),
      certificatesPerTrainee: mean(groups.map((g) => g.certificatesPerTrainee)),
    },
    topQuartile: {
      placementRate: percentile75(groups.map((g) => g.placementRate)),
      retentionRate: percentile75(groups.map((g) => g.retentionRate)),
      verifiedRate: percentile75(groups.map((g) => g.verifiedRate)),
      wageProgressionRate: percentile75(groups.map((g) => g.wageProgressionRate)),
      certificatesPerTrainee: percentile75(groups.map((g) => g.certificatesPerTrainee)),
    },
  };
}