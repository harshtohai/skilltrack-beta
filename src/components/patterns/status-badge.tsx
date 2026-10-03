import * as React from "react";

import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

/**
 * StatusBadge — the ONLY way to render statuses (design §4.10 / CL-12): dot +
 * text, same status = same color everywhere. Also maps the evidence ladder
 * (levels 0–5 + CONFLICT) used by the verification model.
 */

export type StatusKey =
  // outcome_status
  | "EMPLOYED" | "SELF_EMPLOYED" | "APPRENTICE" | "LOOKING" | "NOT_WORKING" | "UNKNOWN"
  // verification_status
  | "SELF_REPORTED" | "PROVIDER_CONFIRMED" | "EMPLOYER_CONFIRMED" | "DOCUMENT_VERIFIED" | "SYSTEM_VERIFIED" | "CONFLICT"
  // followups
  | "SCHEDULED" | "SENT" | "RESPONDED" | "FAILED" | "EXPIRED" | "NOT_TRIGGERED"
  // job_application_status
  | "APPLIED" | "SHORTLISTED" | "HIRED" | "REJECTED" | "WITHDRAWN"
  // job_posting_status
  | "OPEN" | "CLOSED"
  // employer_verification_status
  | "PENDING" | "VERIFIED" | "SUSPENDED"
  // generic
  | "GIVEN" | "PENDING_CONSENT"
  // enrolment lifecycle (INST-03)
  | "ACTIVE" | "DROPPED_OUT" | "COMPLETED";

const STATUS_MAP: Record<StatusKey, { label: string; badge: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  // outcomes — green = good (CL-24), red only for genuinely bad states
  EMPLOYED: { label: "Employed", badge: "success" },
  SELF_EMPLOYED: { label: "Self-employed", badge: "success" },
  APPRENTICE: { label: "Apprentice", badge: "info" },
  LOOKING: { label: "Looking", badge: "warning" },
  NOT_WORKING: { label: "Not working", badge: "danger" },
  UNKNOWN: { label: "Unknown", badge: "neutral" },
  // verification ladder
  SELF_REPORTED: { label: "Self-reported", badge: "info" },
  PROVIDER_CONFIRMED: { label: "Provider confirmed", badge: "info" },
  EMPLOYER_CONFIRMED: { label: "Employer confirmed", badge: "success" },
  DOCUMENT_VERIFIED: { label: "Document verified", badge: "success" },
  SYSTEM_VERIFIED: { label: "System verified", badge: "success" },
  CONFLICT: { label: "Conflict", badge: "danger" },
  // follow-ups
  SCHEDULED: { label: "Scheduled", badge: "neutral" },
  SENT: { label: "Sent", badge: "info" },
  RESPONDED: { label: "Responded", badge: "success" },
  FAILED: { label: "Failed", badge: "danger" },
  EXPIRED: { label: "Expired", badge: "warning" },
  NOT_TRIGGERED: { label: "Not triggered", badge: "neutral" },
  // applications
  APPLIED: { label: "Applied", badge: "neutral" },
  SHORTLISTED: { label: "Shortlisted", badge: "info" },
  HIRED: { label: "Hired", badge: "success" },
  REJECTED: { label: "Rejected", badge: "danger" },
  WITHDRAWN: { label: "Withdrawn", badge: "neutral" },
  // postings
  OPEN: { label: "Open", badge: "success" },
  CLOSED: { label: "Closed", badge: "neutral" },
  // employer verification
  PENDING: { label: "Pending", badge: "warning" },
  VERIFIED: { label: "Verified", badge: "success" },
  SUSPENDED: { label: "Suspended", badge: "danger" },
  // consent
  GIVEN: { label: "Given", badge: "success" },
  PENDING_CONSENT: { label: "Pending", badge: "warning" },
  // enrolment lifecycle — §4.10 map: Active → success, Dropped out → neutral, Completed → info
  ACTIVE: { label: "Active", badge: "success" },
  DROPPED_OUT: { label: "Dropped out", badge: "neutral" },
  COMPLETED: { label: "Completed", badge: "info" },
};

const BADGE_VARIANT = {
  success: "bg-success-soft text-success-text [&_.status-dot]:bg-success",
  warning: "bg-warning-soft text-warning-text [&_.status-dot]:bg-warning",
  danger: "bg-danger-soft text-danger-text [&_.status-dot]:bg-danger",
  info: "bg-info-soft text-info-text [&_.status-dot]:bg-info",
  neutral: "bg-muted text-muted-foreground [&_.status-dot]:bg-muted-foreground",
} as const;

const EVIDENCE_MAP: Record<number, { label: string; badge: keyof typeof BADGE_VARIANT }> = {
  0: { label: "Unknown", badge: "neutral" },
  1: { label: "Self-reported", badge: "info" },
  2: { label: "Provider confirmed", badge: "info" },
  3: { label: "Employer confirmed", badge: "success" },
  4: { label: "Document verified", badge: "success" },
  5: { label: "System verified", badge: "success" },
};

function StatusBadge({
  status,
  evidence,
  className,
}: {
  status?: StatusKey;
  /** Evidence level 0–5, or -1 sentinel for CONFLICT (handled via status). */
  evidence?: number;
  className?: string;
}) {
  const config = evidence !== undefined
    ? EVIDENCE_MAP[evidence] ?? EVIDENCE_MAP[0]
    : status
      ? STATUS_MAP[status]
      : null;
  if (!config) return null;
  return (
    <Badge variant="default" className={cn("px-2.5", BADGE_VARIANT[config.badge], className)}>
      <span className="status-dot size-1.5 shrink-0 rounded-full" aria-hidden />
      {config.label}
    </Badge>
  );
}

export { StatusBadge, STATUS_MAP, EVIDENCE_MAP };
