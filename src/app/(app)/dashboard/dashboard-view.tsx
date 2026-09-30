"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Calendar,
  Check,
  Copy,
  GraduationCap,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  RotateCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { toast } from "~/hooks/use-toast";
import { formatDate, formatDateTime } from "~/lib/utils";
import { compact, number, percent, date as fmtDate } from "~/lib/format";
import { PageHeader } from "~/components/patterns/page-header";
import { StatCard } from "~/components/patterns/stat-card";
import { DataTable, rowActionsColumn } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { matchesFilters, type JobFilter } from "~/server/job-relevance";
import type { MyApplication, PublicJob, TraineeJobsResponse, MyApplicationsResponse } from "~/lib/job-board-contracts";

interface KPIData {
  trainees: { total: number; numerator: number; denominator: number };
  outcomeCoverage: { rate: number; numerator: number; denominator: number };
  verifiedEmployment: { rate: number; numerator: number; denominator: number };
  conflicts: { count: number };
  funnel: {
    certified: { count: number; label: string };
    outcomeKnown: { count: number; label: string };
    employed: { count: number; label: string };
    verified: { count: number; label: string };
  };
  followupResponseRate: { rate: number; numerator: number; denominator: number };
  recentActivity?: Array<{
    type: "FOLLOWUP" | "CLAIM" | "VERIFICATION";
    date: string;
    title: string;
    traineeName: string;
    traineePublicId: string;
  }>;
}

interface Cohort {
  id: string;
  name: string;
  programme: { name: string };
  endDate: string;
  _count: { enrolments: number };
}

interface DistrictPoint {
  district: string;
  count: number;
}

interface DistrictsResponse {
  districts: DistrictPoint[];
}

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

/** Relative time for the "Last updated" caption (§9.1); absolute past 24h. */
function timeAgo(d: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return fmtDate(d);
}

function welcomeTitle(userName: string): string {
  return userName.trim() !== "" ? `Welcome back, ${userName}` : "Welcome back";
}

function JobCard({ job, applying, onApply }: { job: PublicJob; applying: boolean; onApply: (jobId: string) => void }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{job.title}</CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{job.companyName}</span>
              {job.employerVerified && (
                <Badge variant="success" className="gap-1 text-xs">
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {job.applicationDeadline
            ? `Apply by ${formatDate(new Date(job.applicationDeadline))}`
            : "Rolling applications"}
        </div>

        {job.retention.hires > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
              <Badge key={skill} variant="secondary" className="text-xs font-normal">
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
                ? `Apply by ${formatDate(new Date(job.applicationDeadline))}`
                : "Rolling applications"}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{job.description}</p>
          {job.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skillsRequired.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-normal">
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
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{app.jobTitle}</p>
            <p className="text-xs text-muted-foreground">
              {app.companyName} · {app.district}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Applied {formatDate(new Date(app.appliedAt))}
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="font-mono">{email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onCopy(email)}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
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

function TraineeJobsBoard() {
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
        toast({
          title: "Application sent",
          description: "The employer can now see your profile.",
          variant: "success",
        });
      } else {
        const json = (await res.json()) as { error?: { code?: string; message?: string } };
        if (json.error?.code === "DUPLICATE_APPLICATION") {
          toast({
            title: "Already applied",
            description: "You have already applied to this job.",
          });
        } else {
          toast({
            title: "Could not apply",
            description: json.error?.message ?? "Something went wrong",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Could not apply",
        description: "Something went wrong",
        variant: "destructive",
      });
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
        toast({ title: "Application withdrawn", variant: "success" });
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        toast({
          title: "Could not withdraw",
          description: json.error?.message ?? "Something went wrong",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Could not withdraw",
        description: "Something went wrong",
        variant: "destructive",
      });
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
        toast({ title: "Signal recorded — thank you", variant: "success" });
        setSignalOpen(false);
        setSignalReason("");
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        toast({
          title: "Could not record signal",
          description: json.error?.message ?? "Something went wrong",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Could not record signal",
        description: "Something went wrong",
        variant: "destructive",
      });
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
      toast({
        title: "Could not copy email",
        description: "Copy it manually instead.",
        variant: "destructive",
      });
    }
  };

  const districtOptions = [...new Set(jobs.map((j) => j.district))].sort();
  const filteredJobs = jobs.filter((j) => matchesFilters(j, filters));
  const filtersActive =
    filters.district !== "" || filters.workMode !== "" || filters.employmentType !== "";

  if (loading && jobs.length === 0 && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-md border border-destructive/50 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={() => void fetchAll()} className="mt-2 text-sm text-primary hover:underline">
          Retry
        </button>
      </div>
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
          {/* Client-side filters — no refetch */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Select
              value={filters.district === "" ? "all" : filters.district}
              onValueChange={(v) => setFilters((f) => ({ ...f, district: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="w-[170px]">
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
              <SelectTrigger className="w-[150px]">
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtersActive && (
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setFilters({ district: "", workMode: "", employmentType: "" })}
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
              {jobs.length === 0 ? "No open jobs right now" : "No jobs match your filters"}
            </div>
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

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setSignalReason("");
                setSignalOpen(true);
              }}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" /> {`Can't find a job?`}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          {applications.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
              No applications yet
            </div>
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
      <Dialog
        open={withdrawTarget !== null}
        onOpenChange={(open) => {
          if (!open) setWithdrawTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw application?</DialogTitle>
            <DialogDescription>
              You will stop being considered for {withdrawTarget?.jobTitle} at{" "}
              {withdrawTarget?.companyName}. You can apply again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={withdrawing} onClick={() => void handleWithdraw()}>
              {withdrawing && <Loader2 className="h-4 w-4 animate-spin" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                  signalReason === r.value
                    ? "border-primary bg-primary/10 font-medium"
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

/* ------------------------------------------------------------------ */
/* Admin / institute KPI view (§9.1)                                   */
/* ------------------------------------------------------------------ */

interface FunnelStage {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FUNNEL_STAGES: FunnelStage[] = [
  { key: "certified", label: "Certified", icon: GraduationCap },
  { key: "outcomeKnown", label: "Outcome known", icon: TrendingUp },
  { key: "employed", label: "Employed", icon: Briefcase },
  { key: "verified", label: "Verified", icon: BadgeCheck },
];

function FunnelCard({ funnel, className }: { funnel: KPIData["funnel"]; className?: string }) {
  function getStageData(key: string): { count: number; label: string } {
    const funnelMap = funnel as Record<string, { count: number; label: string }>;
    return funnelMap[key] ?? { count: 0, label: "" };
  }

  const counts = FUNNEL_STAGES.map((s) => getStageData(s.key).count);
  const allZero = counts.every((c) => c === 0);
  const maxCount = Math.max(...counts);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Outcome funnel</CardTitle>
        <CardDescription>Certified trainees progressing to verified employment.</CardDescription>
      </CardHeader>
      <CardContent>
        {allZero ? (
          <EmptyState
            icon={<TrendingUp />}
            title="No outcome data yet"
            description="Stages fill in as trainees are certified and outcomes are recorded."
          />
        ) : (
          <div className="space-y-4">
            {FUNNEL_STAGES.map((stage, index) => {
              const data = getStageData(stage.key);
              const Icon = stage.icon;
              const width = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
              const prevCount = index >= 1 ? counts[index - 1]! : 0;
              const dropOff =
                prevCount > 0 ? Math.round(((prevCount - data.count) / prevCount) * 100) : 0;

              return (
                <div key={stage.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{number(data.count)}</span>
                      {dropOff > 0 && (
                        <Badge variant="secondary" className="text-caption">
                          -{dropOff}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-chart-1 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const MAX_DISTRICT_BARS = 8;

function DistrictCard({ districts, className }: { districts: DistrictPoint[]; className?: string }) {
  const shown = districts.slice(0, MAX_DISTRICT_BARS);
  const max = Math.max(...shown.map((d) => d.count), 1);
  const total = districts.reduce((sum, d) => sum + d.count, 0);
  const avg = districts.length > 0 ? Math.round(total / districts.length) : 0;
  const top = districts[0];

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>District distribution</CardTitle>
          <CardDescription>Trainees by district.</CardDescription>
        </div>
        <Button variant="ghost" size="icon-xs" asChild aria-label="Open trainees">
          <Link href="/trainees">
            <ArrowUpRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <EmptyState
            icon={<MapPin />}
            title="No district data"
            description="Districts appear once trainees are added."
          />
        ) : (
          <div className="space-y-3">
            {shown.map((d) => (
              <div key={d.district} className="space-y-1">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="truncate font-medium">{d.district}</span>
                  <span className="tabular-nums text-muted-foreground">{number(d.count)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-chart-2 transition-all duration-500"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {districts.length > MAX_DISTRICT_BARS && (
              <p className="text-caption text-muted-foreground">
                Showing top {MAX_DISTRICT_BARS} of {number(districts.length)} districts
              </p>
            )}
          </div>
        )}

        {/* 3-stat footer (§9.1 map card slot) */}
        {districts.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
            <div>
              <p className="text-body-sm font-semibold tabular-nums">{number(districts.length)}</p>
              <p className="text-caption text-muted-foreground">Districts</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold">{top?.district ?? "—"}</p>
              <p className="text-caption text-muted-foreground">Top district</p>
            </div>
            <div>
              <p className="text-body-sm font-semibold tabular-nums">{compact(avg)}</p>
              <p className="text-caption text-muted-foreground">Avg per district</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FOLLOWUP: Calendar,
  CLAIM: Briefcase,
  VERIFICATION: ShieldCheck,
};

function ActivityCard({
  activity,
  className,
}: {
  activity: NonNullable<KPIData["recentActivity"]>;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState
            icon={<Calendar />}
            title="No activity yet"
            description="Follow-ups, claims and verifications show up here."
          />
        ) : (
          <div className="space-y-4">
            {activity.map((event, index) => {
              const Icon = ACTIVITY_ICONS[event.type] ?? Calendar;
              return (
                <div key={`${event.type}-${event.date}-${index}`} className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
                      <Icon className="h-3.5 w-3.5 text-primary-strong" />
                    </div>
                    {index < activity.length - 1 && (
                      <div className="absolute bottom-0 left-3 top-7 w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-body-sm font-medium">{event.title}</p>
                    <p className="text-caption text-muted-foreground">
                      {event.traineeName} • {formatDateTime(new Date(event.date))}
                    </p>
                    <Link
                      href={`/trainees/${event.traineePublicId}`}
                      className="text-caption text-primary hover:underline"
                    >
                      View trainee
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const cohortColumns: ColumnDef<Cohort, unknown>[] = [
  {
    accessorKey: "name",
    header: "Cohort",
    cell: ({ row }) => (
      <Link href={`/cohorts/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "programme",
    accessorFn: (row) => row.programme.name,
    header: "Programme",
  },
  {
    id: "trainees",
    accessorFn: (row) => row._count.enrolments,
    header: "Trainees",
    cell: ({ row }) => (
      <span className="tabular-nums">{number(row.original._count.enrolments)}</span>
    ),
  },
  {
    accessorKey: "endDate",
    header: "Certification ends",
    cell: ({ row }) => fmtDate(row.original.endDate),
  },
  rowActionsColumn((row) => (
    <Button variant="ghost" size="icon-xs" asChild aria-label={`Open ${row.name}`}>
      <Link href={`/cohorts/${row.id}`}>
        <ArrowUpRight />
      </Link>
    </Button>
  )),
];

function AdminDashboard({ userName }: { userName: string }) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [districts, setDistricts] = useState<DistrictPoint[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [kpisRes, cohortsRes, districtsRes] = await Promise.all([
        fetch("/api/v1/kpis/overview"),
        fetch("/api/v1/cohorts"),
        fetch("/api/v1/kpis/districts"),
      ]);
      if (!kpisRes.ok || !cohortsRes.ok || !districtsRes.ok) throw new Error("Failed to fetch data");

      const kpisData = (await kpisRes.json()) as KPIData;
      const cohortsData = (await cohortsRes.json()) as { data?: Cohort[] };
      const districtsData = (await districtsRes.json()) as DistrictsResponse;

      setKpis(kpisData);
      setCohorts(cohortsData.data ?? []);
      setDistricts(districtsData.districts);
      setUpdatedAt(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading && !kpis) {
    return (
      <div>
        <Skeleton className="mb-6 h-14 w-72" />
        <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description="The data didn't arrive. Check your connection and retry."
        onRetry={() => void fetchData()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={welcomeTitle(userName)}
        caption={updatedAt ? `Last updated ${timeAgo(updatedAt)}` : undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={refreshing}>
            <RotateCw className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      {/* KPI row (§9.1) — no delta/sparkline: the KPI API has no time-series history */}
      <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total trainees"
          value={number(kpis.trainees.total)}
          icon={<Users />}
          chip="brand"
          href="/trainees"
        />
        <StatCard
          title="Outcome coverage"
          value={
            <span className="inline-flex items-baseline gap-2">
              {percent(kpis.outcomeCoverage.rate, { sign: false, digits: 0 })}
              <span className="text-body-sm font-normal text-muted-foreground">
                {number(kpis.outcomeCoverage.numerator)}/{number(kpis.outcomeCoverage.denominator)} known
              </span>
            </span>
          }
          icon={<TrendingUp />}
          chip="purple"
        />
        <StatCard
          title="Verified employment"
          value={
            <span className="inline-flex items-baseline gap-2">
              {percent(kpis.verifiedEmployment.rate, { sign: false, digits: 0 })}
              <span className="text-body-sm font-normal text-muted-foreground">
                {number(kpis.verifiedEmployment.numerator)}/{number(kpis.verifiedEmployment.denominator)} verified
              </span>
            </span>
          }
          icon={<ShieldCheck />}
          chip="blue"
        />
        <StatCard
          title="Conflicts"
          value={number(kpis.conflicts.count)}
          icon={<AlertTriangle />}
          chip="brand"
          goodDirection="down"
          href="/conflicts"
        />
      </div>

      {/* Analytics + table rows (§9.1): funnel 8/12 · districts 4/12 · cohorts 8/12 · activity 4/12 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FunnelCard funnel={kpis.funnel} className="lg:col-span-2" />
        <DistrictCard districts={districts} />
        <div className="lg:col-span-2">
          <DataTable
            columns={cohortColumns}
            data={cohorts}
            loading={loading}
            title="Cohorts"
            searchPlaceholder="Search cohorts…"
            emptyState={
              <EmptyState
                title="No cohorts yet"
                description="Cohorts appear here once trainees are enrolled."
              />
            }
            mobileCard={(cohort) => (
              <div className="rounded-lg bg-muted/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/cohorts/${cohort.id}`}
                    className="text-body-sm font-medium hover:underline"
                  >
                    {cohort.name}
                  </Link>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-1 text-caption text-muted-foreground">
                  {cohort.programme.name} · {number(cohort._count.enrolments)} trainees · ends{" "}
                  {fmtDate(cohort.endDate)}
                </p>
              </div>
            )}
          />
        </div>
        <ActivityCard activity={kpis.recentActivity ?? []} />
      </div>
    </div>
  );
}

export function DashboardView({ userName, isTrainee }: { userName: string; isTrainee: boolean }) {
  // Trainees land on the jobs board (UI-09); admin/institute get the §9.1 KPI view.
  if (isTrainee) {
    return (
      <div>
        <PageHeader
          title={welcomeTitle(userName)}
          caption="Browse open jobs and track your applications."
        />
        <TraineeJobsBoard />
      </div>
    );
  }

  return <AdminDashboard userName={userName} />;
}
