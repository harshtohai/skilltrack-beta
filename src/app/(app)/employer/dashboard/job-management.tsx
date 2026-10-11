"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge } from "~/components/patterns/status-badge";
import { EmployerVerificationBanner } from "~/components/employer/verification-banner";
import { EmployerJobCard } from "~/components/employer/employer-job-card";
import { ApplicantsPanel } from "~/components/employer/applicants-panel";
import {
  RejectApplicantDialog,
  type RejectTarget,
} from "~/components/employer/reject-applicant-dialog";
import type {
  Applicant,
  EmployerJobsResponse,
  EmployerVerificationStatus,
} from "~/lib/job-board-contracts";

interface FeedbackState {
  jobId: string;
  message: string;
  ok: boolean;
}

/**
 * Employer job management (F25) per design §4.9/§4.10: verification banner
 * gate (PENDING/SUSPENDED/REJECTED see the banner only), job list with
 * StatusBadges, applicant panels and the shortlist/hire/reject pipeline.
 * Reject is destructive — confirmed with a dialog (CL-18); shortlist reveals
 * the contact once granted. Posting happens on the dedicated
 * /employer/dashboard/post-job page — this section keeps a single "Post Job"
 * button that navigates there.
 */
export function JobManagement() {
  const [data, setData] = useState<EmployerJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  // Applicants panels + pipeline actions
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({});
  const [applicantsLoading, setApplicantsLoading] = useState<string | null>(
    null,
  );
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setUnavailable(false);
    try {
      const res = await fetch("/api/v1/employer/jobs");
      if (res.status === 401) {
        setError("Employer session required — please sign in again");
        return;
      }
      if (!res.ok) {
        // 404 = no employer profile linked to this session (e.g. legacy demo login)
        setData(null);
        setUnavailable(res.status === 404);
        setError(
          res.status === 404
            ? "No employer profile is linked to this session — job posting is unavailable"
            : "Failed to load job postings",
        );
        return;
      }
      setData((await res.json()) as EmployerJobsResponse);
      setError("");
    } catch (err) {
      console.error("Employer jobs load error:", err);
      setUnavailable(false);
      setError("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const loadApplicants = useCallback(async (jobId: string) => {
    setApplicantsLoading(jobId);
    try {
      const res = await fetch(`/api/v1/employer/jobs/${jobId}/applicants`);
      if (!res.ok) throw new Error("Failed to load applicants");
      const json = (await res.json()) as { applicants: Applicant[] };
      setApplicants((prev) => ({ ...prev, [jobId]: json.applicants }));
    } catch (err) {
      console.error("Applicants load error:", err);
      setApplicants((prev) => ({ ...prev, [jobId]: [] }));
    } finally {
      setApplicantsLoading(null);
    }
  }, []);

  const toggleApplicants = (jobId: string) => {
    setFeedback(null);
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    if (!applicants[jobId]) void loadApplicants(jobId);
  };

  const setStatus = async (jobId: string, status: "OPEN" | "CLOSED") => {
    setActionBusy(`${jobId}:status`);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/employer/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to update job posting");
      }
      setFeedback({
        jobId,
        message: status === "CLOSED" ? "Job closed" : "Job re-opened",
        ok: true,
      });
      await loadJobs();
    } catch (err) {
      setFeedback({
        jobId,
        message:
          err instanceof Error ? err.message : "Failed to update job posting",
        ok: false,
      });
    } finally {
      setActionBusy(null);
    }
  };

  const applyAction = async (
    jobId: string,
    appId: string,
    action: "shortlist" | "hire" | "reject",
  ) => {
    setActionBusy(`${appId}:${action}`);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/v1/employer/jobs/${jobId}/applicants/${appId}/${action}`,
        {
          method: "POST",
        },
      );
      const json = (await res.json()) as {
        error?: { message?: string };
        application?: { id: string; status: string };
        jobClosed?: boolean;
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Action failed");
      const label =
        action === "shortlist"
          ? "Applicant shortlisted — contact revealed"
          : action === "hire"
            ? "Applicant hired"
            : "Applicant rejected";
      const closedNote = json.jobClosed
        ? " · job auto-closed (all openings filled)"
        : "";
      setFeedback({ jobId, message: `${label}${closedNote}`, ok: true });
      // Refetch applicants (status + contact reveal changed) and job counts.
      await Promise.all([loadApplicants(jobId), loadJobs()]);
    } catch (err) {
      setFeedback({
        jobId,
        message: err instanceof Error ? err.message : "Action failed",
        ok: false,
      });
    } finally {
      setActionBusy(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await applyAction(rejectTarget.jobId, rejectTarget.applicationId, "reject");
    setRejectTarget(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const verificationStatus: EmployerVerificationStatus | null =
    data?.employer.verificationStatus ?? null;

  if (!data || !verificationStatus) {
    // 404 (no employer profile linked) is a session-shape fact, not a failure
    // to retry — info banner. Everything else gets the retry pattern.
    if (unavailable) {
      return (
        <Alert variant="info">
          <AlertDescription>
            {error || "Job postings are unavailable for this session."}
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <ErrorState
        title="Couldn't load job postings"
        description={
          error || "The data didn't arrive. Check your connection and retry."
        }
        onRetry={() => void loadJobs()}
      />
    );
  }

  // The verification banner drives the whole section: PENDING/SUSPENDED/
  // REJECTED employers see no job management UI (shared with the post-job page).
  if (
    verificationStatus === "PENDING" ||
    verificationStatus === "SUSPENDED" ||
    verificationStatus === "REJECTED"
  ) {
    return <EmployerVerificationBanner status={verificationStatus} />;
  }

  const jobs = data.jobs;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {feedback && (
        <Alert variant={feedback.ok ? "success" : "destructive"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Job postings list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <CardTitle>Job postings</CardTitle>
            <StatusBadge status="VERIFIED" />
          </div>
          <Button asChild className="gap-2">
            <Link href="/employer/dashboard/post-job">
              <Plus />
              Post Job
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No jobs posted yet"
              description="Click Post Job above to post your first job — it goes live on the trainee job board."
            />
          ) : (
            jobs.map((job) => (
              <EmployerJobCard
                key={job.id}
                job={job}
                statusBusy={actionBusy === `${job.id}:status`}
                onToggleApplicants={() => toggleApplicants(job.id)}
                onSetStatus={(status) => void setStatus(job.id, status)}
              >
                {expandedJobId === job.id && (
                  <ApplicantsPanel
                    applicants={applicants[job.id] ?? []}
                    loading={applicantsLoading === job.id}
                    actionBusy={actionBusy}
                    onAction={(applicant, action) =>
                      void applyAction(job.id, applicant.applicationId, action)
                    }
                    onReject={(applicant) =>
                      setRejectTarget({
                        jobId: job.id,
                        applicationId: applicant.applicationId,
                        name: applicant.name,
                      })
                    }
                  />
                )}
              </EmployerJobCard>
            ))
          )}
        </CardContent>
      </Card>

      <RejectApplicantDialog
        target={rejectTarget}
        busy={
          rejectTarget !== null &&
          actionBusy === `${rejectTarget.applicationId}:reject`
        }
        onCancel={() => setRejectTarget(null)}
        onConfirm={() => void confirmReject()}
      />
    </div>
  );
}
