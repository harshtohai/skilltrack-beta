"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge } from "~/components/patterns/status-badge";
import type {
  Applicant,
  EmployerJobsResponse,
  EmployerVerificationStatus,
} from "~/lib/job-board-contracts";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

interface FeedbackState {
  jobId: string;
  message: string;
  ok: boolean;
}

interface RejectTarget {
  jobId: string;
  applicationId: string;
  name: string;
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
  const [applicantsLoading, setApplicantsLoading] = useState<string | null>(null);
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
            : "Failed to load job postings"
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
      setFeedback({ jobId, message: status === "CLOSED" ? "Job closed" : "Job re-opened", ok: true });
      await loadJobs();
    } catch (err) {
      setFeedback({
        jobId,
        message: err instanceof Error ? err.message : "Failed to update job posting",
        ok: false,
      });
    } finally {
      setActionBusy(null);
    }
  };

  const applyAction = async (
    jobId: string,
    appId: string,
    action: "shortlist" | "hire" | "reject"
  ) => {
    setActionBusy(`${appId}:${action}`);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/employer/jobs/${jobId}/applicants/${appId}/${action}`, {
        method: "POST",
      });
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
      const closedNote = json.jobClosed ? " · job auto-closed (all openings filled)" : "";
      setFeedback({ jobId, message: `${label}${closedNote}`, ok: true });
      // Refetch applicants (status + contact reveal changed) and job counts.
      await Promise.all([loadApplicants(jobId), loadJobs()]);
    } catch (err) {
      setFeedback({ jobId, message: err instanceof Error ? err.message : "Action failed", ok: false });
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
          <AlertDescription>{error || "Job postings are unavailable for this session."}</AlertDescription>
        </Alert>
      );
    }
    return (
      <ErrorState
        title="Couldn't load job postings"
        description={error || "The data didn't arrive. Check your connection and retry."}
        onRetry={() => void loadJobs()}
      />
    );
  }

  // The verification banner drives the whole section: PENDING/SUSPENDED/
  // REJECTED employers see no job management UI.
  if (verificationStatus === "PENDING") {
    return (
      <Alert variant="warning">
        <AlertTitle>Verification pending</AlertTitle>
        <AlertDescription>
          Your registration is under review. You can log in, and will be able to post jobs once an
          admin verifies your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (verificationStatus === "SUSPENDED") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Account suspended</AlertTitle>
        <AlertDescription>
          Job posting is disabled. Contact the skill mission team to reinstate your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (verificationStatus === "REJECTED") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Registration rejected</AlertTitle>
        <AlertDescription>
          Your employer registration was not approved. Contact the skill mission team for details.
        </AlertDescription>
      </Alert>
    );
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
              <div key={job.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType} ·{" "}
                      {WORK_MODE_LABELS[job.workMode] ?? job.workMode} · {job.district} ·{" "}
                      {job.openings} opening{job.openings === 1 ? "" : "s"}
                      {job.salaryBand ? ` · ${SALARY_BAND_LABELS[job.salaryBand] ?? job.salaryBand}` : ""}
                    </p>
                    <p className="mt-1 text-caption text-muted-foreground">
                      {job.applicationCount} application{job.applicationCount === 1 ? "" : "s"} ·{" "}
                      {job.hireCount} hired
                      {job.applicationDeadline
                        ? ` · applies by ${new Date(job.applicationDeadline).toLocaleDateString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => toggleApplicants(job.id)}
                    >
                      <Users />
                      Applicants ({job.applicationCount})
                    </Button>
                    {job.status === "OPEN" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void setStatus(job.id, "CLOSED")}
                        disabled={actionBusy === `${job.id}:status`}
                      >
                        {actionBusy === `${job.id}:status` && "Closing…"}
                        {actionBusy !== `${job.id}:status` && "Close"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => void setStatus(job.id, "OPEN")}
                        disabled={actionBusy === `${job.id}:status`}
                      >
                        {actionBusy === `${job.id}:status` && "Re-opening…"}
                        {actionBusy !== `${job.id}:status` && "Re-open"}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-body-sm text-muted-foreground">{job.description}</p>

                {expandedJobId === job.id && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
                      Applicants
                    </p>
                    {applicantsLoading === job.id ? (
                      <div className="space-y-2">
                        {Array.from({ length: 2 }, (_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (applicants[job.id]?.length ?? 0) === 0 ? (
                      <p className="text-body-sm text-muted-foreground">No applications yet.</p>
                    ) : (
                      (applicants[job.id] ?? []).map((applicant) => (
                        <div key={applicant.applicationId} className="rounded-md bg-muted/50 p-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-body-sm font-medium">
                                {applicant.name}{" "}
                                <span className="font-mono text-caption text-muted-foreground">{applicant.publicId}</span>
                              </p>
                              <p className="text-caption text-muted-foreground">{applicant.district}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={applicant.status} />
                              {applicant.status === "APPLIED" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void applyAction(job.id, applicant.applicationId, "shortlist")}
                                    disabled={actionBusy === `${applicant.applicationId}:shortlist`}
                                  >
                                    {actionBusy === `${applicant.applicationId}:shortlist` && "Shortlisting…"}
                                    {actionBusy !== `${applicant.applicationId}:shortlist` && "Shortlist"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive text-danger-text hover:bg-danger-soft"
                                    onClick={() =>
                                      setRejectTarget({
                                        jobId: job.id,
                                        applicationId: applicant.applicationId,
                                        name: applicant.name,
                                      })
                                    }
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
                                    onClick={() => void applyAction(job.id, applicant.applicationId, "hire")}
                                    disabled={actionBusy === `${applicant.applicationId}:hire`}
                                  >
                                    {actionBusy === `${applicant.applicationId}:hire` && "Hiring…"}
                                    {actionBusy !== `${applicant.applicationId}:hire` && "Hire"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive text-danger-text hover:bg-danger-soft"
                                    onClick={() =>
                                      setRejectTarget({
                                        jobId: job.id,
                                        applicationId: applicant.applicationId,
                                        name: applicant.name,
                                      })
                                    }
                                    disabled={actionBusy === `${applicant.applicationId}:reject`}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {(applicant.skills.length > 0 || applicant.certificates.length > 0) && (
                            <div className="text-caption text-muted-foreground space-y-1">
                              {applicant.skills.length > 0 && <p>Skills: {applicant.skills.join(", ")}</p>}
                              {applicant.certificates.length > 0 && (
                                <p>
                                  Certificates:{" "}
                                  {applicant.certificates.map((c) => `${c.name} (${c.issuer})`).join(", ")}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-caption text-muted-foreground">
                            {applicant.phone ? (
                              <span>
                                <span className="font-medium text-success-text">Contact:</span>{" "}
                                <span className="font-mono">{applicant.phone}</span>
                                {applicant.email ? ` · ${applicant.email}` : ""}
                              </span>
                            ) : (
                              <span className="font-mono">
                                {applicant.phoneMasked}{" "}
                                <span className="font-normal">· masked until shortlisted</span>
                              </span>
                            )}
                            <span> · applied {new Date(applicant.appliedAt).toLocaleDateString("en-IN")}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Reject is destructive — confirmed with the object + consequence named (CL-18) */}
      <Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.name}?</DialogTitle>
            <DialogDescription>
              Their application will be marked rejected and they will no longer be considered for
              this opening. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={rejectTarget !== null && actionBusy === `${rejectTarget.applicationId}:reject`}
              onClick={() => void confirmReject()}
            >
              {rejectTarget !== null && actionBusy === `${rejectTarget.applicationId}:reject`
                ? "Rejecting…"
                : "Reject applicant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
