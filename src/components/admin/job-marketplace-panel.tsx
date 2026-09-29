"use client";

import { useState } from "react";
import { Ban, Briefcase, FileText, Percent, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { MetricCard } from "~/components/charts/MetricCard";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
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

function scoreTone(score: number | null): string {
  if (score === null) return "bg-gray-100 text-gray-600";
  if (score >= 75) return "bg-green-100 text-green-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
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
          <CardTitle>Job Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-gray-500">No marketplace data available.</p>
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Jobs Posted"
          value={marketplace.jobsPosted.toLocaleString()}
          subtitle="total job postings"
          icon={<Briefcase className="h-6 w-6 text-indigo-500" />}
        />
        <MetricCard
          title="Open Jobs"
          value={marketplace.openJobs.toLocaleString()}
          subtitle={`of ${marketplace.jobsPosted.toLocaleString()} posted`}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
        />
        <MetricCard
          title="Applications"
          value={marketplace.applications.toLocaleString()}
          subtitle="total applications"
          icon={<Users className="h-6 w-6 text-purple-500" />}
        />
        <MetricCard
          title="Hires"
          value={marketplace.hires.toLocaleString()}
          subtitle={`of ${marketplace.applications.toLocaleString()} applications`}
          icon={<UserCheck className="h-6 w-6 text-green-500" />}
        />
        <MetricCard
          title="Hire Rate"
          value={marketplace.hireRate === null ? "—" : `${marketplace.hireRate}%`}
          subtitle={
            marketplace.hireRate === null
              ? "no applications yet"
              : `${marketplace.hires} hires / ${marketplace.applications} applications`
          }
          icon={<Percent className="h-6 w-6 text-orange-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Demand Gaps by District</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-orange-500" />
                Job-seek signals
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500" />
                Open jobs
              </span>
            </div>
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
              showLegend={false}
              yAxisLabel="Count"
              colors={{ actual: "#f97316", expected: "#3b82f6" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signals vs Open Jobs</CardTitle>
            <p className="text-sm text-gray-500">
              Non-placement reasons per district — a large gap (many signals, few open jobs) points at unmet demand.
            </p>
          </CardHeader>
          <CardContent>
            {marketplace.demandGaps.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No job-seek signals recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>District</TableHead>
                    <TableHead>Signals</TableHead>
                    <TableHead>Open Jobs</TableHead>
                    <TableHead>Reasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketplace.demandGaps.map((gap) => (
                    <TableRow key={gap.district}>
                      <TableCell className="font-medium">{gap.district}</TableCell>
                      <TableCell>{gap.signals}</TableCell>
                      <TableCell>{gap.openJobs}</TableCell>
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
          <p className="text-sm text-gray-500">
            Board hires (HIRED applications) and retention — sustained employment at a later checkpoint for that hire. Employers flagged as suspended or with retention below 50 are highlighted.
          </p>
        </CardHeader>
        <CardContent>
          {marketplace.employerReliability.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No employers registered yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hires</TableHead>
                  <TableHead>Retention Score</TableHead>
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
                      className={flagged ? "bg-red-50 hover:bg-red-50" : undefined}
                    >
                      <TableCell className="font-medium">{employer.companyName}</TableCell>
                      <TableCell>{statusBadge(employer.verificationStatus)}</TableCell>
                      <TableCell>{employer.hires}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded font-semibold ${scoreTone(employer.retentionScore)}`}>
                          {employer.retentionScore === null ? "—" : `${employer.retentionScore}%`}
                        </span>
                      </TableCell>
                      <TableCell>
                        {flagged ? (
                          <span className="flex items-center gap-1 text-sm font-medium text-red-700">
                            <ShieldAlert className="h-4 w-4" />
                            {flagged}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {employer.verificationStatus === "VERIFIED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                            disabled={submitting}
                            onClick={() => openSuspendDialog(employer)}
                          >
                            <Ban className="h-4 w-4" />
                            Suspend
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
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

      <Dialog open={suspendTarget !== null} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {suspendTarget?.companyName}?</DialogTitle>
            <DialogDescription>
              The verified badge is revoked and their jobs become hidden from trainees. The action is recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Reason (optional — minimum 3 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={submitting || (reason.trim().length > 0 && reason.trim().length < 3)}
              onClick={() => void confirmSuspend()}
            >
              {submitting ? "Suspending…" : "Suspend employer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
