// Application state machine (F25 employer pipeline):
// APPLIED → SHORTLISTED → HIRED, with direct APPLIED → REJECTED allowed so a
// crowded pipeline stays clean. HIRED and WITHDRAWN are terminal — the
// employer actions can never leave those states. Status literals mirror
// jobApplicationStatusSchema (parity pinned by job-board-contracts.test.ts);
// kept local + import-free so this stays unit-testable.

export type ApplicationActionStatus = "APPLIED" | "SHORTLISTED" | "HIRED" | "REJECTED" | "WITHDRAWN";

export type ApplicationAction = "shortlist" | "hire" | "reject";

const ALLOWED_TRANSITIONS: Record<ApplicationAction, readonly ApplicationActionStatus[]> = {
  shortlist: ["APPLIED"],
  hire: ["SHORTLISTED"],
  // Direct rejection from APPLIED keeps the pipeline clean.
  reject: ["APPLIED", "SHORTLISTED"],
};

/** Whether the employer action is valid from the application's current status. */
export function canApplyAction(current: ApplicationActionStatus, action: ApplicationAction): boolean {
  return ALLOWED_TRANSITIONS[action].includes(current);
}
