"use client";

import { useState } from "react";
import { Ban, Briefcase, FileText, Percent, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { StatCard } from "~/components/patterns/stat-card";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { number } from "~/lib/format";
import type { EmployerReliability, JobMarketplace } from "~/lib/job-board-contracts";

interface JobMarketplacePanelProps {
  marketplace: JobMarketplace | null;
  /** Refetch analytics after a suspend (badge revoked, gaps update). */
  onRefresh?: () => void;
}

const REASON_LABELS: Record<string, string> = {
  NO_JOBS: "No jobs",
  SKILLS_MISMATCH: "Skills mismatch",
  FAMILY: "Family",
  HEALTH: "Health",
  OTHER: "Other",
};

function statusBadge(status: EmployerReliability["verificationStatus"]) {
  if (status === "VERIFIED") return <Badge variant="success">Verified</Badge>;
  if (status === "SUSPENDED") return <Badge variant="warning">Suspended</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

function flagReason(employer: EmployerReliability): string | null {
  if (employer.verificationStatus === "SUSPENDED") return "Suspended by admin";
  if (employer.retentionScore !== null && employer.retentionScore < 50) {
    return "Retention score below 50";
  }
  return null;
}

function retentionBadge(score: number | null) {
  if (score === null) return <Badge variant="secondary">—</Badge>;
  if (score >= 75) return <Badge variant="success">{score}%</Badge>;
  if (score >= 50) return <Badge variant="warning">{score}%</Badge>;
  return <Badge variant="destructive">{score}%</Badge>;
}

/** Job Marketplace: hiring funnel metrics, demand gaps, employer reliability. */
export function JobMarketplacePanel({ marketplace, onRefresh }: JobMarketplacePanelProps) {
  const [suspendTarget, setSuspendTarget] = useState<EmployerReliability | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!marketplace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Briefcase />}
            title="No marketplace data"
            description="Marketplace metrics appear once jobs and applications exist."
          />
        </CardContent>
      </Card>
    );
  }

  const openSuspendDialog = (employer: EmployerReliability) => {
    setSuspendTarget(employer);
    setReason("");
    setError("");
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    setSubmitting(true);
    setError("");
    try {
      const trimmed = reason.trim();
      const res = await fetch(`/api/v1/admin/employers/${suspendTarget.employerId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed ? { reason: trimmed } : {}),
      });
      if (!res.ok) throw new Error("Failed to suspend employer");
      setSuspendTarget(null);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to suspend employer:", err);
      setError("Failed to suspend the employer. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Marketplace KPI row (§9.10) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Jobs posted"
          value={number(marketplace.jobsPosted)}
          icon={<Briefcase />}
          chip="brand"
        />
        <StatCard
          title="Open jobs"
          value={number(marketplace.openJobs)}
          icon={<FileText />}
          chip="purple"
        />
        <StatCard
          title="Applications"
          value={number(marketplace.applications)}
          icon={<Users />}
          chip="blue"
        />
        <StatCard
          title="Hires"
          value={number(marketplace.hires)}
          icon={<UserCheck />}
          chip="brand"
        />
        <StatCard
          title="Hire rate"
          value={marketplace.hireRate === null ? "—" : `${marketplace.hireRate}%`}
          icon={<Percent />}
          chip="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Demand Gaps by District</CardTitle>
            <CardDescription>
              Job-seek signals vs open jobs — a large gap points at unmet demand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={marketplace.demandGaps.map((g) => ({
                name: g.district,
                actual: g.signals,
                expected: g.openJobs,
              }))}
              xKey="name"
              height={280}
              yAxisLabel="Count"
              names={{ actual: "Signals", expected: "Open jobs" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signals vs Open Jobs</CardTitle>
            <CardDescription>
              Non-placement reasons per district — a large gap (many signals, few open jobs) points at unmet demand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {marketplace.demandGaps.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title="No job-seek signals yet"
                description="Signals recorded from the trainee jobs board show up here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>District</TableHead>
                    <TableHead className="text-right">Signals</TableHead>
                    <TableHead className="text-right">Open jobs</TableHead>
                    <TableHead>Reasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketplace.demandGaps.map((gap) => (
                    <TableRow key={gap.district}>
                      <TableCell className="font-medium">{gap.district}</TableCell>
                      <TableCell className="tabular-nums">{number(gap.signals)}</TableCell>
                      <TableCell className="tabular-nums">{number(gap.openJobs)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {gap.byReason.map((r) => (
                            <Badge key={r.reason} variant="secondary">
                              {REASON_LABELS[r.reason] ?? r.reason} {r.count}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employer Reliability</CardTitle>
          <CardDescription>
            Board hires (HIRED applications) and retention — sustained employment at a later checkpoint for that hire. Employers flagged as suspended or with retention below 50 are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorState
              title="Couldn't load employers"
              description={error}
              onRetry={onRefresh}
              className="py-8"
            />
          ) : marketplace.employerReliability.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No employers registered yet"
              description="Employers appear here once they register on the platform."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Hires</TableHead>
                  <TableHead>Retention score</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketplace.employerReliability.map((employer) => {
                  const flagged = flagReason(employer);
                  return (
                    <TableRow
                      key={employer.employerId}
                      className={flagged ? "bg-danger-soft hover:bg-danger-soft" : undefined}
                    >
                      <TableCell className="font-medium">{employer.companyName}</TableCell>
                      <TableCell>{statusBadge(employer.verificationStatus)}</TableCell>
                      <TableCell className="tabular-nums">{number(employer.hires)}</TableCell>
                      <TableCell>{retentionBadge(employer.retentionScore)}</TableCell>
                      <TableCell>
                        {flagged ? (
                          <span className="flex items-center gap-1 text-body-sm font-medium text-danger-text">
                            <ShieldAlert className="h-4 w-4" />
                            {flagged}
                          </span>
                        ) : (
                          <span className="text-body-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {employer.verificationStatus === "VERIFIED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-destructive text-danger-text hover:bg-danger-soft"
                            disabled={submitting}
                            onClick={() => openSuspendDialog(employer)}
                          >
                            <Ban className="h-4 w-4" />
                            Suspend
                          </Button>
                        ) : (
                          <span className="text-body-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={suspendTarget !== null} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {suspendTarget?.companyName}?</AlertDialogTitle>
            <AlertDialogDescription>
              The verified badge is revoked and their jobs become hidden from trainees. The action is recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Reason (optional — minimum 3 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            {error && <p className="text-body-sm text-danger-text">{error}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={submitting || (reason.trim().length > 0 && reason.trim().length < 3)}
              onClick={(e) => {
                e.preventDefault();
                void confirmSuspend();
              }}
            >
              {submitting ? "Suspending…" : "Suspend employer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
