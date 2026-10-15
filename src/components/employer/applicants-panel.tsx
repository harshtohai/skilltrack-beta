"use client";

import { useState } from "react";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge } from "~/components/patterns/status-badge";
import { CertificatePreviewDialog } from "~/components/patterns/certificate-preview-dialog";
import { ApplicantActions } from "~/components/employer/applicant-actions";
import { date } from "~/lib/format";
import type { Applicant } from "~/lib/job-board-contracts";

/**
 * Applicants panel for one expanded job: loading skeletons, the empty note,
 * or the applicant rows with pipeline actions. Phone is masked until
 * shortlisted — contact reveal is symmetric (§4.10).
 */
export function ApplicantsPanel({
  applicants,
  loading,
  actionBusy,
  onAction,
  onReject,
}: {
  applicants: Applicant[];
  loading: boolean;
  actionBusy: string | null;
  onAction: (applicant: Applicant, action: "shortlist" | "hire") => void;
  onReject: (applicant: Applicant) => void;
}) {
  const [preview, setPreview] = useState<{ id: string; name: string } | null>(null);
  return (
    <div className="space-y-2 border-t pt-3">
      <p className="text-caption text-muted-foreground font-medium tracking-wide uppercase">
        Applicants
      </p>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        applicants.map((applicant) => (
          <div
            key={applicant.applicationId}
            className="bg-muted/50 space-y-2 rounded-md p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-body-sm font-medium">
                  {applicant.name}{" "}
                  <span className="text-caption text-muted-foreground font-mono">
                    {applicant.publicId}
                  </span>
                </p>
                <p className="text-caption text-muted-foreground">
                  {applicant.district}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={applicant.status} />
                <ApplicantActions
                  applicant={applicant}
                  actionBusy={actionBusy}
                  onAction={(action) => onAction(applicant, action)}
                  onReject={() => onReject(applicant)}
                />
              </div>
            </div>
            {(applicant.skills.length > 0 ||
              applicant.certificates.length > 0) && (
              <div className="text-caption text-muted-foreground space-y-1">
                {applicant.skills.length > 0 && (
                  <p>Skills: {applicant.skills.join(", ")}</p>
                )}
                {applicant.certificates.length > 0 && (
                  <div className="space-y-0.5">
                    {applicant.certificates.map((c) => (
                      <p key={c.id}>
                        <span className="font-medium text-foreground">{c.name}</span>{" "}
                        ({c.issuer} ·{" "}
                        {c.source === "ISSUED"
                          ? "institute-issued"
                          : "self-reported"}
                        )
                        {c.hasFile && (
                          <>
                            {" · "}
                            <button
                              type="button"
                              onClick={() => setPreview({ id: c.id, name: c.name })}
                              className="text-primary-strong hover:underline"
                            >
                              View file
                            </button>
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-caption text-muted-foreground">
              {applicant.phone ? (
                <span>
                  <span className="text-success-text font-medium">
                    Contact:
                  </span>{" "}
                  <span className="font-mono">{applicant.phone}</span>
                  {applicant.email ? ` · ${applicant.email}` : ""}
                </span>
              ) : (
                <span className="font-mono">
                  {applicant.phoneMasked}{" "}
                  <span className="font-normal">
                    · masked until shortlisted
                  </span>
                </span>
              )}
              <span> · applied {date(applicant.appliedAt)}</span>
            </p>
          </div>
        ))
      )}
      <CertificatePreviewDialog
        open={preview !== null}
        onOpenChange={(open) => !open && setPreview(null)}
        name={preview?.name ?? ""}
        fileSrc={preview ? `/api/v1/employer/certificates/${preview.id}/file` : ""}
      />
    </div>
  );
}
