"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, TrendingUp, Target, Award, Download } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { PeerComparisonChart } from "~/components/charts/PeerComparisonChart";
import { PageHeader } from "~/components/patterns/page-header";
import { StatCard } from "~/components/patterns/stat-card";
import { DataTable } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { FilterBar } from "~/components/patterns/filter-bar";
import { number, percent } from "~/lib/format";

interface InstituteAnalyticsData {
  timeWindow: string;
  labels: string[];
  monthlyData: InstituteMonthlyData[];
  overall: {
    totalCertified: number;
    totalEmployed: number;
    totalRetained: number;
    totalCertificates: number;
    avgCertificatesPerTrainee: number;
  };
  peerComparison: {
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
    avgPlacementRate: number;
    avgRetentionRate: number;
    avgVerifiedRate: number;
    avgWageProgressionRate: number;
    avgCertificatesPerTrainee: number;
    topQuartilePlacementRate: number;
    topQuartileRetentionRate: number;
    topQuartileVerifiedRate: number;
    topQuartileWageProgressionRate: number;
    topQuartileCertificatesPerTrainee: number;
    gaps: {
      placementRate: number;
      retentionRate: number;
      verifiedRate: number;
      wageProgressionRate: number;
      certificatesPerTrainee: number;
    };
    centerCount: number;
  };
  cohorts: Array<{
    id: string;
    name: string;
    programme: string;
    traineeCount: number;
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
    certificatesPerTrainee: number;
  }>;
}

interface InstituteMonthlyData {
  month: string;
  certified: number;
  employed: number;
  retained90: number;
  verifiedEmployed: number;
  wageProgression: number;
  placementRate: number;
  retentionRate: number;
  verifiedRate: number;
  wageProgressionRate: number;
  avgSalaryBand: number;
}

const TIME_WINDOWS = [
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "24m", label: "Last 24 Months" },
  { value: "all", label: "All Time" },
];

/** Client-side CSV export of the cohort performance table (idea bag #6). */
function downloadCsv(data: InstituteAnalyticsData) {
  const header = [
    "Cohort", "Programme", "Trainees", "Placement %", "Retention %",
    "Verified %", "Wage Progression %", "Certs/Trainee",
  ];
  const rows = data.cohorts.map((c) => [
    `"${c.name}"`, `"${c.programme}"`, c.traineeCount, c.placementRate.toFixed(1),
    c.retentionRate.toFixed(1), c.verifiedRate.toFixed(1), c.wageProgressionRate.toFixed(1),
    c.certificatesPerTrainee.toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `institute-cohorts-${data.timeWindow}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const cohortColumns: ColumnDef<InstituteAnalyticsData["cohorts"][number], unknown>[] = [
  {
    accessorKey: "name",
    header: "Cohort",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "programme",
    header: "Programme",
  },
  {
    accessorKey: "traineeCount",
    header: "Trainees",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.traineeCount)}</span>,
  },
  {
    accessorKey: "placementRate",
    header: "Placement rate",
    cell: ({ row }) => percent(row.original.placementRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "retentionRate",
    header: "Retention rate",
    cell: ({ row }) => percent(row.original.retentionRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "verifiedRate",
    header: "Verified Rate",
    cell: ({ row }) => percent(row.original.verifiedRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "wageProgressionRate",
    header: "Wage Progression",
    cell: ({ row }) => percent(row.original.wageProgressionRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "certificatesPerTrainee",
    header: "Certs/Trainee",
    cell: ({ row }) => <span className="tabular-nums">{row.original.certificatesPerTrainee.toFixed(2)}</span>,
  },
];

function AnalyticsSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-14 w-80" />
      <Skeleton className="mb-4 h-24 w-full" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default function InstituteAnalyticsDashboard() {
  const [data, setData] = useState<InstituteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeWindow, setTimeWindow] = useState("12m");
  const [programmeId, setProgrammeId] = useState("");
  const [cohortId, setCohortId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ timeWindow });
      if (programmeId) params.append("programmeId", programmeId);
      if (cohortId) params.append("cohortId", cohortId);

      const res = await fetch(`/api/v1/outcomes/institute?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = (await res.json()) as InstituteAnalyticsData;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch institute analytics:", err);
      setError("Failed to load analytics. If you use an ad blocker, please allow this site and retry.");
    } finally {
      setLoading(false);
    }
  }, [timeWindow, programmeId, cohortId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Couldn't load analytics"
        description={error || "The data didn't arrive. Check your connection and retry."}
        onRetry={() => void fetchData()}
      />
    );
  }

  // API buckets run up to today, so the last month can be empty — KPIs use the
  // latest month with data (charts keep the full timeline).
  const latest =
    [...data.monthlyData].reverse().find((m) => m.certified > 0) ??
    data.monthlyData[data.monthlyData.length - 1];
  const filtersActive = programmeId !== "" || cohortId !== "";

  return (
    <div>
      <PageHeader
        title="Institute analytics"
        caption="Student performance vs peer academies — benchmarking."
        actions={
          <>
            <Select value={timeWindow} onValueChange={setTimeWindow}>
              <SelectTrigger className="w-col-xl" aria-label="Time window">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_WINDOWS.map((tw) => (
                  <SelectItem key={tw.value} value={tw.value}>
                    {tw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => downloadCsv(data)} className="gap-2">
              <Download />
              Export CSV
            </Button>
          </>
        }
      />

      {/* Programme / cohort filters (§9.4 toolbar row) */}
      <FilterBar
        className="mb-6"
        onClear={filtersActive ? () => { setProgrammeId(""); setCohortId(""); } : undefined}
      >
        <Select value={programmeId === "" ? "all" : programmeId} onValueChange={(v) => setProgrammeId(v === "all" ? "" : v)}>
          <SelectTrigger aria-label="Programme">
            <SelectValue placeholder="All Programmes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programmes</SelectItem>
            <SelectItem value="pmkvy-it">PMKVY IT/ITeS</SelectItem>
            <SelectItem value="pmkvy-hc">PMKVY Healthcare</SelectItem>
            <SelectItem value="pmkvy-mfg">PMKVY Manufacturing</SelectItem>
            <SelectItem value="ddgky-rtl">DDU-GKY Retail</SelectItem>
            <SelectItem value="ssm-const">SSM Construction</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cohortId === "" ? "all" : cohortId} onValueChange={(v) => setCohortId(v === "all" ? "" : v)}>
          <SelectTrigger aria-label="Cohort">
            <SelectValue placeholder="All Cohorts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cohorts</SelectItem>
            {data.cohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.programme}) — {c.traineeCount} trainees
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {/* KPI row (§9.10) — deltas are vs peer avg / benchmark (real values) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total certified"
          value={
            <>
              {number(data.overall.totalCertified)}{" "}
              <span className="text-body-sm font-normal text-muted-foreground">
                {number(data.overall.totalEmployed)} placed
              </span>
            </>
          }
          icon={<Users />}
          chip="brand"
        />
        <StatCard
          title="Placement rate"
          value={percent(latest?.placementRate ?? 0, { sign: false, digits: 1 })}
          delta={(latest?.placementRate ?? 0) - data.peerComparison.avgPlacementRate}
          deltaLabel="vs peer avg"
          icon={<Target />}
          chip="purple"
        />
        <StatCard
          title="90-day retention"
          value={percent(latest?.retentionRate ?? 0, { sign: false, digits: 1 })}
          delta={(latest?.retentionRate ?? 0) - 60}
          deltaLabel="vs 60% benchmark"
          icon={<TrendingUp />}
          chip="blue"
        />
        <StatCard
          title="Certificates per trainee"
          value={
            <>
              {data.overall.avgCertificatesPerTrainee.toFixed(1)}{" "}
              <span className="text-body-sm font-normal text-muted-foreground">
                {number(data.overall.totalCertificates)} total
              </span>
            </>
          }
          icon={<Award />}
          chip="brand"
        />
      </div>

      {/* Monthly comparisons (§4.11 — chart tokens, built-in legends, semantic names) */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Placement rate: your institute vs peer average</CardTitle>
            <CardDescription>Peer average across {data.peerComparison.centerCount} centers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={data.monthlyData.map((d) => ({
                name: d.month,
                actual: d.placementRate,
                expected: data.peerComparison.avgPlacementRate,
              }))}
              xKey="name"
              height={320}
              yAxisLabel="Placement Rate (%)"
              names={{ actual: "Your institute", expected: "Peer avg" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention rate: your institute vs benchmark</CardTitle>
            <CardDescription>60% state benchmark.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              data={data.monthlyData.map((d) => ({
                name: d.month,
                actual: d.retentionRate,
                expected: 60,
              }))}
              xKey="name"
              height={320}
              yAxisLabel="Retention Rate (%)"
              names={{ actual: "Your institute", expected: "Benchmark (60%)" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verified employment rate trend</CardTitle>
            <CardDescription>Verified employment and wage progression per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.monthlyData.map((d) => ({ name: d.month, verifiedRate: d.verifiedRate, wageProgressionRate: d.wageProgressionRate }))}
              xKey="month"
              height={320}
              lines={[
                { key: "verifiedRate", label: "Verified Rate" },
                { key: "wageProgressionRate", label: "Wage Progression" },
              ]}
              yAxisLabel="Rate (%)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly volume trends</CardTitle>
            <CardDescription>Counts per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.monthlyData.map((d) => ({ name: d.month, certified: d.certified, employed: d.employed, retained90: d.retained90 }))}
              xKey="month"
              height={320}
              lines={[
                { key: "certified", label: "Certified" },
                { key: "employed", label: "Employed" },
                { key: "retained90", label: "Retained 90-Day" },
              ]}
              yAxisLabel="Count"
            />
          </CardContent>
        </Card>
      </div>

      {/* Peer comparison charts (§4.11 — chart-3 series, grey peers, dashed average) */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Placement rate: your institute vs peers</CardTitle>
            <CardDescription>Current entry highlighted; dashed line marks the peer average.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeerComparisonChart
              data={[
                { name: "Your Institute", value: latest?.placementRate ?? 0, isCurrent: true },
                { name: "Peer Average", value: data.peerComparison.avgPlacementRate, isCurrent: false },
                { name: "Top Quartile", value: data.peerComparison.topQuartilePlacementRate, isCurrent: false },
                { name: "State Target", value: 70, isCurrent: false },
              ]}
              xKey="name"
              height={320}
              yAxisLabel="Placement Rate (%)"
              showAverage={true}
              averageValue={data.peerComparison.avgPlacementRate}
            />
            <Alert variant="info" className="mt-4">
              <AlertTitle>Gap analysis</AlertTitle>
              <AlertDescription>
                Your institute is{" "}
                {data.peerComparison.gaps.placementRate < 0 ? "below" : "above"} peer average by{" "}
                <span className="font-semibold">
                  {Math.abs(data.peerComparison.gaps.placementRate).toFixed(1)}%
                </span>{" "}
                across {data.peerComparison.centerCount} centers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention rate vs peers</CardTitle>
            <CardDescription>Current entry highlighted; dashed line marks the peer average.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeerComparisonChart
              data={[
                { name: "Your Institute", value: latest?.retentionRate ?? 0, isCurrent: true },
                { name: "Peer Average", value: data.peerComparison.avgRetentionRate, isCurrent: false },
                { name: "Top Quartile", value: data.peerComparison.topQuartileRetentionRate, isCurrent: false },
                { name: "Benchmark", value: 60, isCurrent: false },
              ]}
              xKey="name"
              height={320}
              yAxisLabel="Retention Rate (%)"
              showAverage={true}
              averageValue={data.peerComparison.avgRetentionRate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wage progression vs peers</CardTitle>
            <CardDescription>Current entry highlighted; dashed line marks the peer average.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeerComparisonChart
              data={[
                { name: "Your Institute", value: latest?.wageProgressionRate ?? 0, isCurrent: true },
                { name: "Peer Average", value: data.peerComparison.avgWageProgressionRate, isCurrent: false },
                { name: "Top Quartile", value: data.peerComparison.topQuartileWageProgressionRate, isCurrent: false },
                { name: "State Target", value: 30, isCurrent: false },
              ]}
              xKey="name"
              height={320}
              yAxisLabel="Wage Progression Rate (%)"
              showAverage={true}
              averageValue={data.peerComparison.avgWageProgressionRate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificates per trainee vs peers</CardTitle>
            <CardDescription>Current entry highlighted; dashed line marks the peer average.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeerComparisonChart
              data={[
                { name: "Your Institute", value: data.overall.avgCertificatesPerTrainee, isCurrent: true },
                { name: "Peer Average", value: data.peerComparison.avgCertificatesPerTrainee, isCurrent: false },
                { name: "Top Quartile", value: data.peerComparison.topQuartileCertificatesPerTrainee, isCurrent: false },
                { name: "Benchmark", value: 2, isCurrent: false },
              ]}
              xKey="name"
              height={320}
              yAxisLabel="Avg Certificates per Trainee"
              showAverage={true}
              averageValue={data.peerComparison.avgCertificatesPerTrainee}
            />
          </CardContent>
        </Card>
      </div>

      {/* Cohort performance (§4.5 DataTable — tabular numbers) */}
      <DataTable
        columns={cohortColumns}
        data={data.cohorts}
        title="Cohort performance"
        searchPlaceholder="Search cohorts…"
        emptyState={
          <EmptyState
            title="No cohorts yet"
            description="Cohorts with enrolments appear here."
          />
        }
      />
    </div>
  );
}
