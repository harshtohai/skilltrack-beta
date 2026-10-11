import type { KpiSnapshotRow } from "~/lib/kpi-deltas";

/**
 * /dashboard API payload types shared by the dashboard view and its section
 * components. Shapes come from GET /api/v1/kpis/overview, /api/v1/cohorts,
 * /api/v1/kpis/districts and /api/v1/kpis/center-standing.
 */

export interface KPIData {
  trainees: { total: number; numerator: number; denominator: number };
  outcomeCoverage: { rate: number; numerator: number; denominator: number };
  verifiedEmployment: { rate: number; numerator: number; denominator: number };
  conflicts: { count: number };
  funnel: {
    certified: { count: number; label: string };
    outcomeKnown: { count: number; label: string };
    employed: { count: number; label: string };
    verified: { count: number; label: string };
  };
  followupResponseRate: { rate: number; numerator: number; denominator: number };
  /** Daily snapshot history (spec #80): oldest → newest, last row = today when present. */
  history?: KpiSnapshotRow[];
  recentActivity?: Array<{
    type: "FOLLOWUP" | "CLAIM" | "VERIFICATION";
    date: string;
    title: string;
    traineeName: string;
    traineePublicId: string;
  }>;
}

export interface Cohort {
  id: string;
  name: string;
  programme: { name: string };
  endDate: string;
  _count: { enrolments: number };
}

export interface DistrictPoint {
  district: string;
  count: number;
}

export interface DistrictsResponse {
  districts: DistrictPoint[];
}

/** Institute dashboard (INST-04): the center's standing from the scoring engine. */
export interface CenterStanding {
  centerName: string;
  rank: number;
  totalCenters: number;
  overallScore: number;
  placementScore: number;
  academicScore: number;
  volumeScore: number;
}

export interface InstituteCohort {
  id: string;
  name: string;
  programme: string;
  trainees: number;
  placementRate: number;
}

export interface StandingResponse {
  standing: CenterStanding | null;
  cohorts: InstituteCohort[];
}
