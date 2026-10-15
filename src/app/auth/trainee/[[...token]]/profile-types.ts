/**
 * API response shapes for the trainee magic-link verify endpoint
 * (POST /api/v1/auth/trainee/verify), shared by the page, the OTP recovery
 * form and the profile portal view.
 */

export interface TraineeProfile {
  id: string;
  publicId: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  district: string;
  language: string;
  consentGiven: boolean;
  consentGivenAt: string | null;
  consentMethod: string | null;
  certificates: Certificate[];
  training: TrainingRecord[];
  skills: SkillRecord[];
  employmentHistory: EmploymentHistory[];
  outcomeEvents: OutcomeEvent[];
  followupEvents: FollowupEvent[];
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  fileUrl: string | null;
  source: "SELF_REPORTED" | "ISSUED";
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
  hasFile: boolean;
}

export interface TrainingRecord {
  id: string;
  status: string;
  certificationDate: string | null;
  cohort: { id: string; name: string };
  programme: { id: string; name: string };
  trainingCenter: { id: string; name: string; district: string } | null;
}

export interface SkillRecord {
  skill: string;
  label: string;
  level: number;
  assessedAt: string;
}

export interface EmploymentHistory {
  id: string;
  employer: string;
  role: string;
  salaryBand: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface OutcomeEvent {
  id: string;
  checkpointDays: number;
  outcomeStatus: string;
  verificationStatus: string;
  source: string;
  evidenceLevel: number;
  createdAt: string;
  employmentClaim?: {
    employerName: string | null;
    role: string | null;
    salaryBand: string | null;
  } | null;
}

export interface FollowupEvent {
  id: string;
  checkpointDays: number;
  status: string;
  channel: string;
  sentAt: string | null;
  respondedAt: string | null;
}
