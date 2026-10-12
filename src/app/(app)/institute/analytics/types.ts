export interface InstituteAnalyticsData {
  timeWindow: string;
  labels: string[];
  monthlyData: InstituteMonthlyData[];
  overall: {
    totalCertified: number;
    totalEmployed: number;
    totalRetained: number;
    totalCertificates: number;
    avgCertificatesPerTrainee: number;
  };
  peerComparison: {
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
    avgPlacementRate: number;
    avgRetentionRate: number;
    avgVerifiedRate: number;
    avgWageProgressionRate: number;
    avgCertificatesPerTrainee: number;
    topQuartilePlacementRate: number;
    topQuartileRetentionRate: number;
    topQuartileVerifiedRate: number;
    topQuartileWageProgressionRate: number;
    topQuartileCertificatesPerTrainee: number;
    gaps: {
      placementRate: number;
      retentionRate: number;
      verifiedRate: number;
      wageProgressionRate: number;
      certificatesPerTrainee: number;
    };
    centerCount: number;
  };
  cohorts: Array<{
    id: string;
    name: string;
    programme: string;
    traineeCount: number;
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
    certificatesPerTrainee: number;
  }>;
}

export interface InstituteMonthlyData {
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
  avgSalaryBand: number;
}
