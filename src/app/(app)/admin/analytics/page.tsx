"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Download, Target, TrendingUp, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { DotForecast } from "~/components/viz/dot-forecast";
import { VerificationQueue } from "~/components/admin/verification-queue";
import { JobMarketplacePanel } from "~/components/admin/job-marketplace-panel";
import { PageHeader } from "~/components/patterns/page-header";
import { StatCard } from "~/components/patterns/stat-card";
import { DataTable } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { FilterBar } from "~/components/patterns/filter-bar";
import { number, percent } from "~/lib/format";
import type { JobMarketplace } from "~/lib/job-board-contracts";

interface TrainingCenterScore {
  centerId: string;
  centerName: string;
  placementScore: number;
  academicScore: number;
  volumeScore: number;
  overallScore: number;
  numerators: {
    employedKnown: number;
    employedVerified: number;
    outcomesKnown: number;
    certifiedCount: number;
    certificatesPerTrainee: number;
    trainingRelevanceAvg: number | null;
  };
}

interface GovernmentAnalyticsData {
  timeWindow: string;
  labels: string[];
  monthlyData: MonthlyData[];
  overall: {
    totalCertified: number;
    totalEmployed: number;
    totalRetained: number;
    totalVerified: number;
  };
  trainingCenters: TrainingCenterScore[];
  jobMarketplace?: JobMarketplace | null;
  targets: {
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface MonthlyData {
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
  expectedPlacement: number;
  expectedRetention: number;
  expectedVerified: number;
  expectedWageProgression: number;
}

const TIME_WINDOWS = [
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "24m", label: "Last 24 Months" },
  { value: "all", label: "All Time" },
];

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

/** Overall-score pill per the formula note: ≥75 good, ≥50 warn, else bad. */
function scoreBadge(score: number) {
  if (score >= 75) return <Badge variant="success">{score}</Badge>;
  if (score >= 50) return <Badge variant="warning">{score}</Badge>;
  return <Badge variant="destructive">{score}</Badge>;
}

/** Client-side CSV export (idea bag #6 — real action, no backend route). */
function downloadCsv(data: GovernmentAnalyticsData, timeWindow: string) {
  const header = [
    "Month", "Certified", "Employed", "Placement %", "Retained 90",
    "Retention %", "Verified %", "Wage Prog %",
  ];
  const rows = data.monthlyData.map((r) => [
    r.month, r.certified, r.employed, r.placementRate.toFixed(1), r.retained90,
    r.retentionRate.toFixed(1), r.verifiedRate.toFixed(1), r.wageProgressionRate.toFixed(1),
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `government-analytics-${timeWindow}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const leaderboardColumns: ColumnDef<TrainingCenterScore, unknown>[] = [
  {
    id: "rank",
    header: "#",
    cell: ({ row }) => (
      <span className="text-body-sm tabular-nums text-muted-foreground">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: "centerName",
    header: "Training Center",
    cell: ({ row }) => <span className="font-medium">{row.original.centerName}</span>,
  },
  {
    id: "overallScore",
    accessorFn: (row) => row.overallScore,
    header: "Overall",
    cell: ({ row }) => scoreBadge(row.original.overallScore),
  },
  {
    accessorKey: "placementScore",
    header: "Placement",
    cell: ({ row }) => <span className="tabular-nums">{row.original.placementScore}</span>,
  },
  {
    accessorKey: "academicScore",
    header: "Academic",
    cell: ({ row }) => <span className="tabular-nums">{row.original.academicScore}</span>,
  },
  {
    accessorKey: "volumeScore",
    header: "Volume",
    cell: ({ row }) => <span className="tabular-nums">{row.original.volumeScore}</span>,
  },
  {
    id: "certified",
    accessorFn: (row) => row.numerators.certifiedCount,
    header: "Certified",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.numerators.certifiedCount)}</span>,
  },
  {
    id: "knownOutcomes",
    accessorFn: (row) => row.numerators.outcomesKnown,
    header: "Known Outcomes",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.numerators.outcomesKnown)}</span>,
  },
  {
    id: "verified",
    accessorFn: (row) => row.numerators.employedVerified,
    header: "Verified",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.numerators.employedVerified)}</span>,
  },
];

const monthlyColumns: ColumnDef<MonthlyData, unknown>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => <span className="font-medium">{row.original.month}</span>,
  },
  {
    accessorKey: "certified",
    header: "Certified",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.certified)}</span>,
  },
  {
    accessorKey: "employed",
    header: "Employed",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.employed)}</span>,
  },
  {
    accessorKey: "placementRate",
    header: "Placement %",
    cell: ({ row }) => percent(row.original.placementRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "retained90",
    header: "Retained 90",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.retained90)}</span>,
  },
  {
    accessorKey: "retentionRate",
    header: "Retention %",
    cell: ({ row }) => percent(row.original.retentionRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "verifiedRate",
    header: "Verified %",
    cell: ({ row }) => percent(row.original.verifiedRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "wageProgressionRate",
    header: "Wage Prog %",
    cell: ({ row }) => percent(row.original.wageProgressionRate, { sign: false, digits: 1 }),
  },
];

function AnalyticsSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-14 w-80" />
      <Skeleton className="mb-4 h-24 w-full" />
      <Skeleton className="mb-6 h-9 w-64" />
      <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="mb-4 h-72 w-full" />
      <div className="mb-4 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default function GovernmentAnalyticsDashboard() {
  const [data, setData] = useState<GovernmentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeWindow, setTimeWindow] = useState("12m");
  const [programmeId, setProgrammeId] = useState("");
  const [district, setDistrict] = useState("");
  const [limit, setLimit] = useState("24");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ timeWindow, limit });
      if (programmeId) params.append("programmeId", programmeId);
      if (district) params.append("district", district);

      const res = await fetch(`/api/v1/outcomes/government?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = (await res.json()) as GovernmentAnalyticsData;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch government analytics:", err);
      setError("Failed to load analytics. If you use an ad blocker, please allow this site and retry.");
    } finally {
      setLoading(false);
    }
  }, [timeWindow, programmeId, district, limit]);

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

  const latest =
    [...data.monthlyData].reverse().find((m) => m.certified > 0) ??
    data.monthlyData[data.monthlyData.length - 1];
  const placementDelta = (latest?.placementRate ?? 0) - data.targets.placementRate;
  const filtersActive = programmeId !== "" || district !== "";

  return (
    <div>
      <PageHeader
        title="Government analytics"
        caption="Expected vs actual outcomes — longitudinal tracking."
        actions={
          <>
            <Select value={timeWindow} onValueChange={setTimeWindow}>
              <SelectTrigger className="w-[170px]" aria-label="Time window">
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
            <Button variant="outline" onClick={() => downloadCsv(data, timeWindow)} className="gap-2">
              <Download />
              Export CSV
            </Button>
          </>
        }
      />

      {/* Programme / district / table-depth filters (§9.4 toolbar row) */}
      <FilterBar
        className="mb-6"
        onClear={filtersActive ? () => { setProgrammeId(""); setDistrict(""); } : undefined}
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
        <Select value={district === "" ? "all" : district} onValueChange={(v) => setDistrict(v === "all" ? "" : v)}>
          <SelectTrigger aria-label="District">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {DISTRICTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={limit} onValueChange={setLimit}>
          <SelectTrigger aria-label="Months of history">
            <SelectValue placeholder="Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
            <SelectItem value="36">36 Months</SelectItem>
            <SelectItem value="48">48 Months</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Tabs defaultValue="outcomes">
        <TabsList className="mb-6">
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
          <TabsTrigger value="marketplace">Job Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="outcomes">
          {/* KPI row (§9.10) — deltas are vs target (real values from the API) */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total certified"
              value={number(data.overall.totalCertified)}
              icon={<Users />}
              chip="brand"
            />
            <StatCard
              title="Placement rate"
              value={percent(latest?.placementRate ?? 0, { sign: false, digits: 1 })}
              delta={placementDelta}
              deltaLabel="vs target"
              icon={<Target />}
              chip="purple"
            />
            <StatCard
              title="90-day retention"
              value={percent(latest?.retentionRate ?? 0, { sign: false, digits: 1 })}
              delta={(latest?.retentionRate ?? 0) - data.targets.retentionRate}
              deltaLabel="vs target"
              icon={<TrendingUp />}
              chip="blue"
            />
            <StatCard
              title="Verified employment"
              value={percent(latest?.verifiedRate ?? 0, { sign: false, digits: 1 })}
              delta={(latest?.verifiedRate ?? 0) - data.targets.verifiedRate}
              deltaLabel="vs target"
              icon={<Building2 />}
              chip="brand"
            />
          </div>

          {/* DotForecast hero (§4.14) — real monthly placement trend vs target bands */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Placement trend</CardTitle>
              <CardDescription>
                Monthly placement rate vs the {data.targets.placementRate}% target — each month is classified by its ratio to target.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DotForecast
                data={data.monthlyData.map((d) => ({ label: d.month, value: d.placementRate }))}
                target={data.targets.placementRate}
                todayIndex={data.monthlyData.length - 1}
                growthPill={{
                  value: `${placementDelta >= 0 ? "+" : ""}${placementDelta.toFixed(1)}%`,
                  label: "vs target",
                }}
                ariaLabel="Monthly placement rate versus target"
              />
            </CardContent>
          </Card>

          {/* Expected vs actual comparisons (§4.11 — chart tokens, built-in legends) */}
          <div className="mb-4 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Placement rate: expected vs actual</CardTitle>
                <CardDescription>Target {data.targets.placementRate}%.</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonChart
                  data={data.monthlyData.map((d) => ({
                    name: d.month,
                    actual: d.placementRate,
                    expected: d.expectedPlacement,
                  }))}
                  xKey="name"
                  height={300}
                  yAxisLabel="Placement Rate (%)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>90-day retention: expected vs actual</CardTitle>
                <CardDescription>Target {data.targets.retentionRate}%.</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonChart
                  data={data.monthlyData.map((d) => ({
                    name: d.month,
                    actual: d.retentionRate,
                    expected: d.expectedRetention,
                  }))}
                  xKey="name"
                  height={300}
                  yAxisLabel="Retention Rate (%)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verified employment: expected vs actual</CardTitle>
                <CardDescription>Target {data.targets.verifiedRate}%.</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonChart
                  data={data.monthlyData.map((d) => ({
                    name: d.month,
                    actual: d.verifiedRate,
                    expected: d.expectedVerified,
                  }))}
                  xKey="name"
                  height={300}
                  yAxisLabel="Verified Rate (%)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wage progression: expected vs actual</CardTitle>
                <CardDescription>Target {data.targets.wageProgressionRate}%.</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonChart
                  data={data.monthlyData.map((d) => ({
                    name: d.month,
                    actual: d.wageProgressionRate,
                    expected: d.expectedWageProgression,
                  }))}
                  xKey="name"
                  height={300}
                  yAxisLabel="Wage Progression Rate (%)"
                />
              </CardContent>
            </Card>
          </div>

          {/* Monthly trends (§4.11 line charts — chart token order, max 4 series) */}
          <div className="mb-4 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly trends overview</CardTitle>
                <CardDescription>Rates per month.</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={data.monthlyData.map((d) => ({ name: d.month, ...d }))}
                  xKey="month"
                  height={350}
                  lines={[
                    { key: "placementRate", label: "Placement Rate" },
                    { key: "retentionRate", label: "Retention Rate" },
                    { key: "verifiedRate", label: "Verified Rate" },
                    { key: "wageProgressionRate", label: "Wage Progression" },
                  ]}
                  yAxisLabel="Rate (%)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume metrics</CardTitle>
                <CardDescription>Counts per month.</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={data.monthlyData.map((d) => ({ name: d.month, ...d }))}
                  xKey="month"
                  height={350}
                  lines={[
                    { key: "certified", label: "Certified" },
                    { key: "employed", label: "Employed" },
                    { key: "retained90", label: "Retained 90-Day" },
                    { key: "verifiedEmployed", label: "Verified Employed" },
                  ]}
                  yAxisLabel="Count"
                />
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard (§4.5 DataTable — overall score pill per formula note) */}
          <div className="mb-4">
            <DataTable
              columns={leaderboardColumns}
              data={data.trainingCenters}
              title="Training centre leaderboard"
              searchPlaceholder="Search centres…"
              emptyState={
                <EmptyState
                  title="No training centres yet"
                  description="Centres with enrolments appear here."
                />
              }
            />
          </div>

          <DataTable
            columns={monthlyColumns}
            data={data.monthlyData}
            title="Monthly data"
            searchPlaceholder="Search months…"
            emptyState={
              <EmptyState
                title="No monthly data"
                description="Data appears once enrolments are certified."
              />
            }
          />
        </TabsContent>

        <TabsContent value="verification">
          <VerificationQueue onChanged={() => void fetchData()} />
        </TabsContent>

        <TabsContent value="marketplace">
          <JobMarketplacePanel
            marketplace={data.jobMarketplace ?? null}
            onRefresh={() => void fetchData()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
