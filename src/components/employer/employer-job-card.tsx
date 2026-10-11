import type { ReactNode } from "react";
import { Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { StatusBadge } from "~/components/patterns/status-badge";
import { ConfirmDialog } from "~/components/patterns/confirm-dialog";
import { date } from "~/lib/format";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  SALARY_BAND_LABELS,
} from "~/lib/job-board-labels";
import type { EmployerJob } from "~/lib/job-board-contracts";

/**
 * One job posting row in the employer's list: title + StatusBadge, meta
 * lines, description and the Applicants / Close / Re-open actions. Closing
 * is confirmed inline (ConfirmDialog); the expanded applicants panel is
 * passed as children.
 */
export function EmployerJobCard({
  job,
  statusBusy,
  onToggleApplicants,
  onSetStatus,
  children,
}: {
  job: EmployerJob;
  statusBusy: boolean;
  onToggleApplicants: () => void;
  onSetStatus: (status: "OPEN" | "CLOSED") => void;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{job.title}</h3>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-body-sm text-muted-foreground mt-1">
            {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType} ·{" "}
            {WORK_MODE_LABELS[job.workMode] ?? job.workMode} · {job.district} ·{" "}
            {job.openings} opening{job.openings === 1 ? "" : "s"}
            {job.salaryBand
              ? ` · ${SALARY_BAND_LABELS[job.salaryBand] ?? job.salaryBand}`
              : ""}
          </p>
          <p className="text-caption text-muted-foreground mt-1">
            {job.applicationCount} application
            {job.applicationCount === 1 ? "" : "s"} · {job.hireCount} hired
            {job.applicationDeadline
              ? ` · applies by ${date(job.applicationDeadline)}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onToggleApplicants}
          >
            <Users />
            Applicants ({job.applicationCount})
          </Button>
          {job.status === "OPEN" ? (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" disabled={statusBusy}>
                  Close
                </Button>
              }
              title={`Close "${job.title}"?`}
              description="The job becomes hidden from trainees and stops accepting applications. You can re-open it any time."
              confirmLabel="Close job"
              onConfirm={() => onSetStatus("CLOSED")}
            />
          ) : (
            <Button
              size="sm"
              onClick={() => onSetStatus("OPEN")}
              disabled={statusBusy}
            >
              {statusBusy && "Re-opening…"}
              {!statusBusy && "Re-open"}
            </Button>
          )}
        </div>
      </div>
      <p className="text-body-sm text-muted-foreground">{job.description}</p>
      {children}
    </div>
  );
}
