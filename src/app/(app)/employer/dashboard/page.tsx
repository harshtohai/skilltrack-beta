"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, BarChart3, TrendingUp } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { PeerComparisonChart } from "~/components/charts/PeerComparisonChart";
import { JobManagement } from "./job-management";
import { PageHeader } from "~/components/patterns/page-header";
import { StatCard } from "~/components/patterns/stat-card";
import { DataTable } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { number, datetime } from "~/lib/format";

const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

interface EmployerAnalytics {
  employer: {
    name: string;
    isDemo: boolean;
    totalClaims: number;
    verifiedClaims: number;
  };
  retention: {
    score: number | null;
    numerator: number;
    denominator: number;
  };
  ranking: {
    rank: number | null;
    of: number;
    peerAvg: number | null;
    peerTopQuartile: number | null;
  };
  timeline: Array<{ month: string; count: number }>;
  verificationHistory: Array<{ status: string; count: number }>;
  wageBands: Array<{ band: string; count: number }>;
  recentClaims: Array<{
    id: string;
    traineeId: string;
    employerName: string | null;
    role: string | null;
    salaryBand: string | null;
    verificationStatus: string;
    createdAt: string;
  }>;
}

interface ClaimRow {
  id: string;
  traineeId: string;
  role: string | null;
  salaryBand: string | null;
  verificationStatus: string;
  createdAt: string;
}

const claimColumns: ColumnDef<ClaimRow, unknown>[] = [
  {
    accessorKey: "traineeId",
    header: "Trainee",
    cell: ({ row }) => (
      <span className="font-mono text-caption">{row.original.traineeId.slice(0, 8)}…</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => row.original.role ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "salaryBand",
    header: "Salary Band",
    cell: ({ row }) =>
      row.original.salaryBand ? (
        <span className="tabular-nums">{SALARY_BAND_LABELS[row.original.salaryBand] ?? row.original.salaryBand}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "verificationStatus",
    header: "Verification",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.verificationStatus === "EMPLOYER_CONFIRMED" ||
          row.original.verificationStatus === "DOCUMENT_VERIFIED"
            ? "success"
            : "secondary"
        }
      >
        {row.original.verificationStatus.replace(/_/g, " ").toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <span className="whitespace-nowrap">{datetime(new Date(row.original.createdAt))}</span>,
  },
];

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-14 w-72" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="mb-4 h-24 w-full" />
      <div className="mb-4 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

/**
 * Employer dashboard per design §9.1 — Shell S1. The verification banner gate
 * inside JobManagement drives the section: PENDING/SUSPENDED/REJECTED see the
 * banner only, VERIFIED the full UI. KPI StatCards carry real vs-peer-avg
 * deltas; charts are tokenized (§4.11); recent claims render as a DataTable.
 */
export default function EmployerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<EmployerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/employer/me");
      if (res.status === 401) {
        router.push("/employer/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load employer analytics");
      setData((await res.json()) as EmployerAnalytics);
    } catch (err) {
      console.error("Employer dashboard error:", err);
      setError("Failed to load employer analytics");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description={error || "The data didn't arrive. Check your connection and retry."}
        onRetry={() => void loadDashboard()}
      />
    );
  }

  const retentionScore = data.retention.score;
  const peerAvg = data.ranking.peerAvg;
  const retentionNote =
    data.retention.denominator > 0
      ? `${data.retention.numerator} of ${data.retention.denominator} confirmed claims sustained at a later checkpoint.`
      : "Insufficient evidence — no confirmed claims with later checkpoint data yet.";

  return (
    <div>
      <PageHeader
        title="Employer dashboard"
        caption={data.employer.name}
        actions={data.employer.isDemo ? <Badge variant="secondary">Demo View</Badge> : undefined}
      />

      {/* F25 job management — verification banner gate drives the section */}
      <div className="mb-6">
        <JobManagement />
      </div>

      {/* KPI row (§9.1) — retention delta is vs peer avg (real value from the API) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Retention score"
          value={retentionScore ?? "—"}
          delta={retentionScore !== null && peerAvg !== null ? retentionScore - peerAvg : undefined}
          deltaLabel="vs peer avg"
          icon={<TrendingUp />}
          chip="purple"
        />
        <StatCard title="Total claims" value={number(data.employer.totalClaims)} icon={<Building2 />} chip="brand" />
        <StatCard title="Verified claims" value={number(data.employer.verifiedClaims)} icon={<ShieldCheck />} chip="blue" />
        <StatCard
          title="Retention rank"
          value={
            <>
              {data.ranking.rank !== null ? `#${data.ranking.rank}` : "—"}
              {data.ranking.of > 0 && data.ranking.rank !== null ? (
                <span className="text-body-sm font-normal text-muted-foreground"> of {number(data.ranking.of)}</span>
              ) : null}
            </>
          }
          icon={<BarChart3 />}
          chip="brand"
        />
      </div>

      {/* Charts (§4.11 — chart tokens, built-in legends; empty handled inside) */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims over time</CardTitle>
            <CardDescription>Employment claims recorded per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.timeline.map((t) => ({ name: t.month, count: t.count }))}
              xKey="name"
              height={300}
              lines={[{ key: "count", label: "Claims" }]}
              yAxisLabel="Claims"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification history</CardTitle>
            <CardDescription>Claims per verification status.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={data.verificationHistory.map((v) => ({
                name: v.status.replace(/_/g, " ").toLowerCase(),
                actual: v.count,
                expected: v.count,
              }))}
              xKey="name"
              height={300}
              showLegend={false}
              yAxisLabel="Claims"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wage band distribution</CardTitle>
            <CardDescription>Claims per salary band.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={data.wageBands.map((w) => ({
                name: SALARY_BAND_LABELS[w.band] ?? w.band,
                actual: w.count,
                expected: w.count,
              }))}
              xKey="name"
              height={300}
              showLegend={false}
              yAxisLabel="Claims"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention vs peers</CardTitle>
            <CardDescription>{retentionNote}</CardDescription>
          </CardHeader>
          <CardContent>
            {peerAvg === null ? (
              <EmptyState
                title="No scored peers yet"
                description="Retention scoring needs confirmed claims with later checkpoint data."
              />
            ) : (
              <PeerComparisonChart
                data={[
                  { name: "Your Company", value: retentionScore ?? 0, isCurrent: true },
                  {
                    name: "Top Quartile",
                    value: data.ranking.peerTopQuartile ?? peerAvg,
                    isCurrent: false,
                  },
                ]}
                xKey="name"
                height={300}
                yAxisLabel="Retention Score"
                showAverage={true}
                averageValue={peerAvg}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent claims (§4.5 DataTable) */}
      <DataTable
        columns={claimColumns}
        data={data.recentClaims}
        title="Recent claims"
        searchPlaceholder="Search claims…"
        emptyState={
          <EmptyState
            title="No claims yet"
            description="Employment claims recorded for your trainees appear here."
          />
        }
      />
    </div>
  );
}
