import type { JobMarketplace } from "~/lib/job-board-contracts";

export interface TrainingCenterScore {
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

export interface GovernmentAnalyticsData {
  timeWindow: string;
  labels: string[];
  monthlyData: MonthlyData[];
  overall: {
    totalCertified: number;
    totalEmployed: number;
    totalRetained: number;
    totalVerified: number;
  };
  trainingCenters: TrainingCenterScore[];
  jobMarketplace?: JobMarketplace | null;
  targets: {
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface MonthlyData {
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
