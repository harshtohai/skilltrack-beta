"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, ShieldCheck, AlertTriangle, Loader2, Calendar, Briefcase, Check, Copy, HelpCircle, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Toaster } from "~/components/ui/toaster";
import { toast } from "~/hooks/use-toast";
import { formatDate, formatDateTime } from "~/lib/utils";
import { matchesFilters, type JobFilter } from "~/server/job-relevance";
import type { MyApplication, PublicJob, TraineeJobsResponse, MyApplicationsResponse } from "~/lib/job-board-contracts";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-floating-promises */

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

function KPICard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground ml-2">{subtitle}</span>
          </div>
          {icon && <div className="text-muted-foreground/50">{icon}</div>}
        </div>
        <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

interface FunnelStage {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function FunnelChart({ funnel }: { funnel: KPIData["funnel"] }) {
  const stages: FunnelStage[] = [
    { key: "certified", label: "Certified", icon: Users },
    { key: "outcomeKnown", label: "Outcome Known", icon: TrendingUp },
    { key: "employed", label: "Employed", icon: ShieldCheck },
    { key: "verified", label: "Verified", icon: AlertTriangle },
  ];

  const maxCount = Math.max(...stages.map((s) => funnel[s.key as keyof typeof funnel]?.count ?? 0));

  // Safe accessor for funnel data
  function getFunnelData(key: string): { count: number; label: string } {
    const funnelMap = funnel as Record<string, { count: number; label: string }>;
    return funnelMap[key] ?? { count: 0, label: "" };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
{stages.map((stage, index) => {
            const data = getFunnelData(stage.key);
            const Icon = stage.icon;
            const width = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
            const prevData = index >= 1
              ? getFunnelData(stages[index - 1]!.key)
              : { count: 0, label: "" };
            const dropOff = prevData && prevData.count > 0
              ? Math.round(((prevData.count - data.count) / prevData.count) * 100)
              : 0;

            return (
              <div key={stage.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-bold">{data.count}</span>
                    {dropOff > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        -{dropOff}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityTimeline({ activity }: { activity: NonNullable<KPIData["recentActivity"]> }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    FOLLOWUP: Calendar,
    CLAIM: Briefcase,
    VERIFICATION: ShieldCheck,
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.map((event, index) => {
            const Icon = icons[event.type] ?? Calendar;
            return (
              <div key={`${event.type}-${event.date}-${index}`} className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {index < activity.length - 1 && (
                    <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-border" />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.traineeName} • {formatDateTime(new Date(event.date))}
                  </p>
                  <Link
                    href={`/trainees/${event.traineePublicId}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View trainee
                  </Link>
                </div>
              </div>
            );
          })}
          {activity.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No activity yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CohortTable({ cohorts }: { cohorts: Cohort[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohorts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead className="text-right">Trainees</TableHead>
              <TableHead>Certification Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((cohort) => (
              <TableRow key={cohort.id}>
                <TableCell className="font-medium">{cohort.name}</TableCell>
                <TableCell>{cohort.programme.name}</TableCell>
                <TableCell className="text-right">{cohort._count.enrolments}</TableCell>
                <TableCell>{formatDate(cohort.endDate)}</TableCell>
                <TableCell>
                  <Link href={`/cohorts/${cohort.id}`} className="text-primary hover:underline flex items-center gap-1">
                    View <ArrowRight className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
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
  const filtersActive = Boolean(filters.district || filters.workMode || filters.employmentType);

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
              value={filters.district || "all"}
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
              value={filters.workMode || "all"}
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
              value={filters.employmentType || "all"}
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

function DashboardContent({ isTrainee = false }: { isTrainee?: boolean }) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const kpisRes = await fetch("/api/v1/kpis/overview");
      // Cohorts are admin/institute-only — trainees skip the fetch (it 403s).
      const cohortsRes = isTrainee ? null : await fetch("/api/v1/cohorts");

      if (!kpisRes.ok || (cohortsRes !== null && !cohortsRes.ok)) throw new Error("Failed to fetch data");

      const kpisData = (await kpisRes.json()) as KPIData;
      const cohortsData = cohortsRes ? ((await cohortsRes.json()) as { data?: Cohort[] }) : null;

      setKpis(kpisData);
      setCohorts(cohortsData?.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !kpis) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 text-center">
        <p className="text-destructive">{error}</p>
        <button onClick={fetchData} className="mt-4 text-primary hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Trainee job board — Jobs / My Applications tabs */}
      {isTrainee && <TraineeJobsBoard />}

      {kpis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <KPICard
            title="Total Trainees"
            value={kpis.trainees.total}
            subtitle="certified"
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard
            title="Outcome Coverage"
            value={`${kpis.outcomeCoverage.rate}%`}
            subtitle={`${kpis.outcomeCoverage.numerator}/${kpis.outcomeCoverage.denominator} known`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Verified Employment"
            value={`${kpis.verifiedEmployment.rate}%`}
            subtitle={`${kpis.verifiedEmployment.numerator}/${kpis.verifiedEmployment.denominator} verified`}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <KPICard
            title="Conflicts"
            value={kpis.conflicts.count}
            subtitle="need review"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {kpis && <FunnelChart funnel={kpis.funnel} />}
        {kpis?.recentActivity && <ActivityTimeline activity={kpis.recentActivity} />}
      </div>

      {/* Cohorts are admin/institute-only */}
      {!isTrainee && <CohortTable cohorts={cohorts} />}
    </div>
  );
}

export default function DashboardPage() {
  // /dashboard serves admin, institute and trainee; the Jobs board is
  // trainee-only. Role check mirrors trainee/profile: only a trainee
  // session can load /api/v1/trainee/me, everyone else gets 401.
  const [isTrainee, setIsTrainee] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/trainee/me");
        if (!cancelled) setIsTrainee(res.ok);
      } catch (err) {
        console.error("Dashboard role check error:", err);
        if (!cancelled) setIsTrainee(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The dashboard mounts only after the role check resolves — the cohorts
  // fetch inside must not race the role.
  if (isTrainee === null) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardContent isTrainee={isTrainee} />
      <Toaster />
    </>
  );
}