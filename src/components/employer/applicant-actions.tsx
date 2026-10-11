import { Button } from "~/components/ui/button";
import type { Applicant } from "~/lib/job-board-contracts";

/**
 * Pipeline action buttons for one applicant row. Busy labels mirror the
 * in-flight action ("Shortlisting…", "Hiring…"); reject is destructive-
 * styled and confirmed upstream with a dialog (CL-18).
 */
export function ApplicantActions({
  applicant,
  actionBusy,
  onAction,
  onReject,
}: {
  applicant: Applicant;
  actionBusy: string | null;
  onAction: (action: "shortlist" | "hire") => void;
  onReject: () => void;
}) {
  return (
    <>
      {applicant.status === "APPLIED" && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("shortlist")}
            disabled={actionBusy === `${applicant.applicationId}:shortlist`}
          >
            {actionBusy === `${applicant.applicationId}:shortlist` &&
              "Shortlisting…"}
            {actionBusy !== `${applicant.applicationId}:shortlist` &&
              "Shortlist"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-danger-text hover:bg-danger-soft"
            onClick={onReject}
            disabled={actionBusy === `${applicant.applicationId}:reject`}
          >
            Reject
          </Button>
        </>
      )}
      {applicant.status === "SHORTLISTED" && (
        <>
          <Button
            size="sm"
            onClick={() => onAction("hire")}
            disabled={actionBusy === `${applicant.applicationId}:hire`}
          >
            {actionBusy === `${applicant.applicationId}:hire` && "Hiring…"}
            {actionBusy !== `${applicant.applicationId}:hire` && "Hire"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-danger-text hover:bg-danger-soft"
            onClick={onReject}
            disabled={actionBusy === `${applicant.applicationId}:reject`}
          >
            Reject
          </Button>
        </>
      )}
    </>
  );
}
