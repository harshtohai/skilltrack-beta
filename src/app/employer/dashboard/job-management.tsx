"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BadgeCheck, Loader2, Plus, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
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

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABELS);
const WORK_MODES = Object.keys(WORK_MODE_LABELS);
const SALARY_BANDS = Object.keys(SALARY_BAND_LABELS);

const emptyForm = {
  title: "",
  description: "",
  employmentType: "FULL_TIME",
  workMode: "ONSITE",
  salaryBand: "",
  district: "",
  skills: "",
  openings: "1",
  applicationDeadline: "",
};

interface FeedbackState {
  jobId: string;
  message: string;
  ok: boolean;
}

/**
 * Employer job management (F25): verification banner, job list with
 * applicant panels, create form and the shortlist/hire/reject pipeline.
 * PENDING/SUSPENDED/REJECTED employers see the banner only — no job UI.
 */
export function JobManagement() {
  const [data, setData] = useState<EmployerJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create-job form
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // Applicants panels + pipeline actions
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({});
  const [applicantsLoading, setApplicantsLoading] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/employer/jobs");
      if (res.status === 401) {
        setError("Employer session required — please sign in again");
        return;
      }
      if (!res.ok) {
        // 404 = no employer profile linked to this session (e.g. legacy demo login)
        setData(null);
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

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/v1/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          employmentType: form.employmentType,
          workMode: form.workMode,
          ...(form.salaryBand ? { salaryBand: form.salaryBand } : {}),
          district: form.district,
          skillsRequired: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          openings: form.openings,
          ...(form.applicationDeadline
            ? { applicationDeadline: new Date(form.applicationDeadline).toISOString() }
            : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to create job posting");
      }
      setForm(emptyForm);
      setFeedback({ jobId: "*", message: "Job posted", ok: true });
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job posting");
    } finally {
      setCreating(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const verificationStatus: EmployerVerificationStatus | null =
    data?.employer.verificationStatus ?? null;

  if (!data || !verificationStatus) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Job postings are unavailable for this session."}</AlertDescription>
      </Alert>
    );
  }

  // The verification banner drives the whole section: PENDING/SUSPENDED/
  // REJECTED employers see no job management UI.
  if (verificationStatus === "PENDING") {
    return (
      <Alert className="border-yellow-600 bg-yellow-50 [&>svg]:text-yellow-600">
        <AlertCircle className="h-4 w-4" />
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
        <AlertCircle className="h-4 w-4" />
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
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Registration rejected</AlertTitle>
        <AlertDescription>
          Your employer registration was not approved. Contact the skill mission team for details.
        </AlertDescription>
      </Alert>
    );
  }

  const jobs = data.jobs;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {feedback && (
        <Alert className={feedback.ok ? "border-green-600 bg-green-50 [&>svg]:text-green-600" : "border-destructive/50 text-destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Job postings list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Job Postings</CardTitle>
          <Badge variant="success" className="gap-1">
            <BadgeCheck className="h-3 w-3" /> Verified
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">
              No jobs posted yet — use the form below to post your first job.
            </p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <Badge variant={job.status === "OPEN" ? "success" : "secondary"}>{job.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType} ·{" "}
                      {WORK_MODE_LABELS[job.workMode] ?? job.workMode} · {job.district} ·{" "}
                      {job.openings} opening{job.openings === 1 ? "" : "s"}
                      {job.salaryBand ? ` · ${SALARY_BAND_LABELS[job.salaryBand] ?? job.salaryBand}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
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
                      <Users className="h-4 w-4" />
                      Applicants ({job.applicationCount})
                    </Button>
                    {job.status === "OPEN" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void setStatus(job.id, "CLOSED")}
                        disabled={actionBusy === `${job.id}:status`}
                      >
                        {actionBusy === `${job.id}:status` && <Loader2 className="h-4 w-4 animate-spin" />}
                        Close
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => void setStatus(job.id, "OPEN")}
                        disabled={actionBusy === `${job.id}:status`}
                      >
                        {actionBusy === `${job.id}:status` && <Loader2 className="h-4 w-4 animate-spin" />}
                        Re-open
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{job.description}</p>

                {expandedJobId === job.id && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applicants</p>
                    {applicantsLoading === job.id ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading applicants…
                      </div>
                    ) : (applicants[job.id]?.length ?? 0) === 0 ? (
                      <p className="text-sm text-gray-500">No applications yet.</p>
                    ) : (
                      (applicants[job.id] ?? []).map((applicant) => (
                        <div key={applicant.applicationId} className="rounded-md bg-muted/50 p-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {applicant.name}{" "}
                                <span className="font-mono text-xs text-gray-500">{applicant.publicId}</span>
                              </p>
                              <p className="text-xs text-gray-500">{applicant.district}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  applicant.status === "HIRED"
                                    ? "success"
                                    : applicant.status === "SHORTLISTED"
                                      ? "info"
                                      : applicant.status === "APPLIED"
                                        ? "default"
                                        : "secondary"
                                }
                              >
                                {applicant.status.replace(/_/g, " ").toLowerCase()}
                              </Badge>
                              {applicant.status === "APPLIED" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void applyAction(job.id, applicant.applicationId, "shortlist")}
                                    disabled={actionBusy === `${applicant.applicationId}:shortlist`}
                                  >
                                    {actionBusy === `${applicant.applicationId}:shortlist` && (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Shortlist
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => void applyAction(job.id, applicant.applicationId, "reject")}
                                    disabled={actionBusy === `${applicant.applicationId}:reject`}
                                  >
                                    {actionBusy === `${applicant.applicationId}:reject` && (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
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
                                    {actionBusy === `${applicant.applicationId}:hire` && (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Hire
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => void applyAction(job.id, applicant.applicationId, "reject")}
                                    disabled={actionBusy === `${applicant.applicationId}:reject`}
                                  >
                                    {actionBusy === `${applicant.applicationId}:reject` && (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {(applicant.skills.length > 0 || applicant.certificates.length > 0) && (
                            <div className="text-xs text-gray-600 space-y-1">
                              {applicant.skills.length > 0 && <p>Skills: {applicant.skills.join(", ")}</p>}
                              {applicant.certificates.length > 0 && (
                                <p>
                                  Certificates:{" "}
                                  {applicant.certificates.map((c) => `${c.name} (${c.issuer})`).join(", ")}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {applicant.phone ? (
                              <span>
                                <span className="font-medium text-green-700">Contact:</span>{" "}
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

      {/* Create job form */}
      <Card>
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. CNC Machine Operator"
                maxLength={120}
                disabled={creating}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Role, responsibilities, requirements…"
                maxLength={5000}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                <SelectTrigger className="w-full" disabled={creating}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t] ?? t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select value={form.workMode} onValueChange={(v) => setForm({ ...form, workMode: v })}>
                <SelectTrigger className="w-full" disabled={creating}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODES.map((m) => (
                    <SelectItem key={m} value={m}>{WORK_MODE_LABELS[m] ?? m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salary Band</Label>
              <Select
                value={form.salaryBand || "none"}
                onValueChange={(v) => setForm({ ...form, salaryBand: v === "none" ? "" : v })}
              >
                <SelectTrigger className="w-full" disabled={creating}>
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {SALARY_BANDS.map((b) => (
                    <SelectItem key={b} value={b}>{SALARY_BAND_LABELS[b] ?? b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                <SelectTrigger className="w-full" disabled={creating}>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-skills">Skills Required</Label>
              <Input
                id="job-skills"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Comma-separated, e.g. Welding, CNC, Safety"
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-openings">Openings</Label>
              <Input
                id="job-openings"
                type="number"
                min={1}
                max={100}
                value={form.openings}
                onChange={(e) => setForm({ ...form, openings: e.target.value })}
                disabled={creating}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="job-deadline">Application Deadline (optional)</Label>
              <Input
                id="job-deadline"
                type="date"
                value={form.applicationDeadline}
                onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                disabled={creating}
              />
            </div>
          </div>
          <Button
            className="gap-2"
            onClick={() => void handleCreate()}
            disabled={
              creating ||
              form.title.trim().length < 3 ||
              form.description.trim().length < 10 ||
              !form.district ||
              form.skills.split(",").filter((s) => s.trim()).length === 0
            }
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {creating ? "Posting…" : "Post Job"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
