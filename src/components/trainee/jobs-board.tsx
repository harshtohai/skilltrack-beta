"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Calendar,
  Check,
  Copy,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  SearchX,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { date } from "~/lib/format";
import { FilterBar } from "~/components/patterns/filter-bar";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { matchesFilters, type JobFilter } from "~/server/job-relevance";
import type { MyApplication, PublicJob, TraineeJobsResponse, MyApplicationsResponse } from "~/lib/job-board-contracts";

// Human labels for the job board (mirrors the employer dashboard)
const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const APPLICATION_STATUS_VARIANTS: Record<string, "info" | "warning" | "success" | "destructive" | "secondary"> = {
  APPLIED: "info",
  SHORTLISTED: "warning",
  HIRED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "secondary",
};

const REASON_OPTIONS = [
  { value: "NO_JOBS", label: "No jobs nearby" },
  { value: "SKILLS_MISMATCH", label: "Skills mismatch" },
  { value: "FAMILY", label: "Family reasons" },
  { value: "HEALTH", label: "Health reasons" },
  { value: "OTHER", label: "Other" },
] as const;

function JobCard({ job, applying, onApply }: { job: PublicJob; applying: boolean; onApply: (jobId: string) => void }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>{job.title}</CardTitle>
            <div className="mt-1 flex items-center gap-2 text-body-sm text-muted-foreground">
              <span className="truncate">{job.companyName}</span>
              {job.employerVerified && (
                <Badge variant="success" className="gap-1 text-caption">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
          </div>
          {job.applied && <Badge variant="info">Applied</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {job.salaryBand && (
            <Badge variant="secondary">{SALARY_BAND_LABELS[job.salaryBand] ?? job.salaryBand}</Badge>
          )}
          <Badge variant="outline">{WORK_MODE_LABELS[job.workMode] ?? job.workMode}</Badge>
          <Badge variant="outline">{EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}</Badge>
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" /> {job.district}
          </Badge>
          <Badge variant="outline">
            {job.openings} opening{job.openings > 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-caption text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {job.applicationDeadline
            ? `Apply by ${date(job.applicationDeadline)}`
            : "Rolling applications"}
        </div>

        {job.retention.hires > 0 && (
          <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {job.retention.hires} hires ·{" "}
            {job.retention.retainedPct !== null
              ? `${job.retention.retainedPct}% retained 90d`
              : "retention data pending"}
          </div>
        )}

        {job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-caption font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
            Details
          </Button>
          <Button
            size="sm"
            disabled={job.applied || applying}
            onClick={() => onApply(job.id)}
          >
            {applying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : job.applied ? (
              <Check className="h-4 w-4" />
            ) : null}
            {job.applied ? "Applied" : "Apply"}
          </Button>
        </div>
      </CardContent>

      {/* Detail expansion: full description + skills (payload already carries them) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{job.title}</DialogTitle>
            <DialogDescription>
              {job.companyName} · {job.district} ·{" "}
              {job.applicationDeadline
                ? `Apply by ${date(job.applicationDeadline)}`
                : "Rolling applications"}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-body-sm">{job.description}</p>
          {job.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skillsRequired.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-caption font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ApplicationRow({
  app,
  onWithdraw,
  copied,
  onCopy,
}: {
  app: MyApplication;
  onWithdraw: (app: MyApplication) => void;
  copied: boolean;
  onCopy: (email: string) => void;
}) {
  const email = app.employerContactEmail;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-body-sm font-medium">{app.jobTitle}</p>
            <p className="text-caption text-muted-foreground">
              {app.companyName} · {app.district}
            </p>
            <p className="mt-1 text-caption text-muted-foreground">
              Applied {date(app.appliedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={APPLICATION_STATUS_VARIANTS[app.status] ?? "secondary"}>
              {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
            </Badge>
            {(app.status === "APPLIED" || app.status === "SHORTLISTED") && (
              <Button variant="outline" size="sm" onClick={() => onWithdraw(app)}>
                Withdraw
              </Button>
            )}
          </div>
        </div>

        {/* Symmetric contact reveal: email only once SHORTLISTED */}
        {email && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
            <div className="flex items-center gap-2 text-caption text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="font-mono">{email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-caption"
              onClick={() => onCopy(email)}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success-text" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobsBoardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export function TraineeJobsBoard() {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<MyApplication | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [signalOpen, setSignalOpen] = useState(false);
  const [signalReason, setSignalReason] = useState("");
  const [signaling, setSignaling] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilter>({ district: "", workMode: "", employmentType: "" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        fetch("/api/v1/trainee/jobs"),
        fetch("/api/v1/trainee/applications"),
      ]);
      if (!jobsRes.ok || !applicationsRes.ok) throw new Error("Failed to load jobs");
      const jobsData = (await jobsRes.json()) as TraineeJobsResponse;
      const applicationsData = (await applicationsRes.json()) as MyApplicationsResponse;
      setJobs(jobsData.jobs);
      setApplications(applicationsData.applications);
      setError(null);
    } catch (err) {
      console.error("Jobs board load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleApply = async (jobId: string) => {
    if (applyingId) return;
    setApplyingId(jobId);
    try {
      const res = await fetch(`/api/v1/trainee/jobs/${jobId}/apply`, { method: "POST" });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, applied: true, appliedAt: new Date().toISOString() } : j
          )
        );
        toast.success("Application sent", { description: "The employer can now see your profile." });
      } else {
        const json = (await res.json()) as { error?: { code?: string; message?: string } };
        if (json.error?.code === "DUPLICATE_APPLICATION") {
          toast("Already applied", { description: "You have already applied to this job." });
        } else {
          toast.error("Could not apply", {
            description: json.error?.message ?? "Something went wrong",
          });
        }
      }
    } catch {
      toast.error("Could not apply", { description: "Something went wrong" });
    } finally {
      setApplyingId(null);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget || withdrawing) return;
    setWithdrawing(true);
    try {
      const res = await fetch(`/api/v1/trainee/applications/${withdrawTarget.id}/withdraw`, {
        method: "POST",
      });
      if (res.ok) {
        const withdrawn = withdrawTarget;
        setApplications((prev) =>
          prev.map((a) => (a.id === withdrawn.id ? { ...a, status: "WITHDRAWN" as const } : a))
        );
        // WITHDRAWN does not count as applied — the trainee can re-apply.
        setJobs((prev) =>
          prev.map((j) =>
            j.id === withdrawn.jobPostingId ? { ...j, applied: false, appliedAt: null } : j
          )
        );
        toast.success("Application withdrawn");
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        toast.error("Could not withdraw", {
          description: json.error?.message ?? "Something went wrong",
        });
      }
    } catch {
      toast.error("Could not withdraw", { description: "Something went wrong" });
    } finally {
      setWithdrawing(false);
      setWithdrawTarget(null);
    }
  };

  const handleSignal = async () => {
    if (!signalReason || signaling) return;
    setSignaling(true);
    try {
      const res = await fetch("/api/v1/trainee/job-seek-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: signalReason }),
      });
      if (res.ok) {
        toast.success("Signal recorded — thank you");
        setSignalOpen(false);
        setSignalReason("");
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        toast.error("Could not record signal", {
          description: json.error?.message ?? "Something went wrong",
        });
      }
    } catch {
      toast.error("Could not record signal", { description: "Something went wrong" });
    } finally {
      setSignaling(false);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      toast.error("Could not copy email", { description: "Copy it manually instead." });
    }
  };

  const districtOptions = [...new Set(jobs.map((j) => j.district))].sort();
  const filteredJobs = jobs.filter((j) => matchesFilters(j, filters));
  const filtersActive =
    filters.district !== "" || filters.workMode !== "" || filters.employmentType !== "";

  const openSignal = () => {
    setSignalReason("");
    setSignalOpen(true);
  };

  if (loading && jobs.length === 0 && applications.length === 0) {
    return <JobsBoardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load jobs"
        description="The board didn't arrive. Check your connection and retry."
        onRetry={() => void fetchAll()}
      />
    );
  }

  return (
    <div className="mb-8">
      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          {/* Client-side filters — no refetch (§9.4 toolbar row) */}
          <FilterBar className="mb-4" onClear={filtersActive ? () => setFilters({ district: "", workMode: "", employmentType: "" }) : undefined}>
            <Select
              value={filters.district === "" ? "all" : filters.district}
              onValueChange={(v) => setFilters((f) => ({ ...f, district: v === "all" ? "" : v }))}
            >
              <SelectTrigger aria-label="District">
                <SelectValue placeholder="All districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {districtOptions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.workMode === "" ? "all" : filters.workMode}
              onValueChange={(v) => setFilters((f) => ({ ...f, workMode: v === "all" ? "" : v }))}
            >
              <SelectTrigger aria-label="Work mode">
                <SelectValue placeholder="All work modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All work modes</SelectItem>
                <SelectItem value="ONSITE">Onsite</SelectItem>
                <SelectItem value="REMOTE">Remote</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.employmentType === "" ? "all" : filters.employmentType}
              onValueChange={(v) => setFilters((f) => ({ ...f, employmentType: v === "all" ? "" : v }))}
            >
              <SelectTrigger aria-label="Employment type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterBar>

          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={jobs.length === 0 ? <Briefcase /> : <SearchX />}
              title={jobs.length === 0 ? "No open jobs right now" : "No jobs match your filters"}
              description={
                jobs.length === 0
                  ? "New jobs appear here as employers post them."
                  : "Try widening your filters to see more openings."
              }
              action={
                jobs.length === 0 ? (
                  <Button variant="outline" size="sm" onClick={openSignal} className="gap-2">
                    <HelpCircle className="h-4 w-4" /> {`Can't find a job?`}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ district: "", workMode: "", employmentType: "" })}
                  >
                    Clear all filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  applying={applyingId === job.id}
                  onApply={(jobId) => void handleApply(jobId)}
                />
              ))}
            </div>
          )}

          {jobs.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={openSignal} className="gap-2">
                <HelpCircle className="h-4 w-4" /> {`Can't find a job?`}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications">
          {applications.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No applications yet"
              description="Apply to a job and it will show up here."
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  onWithdraw={setWithdrawTarget}
                  copied={copiedEmail === app.employerContactEmail}
                  onCopy={(email) => void copyEmail(email)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Withdraw confirm step */}
      <AlertDialog
        open={withdrawTarget !== null}
        onOpenChange={(open) => {
          if (!open) setWithdrawTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw application?</AlertDialogTitle>
            <AlertDialogDescription>
              You will stop being considered for {withdrawTarget?.jobTitle} at{" "}
              {withdrawTarget?.companyName}. You can apply again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={withdrawing}
              onClick={(e) => {
                e.preventDefault();
                void handleWithdraw();
              }}
            >
              {withdrawing && <Loader2 className="h-4 w-4 animate-spin" />}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Can't-find-a-job signal */}
      <Dialog open={signalOpen} onOpenChange={setSignalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Can't find a job?`}</DialogTitle>
            <DialogDescription>
              Tell us why — this helps us bring more jobs to your district.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {REASON_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSignalReason(r.value)}
                className={`w-full rounded-md border p-3 text-left text-body-sm transition-colors ${
                  signalReason === r.value
                    ? "border-primary bg-primary-soft font-medium"
                    : "hover:bg-muted/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!signalReason || signaling} onClick={() => void handleSignal()}>
              {signaling && <Loader2 className="h-4 w-4 animate-spin" />}
              Send signal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
