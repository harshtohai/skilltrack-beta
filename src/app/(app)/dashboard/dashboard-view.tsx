"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Calendar,
  GraduationCap,
  MapPin,
  RotateCw,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { datetime } from "~/lib/format";
import { compact, number, percent, date as fmtDate } from "~/lib/format";
import { PageHeader } from "~/components/patterns/page-header";
import { StatCard } from "~/components/patterns/stat-card";
import { DotSparkline } from "~/components/viz/dot-sparkline";
import { kpiDelta, kpiSeries, type KpiMetric, type KpiSnapshotRow } from "~/lib/kpi-deltas";
import { DataTable, rowActionsColumn } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { TraineeJobsBoard } from "~/components/trainee/jobs-board";

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
  /** Daily snapshot history (spec #80): oldest → newest, last row = today when present. */
  history?: KpiSnapshotRow[];
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

/** Institute dashboard (INST-04): the center's standing from the scoring engine. */
interface CenterStanding {
  centerName: string;
  rank: number;
  totalCenters: number;
  overallScore: number;
  placementScore: number;
  academicScore: number;
  volumeScore: number;
}

interface InstituteCohort {
  id: string;
  name: string;
  programme: string;
  trainees: number;
  placementRate: number;
}

interface StandingResponse {
  standing: CenterStanding | null;
  cohorts: InstituteCohort[];
}

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

/** Ordinal suffix for the center's leaderboard rank (§9.1 side card). */
function ordinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

/** Sparkline color per card chip (§4.14): chart-1 orange / chart-2 purple / chart-3 blue. */
const SPARKLINE_COLOR = {
  brand: "var(--chart-1)",
  purple: "var(--chart-2)",
  blue: "var(--chart-3)",
} as const;

/**
 * Delta chip + sparkline wiring for a KPI card (spec #80). Deltas and the
 * sparkline render only when real snapshot history exists (≥2 rows); day-one
 * deploys show no fabricated deltas. Spread into a StatCard.
 */
function kpiTrend(
  history: KpiSnapshotRow[] | undefined,
  now: Date,
  metric: KpiMetric,
  chip: keyof typeof SPARKLINE_COLOR,
  ariaLabel: string,
): { delta?: number; deltaLabel?: string; sparkline?: React.ReactNode } {
  if (!history || history.length < 2) return {};
  const d = kpiDelta(history, now, metric);
  return {
    delta: d?.delta,
    deltaLabel: d?.label,
    sparkline: (
      <DotSparkline
        data={kpiSeries(history, metric)}
        color={SPARKLINE_COLOR[chip]}
        ariaLabel={ariaLabel}
      />
    ),
  };
}

/** Shared loading skeleton (§9.1 layout: KPI row → analytics row → table). */
function DashboardSkeleton() {
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

/* ------------------------------------------------------------------ */
/* Admin + institute KPI views (§9.1)                                  */
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

/** Institute peer ranking (INST-04): the center's standing vs peers (§9.1 side-card slot). */
function PeerRankingCard({
  standing,
  className,
}: {
  standing: CenterStanding | null;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Center standing</CardTitle>
          <CardDescription>
            {standing ? standing.centerName : "Your center"} vs peer centers.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon-xs" asChild aria-label="Open analytics">
          <Link href="/institute/analytics">
            <ArrowUpRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {standing === null ? (
          <EmptyState
            icon={<Trophy />}
            title="Not ranked yet"
            description="Your center appears once outcomes are recorded across centers."
          />
        ) : (
          <>
            <p className="text-stat font-semibold tabular-nums">
              {ordinal(standing.rank)}
              <span className="ml-2 text-body-sm font-normal text-muted-foreground">
                of {number(standing.totalCenters)} centers
              </span>
            </p>
            <p className="mt-1 text-caption text-muted-foreground">
              Ranked by overall score across all centers.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
              <div>
                <p className="text-body-sm font-semibold tabular-nums">
                  {number(standing.overallScore)}
                </p>
                <p className="text-caption text-muted-foreground">Overall</p>
              </div>
              <div>
                <p className="text-body-sm font-semibold tabular-nums">
                  {number(standing.placementScore)}
                </p>
                <p className="text-caption text-muted-foreground">Placement</p>
              </div>
              <div>
                <p className="text-body-sm font-semibold tabular-nums">
                  {number(standing.academicScore)}
                </p>
                <p className="text-caption text-muted-foreground">Academic</p>
              </div>
            </div>
          </>
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
                      {event.traineeName} • {datetime(event.date)}
                    </p>
                    <Link
                      href={`/trainees/${event.traineePublicId}`}
                      className="text-caption text-primary-strong hover:underline"
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

  const fetchData = useCallback(async (fresh = false) => {
    try {
      const [kpisRes, cohortsRes, districtsRes] = await Promise.all([
        // fresh=1 (Refresh button) skips today's snapshot read → live recompute
        // + upsert, so the shared snapshot row refreshes for every viewer
        fetch(`/api/v1/kpis/overview${fresh ? "?fresh=1" : ""}`),
        fetch("/api/v1/cohorts"),
        fetch("/api/v1/kpis/districts"),
      ]);
      if (kpisRes.status === 429) {
        // Refresh pressed inside the 30s cooldown (fresh=1 is the only 429
        // path) — keep the current cards, nudge via toast instead of
        // replacing the dashboard with an error state.
        const body = (await kpisRes.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.info(body?.error?.message ?? "KPI refresh is cooling down — try again shortly");
        return;
      }
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
    await fetchData(true);
    setRefreshing(false);
  };

  if (loading && !kpis) return <DashboardSkeleton />;

  if (error || !kpis) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description="The data didn't arrive. Check your connection and retry."
        onRetry={() => void fetchData()}
      />
    );
  }

  // "Today" for the delta guards (spec #80) — the browser clock, injected into
  // the pure helpers so tests stay deterministic.
  const now = new Date();

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

      {/* KPI row (§9.1) — delta chips + 7-day sparklines from the snapshot history
          (spec #80); they render only once real history exists (≥2 rows) */}
      <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total trainees"
          value={number(kpis.trainees.total)}
          icon={<Users />}
          chip="brand"
          href="/trainees"
          {...kpiTrend(kpis.history, now, "totalTrainees", "brand", "Total trainees, last 7 days")}
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
          {...kpiTrend(
            kpis.history,
            now,
            "outcomeCoverage",
            "purple",
            "Outcome coverage, last 7 days",
          )}
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
          {...kpiTrend(
            kpis.history,
            now,
            "verifiedEmployment",
            "blue",
            "Verified employment, last 7 days",
          )}
        />
        <StatCard
          title="Conflicts"
          value={number(kpis.conflicts.count)}
          icon={<AlertTriangle />}
          chip="brand"
          goodDirection="down"
          href="/conflicts"
          {...kpiTrend(kpis.history, now, "conflicts", "brand", "Conflicts, last 7 days")}
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

const instituteCohortColumns: ColumnDef<InstituteCohort, unknown>[] = [
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
    id: "trainees",
    accessorFn: (row) => row.trainees,
    header: "Trainees",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.trainees)}</span>,
  },
  {
    id: "placementRate",
    accessorFn: (row) => row.placementRate,
    header: "Placement rate",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {percent(row.original.placementRate, { sign: false, digits: 1 })}
      </span>
    ),
  },
  rowActionsColumn((row) => (
    <Button variant="ghost" size="icon-xs" asChild aria-label={`Open ${row.name}`}>
      <Link href={`/cohorts/${row.id}`}>
        <ArrowUpRight />
      </Link>
    </Button>
  )),
];

/**
 * Institute dashboard (INST-04): the §9.1 KPI view with center-scoped numbers
 * from /api/v1/kpis/overview and peer ranking from /api/v1/kpis/center-standing.
 */
function InstituteDashboard({ userName }: { userName: string }) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [standing, setStanding] = useState<CenterStanding | null>(null);
  const [cohorts, setCohorts] = useState<InstituteCohort[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fresh = false) => {
    try {
      const [kpisRes, standingRes] = await Promise.all([
        fetch(`/api/v1/kpis/overview${fresh ? "?fresh=1" : ""}`),
        fetch("/api/v1/kpis/center-standing"),
      ]);
      if (!kpisRes.ok || !standingRes.ok) throw new Error("Failed to fetch data");

      const kpisData = (await kpisRes.json()) as KPIData;
      const standingData = (await standingRes.json()) as StandingResponse;

      setKpis(kpisData);
      setStanding(standingData.standing);
      setCohorts(standingData.cohorts);
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
    await fetchData(true);
    setRefreshing(false);
  };

  if (loading && !kpis) return <DashboardSkeleton />;

  if (error || !kpis) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description="The data didn't arrive. Check your connection and retry."
        onRetry={() => void fetchData()}
      />
    );
  }

  // Placement rate per the scoring engine's basis: placed among trainees with
  // known outcomes (matches the cohort table's placementRate below).
  const placedRate =
    kpis.funnel.outcomeKnown.count > 0
      ? Math.round((kpis.funnel.employed.count / kpis.funnel.outcomeKnown.count) * 100)
      : 0;

  // "Today" for the delta guards (spec #80) — the browser clock, injected into
  // the pure helpers so tests stay deterministic.
  const now = new Date();

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

      {/* KPI row (§9.1) — center-scoped numbers with delta chips + 7-day sparklines
          from the snapshot history (spec #80); they render only once real history
          exists (≥2 rows) */}
      <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Trainees produced"
          value={number(kpis.trainees.total)}
          icon={<Users />}
          chip="brand"
          href="/trainees"
          {...kpiTrend(kpis.history, now, "totalTrainees", "brand", "Trainees produced, last 7 days")}
        />
        <StatCard
          title="Certified"
          value={number(kpis.funnel.certified.count)}
          icon={<GraduationCap />}
          chip="purple"
          {...kpiTrend(kpis.history, now, "certified", "purple", "Certified, last 7 days")}
        />
        <StatCard
          title="Placed"
          value={number(kpis.funnel.employed.count)}
          icon={<Briefcase />}
          chip="blue"
          {...kpiTrend(kpis.history, now, "placed", "blue", "Placed, last 7 days")}
        />
        <StatCard
          title="Placement rate"
          value={
            <span className="inline-flex items-baseline gap-2">
              {percent(placedRate, { sign: false, digits: 0 })}
              <span className="text-body-sm font-normal text-muted-foreground">
                {number(kpis.funnel.employed.count)}/{number(kpis.funnel.outcomeKnown.count)} known
              </span>
            </span>
          }
          icon={<TrendingUp />}
          chip="brand"
          {...kpiTrend(kpis.history, now, "placementRate", "brand", "Placement rate, last 7 days")}
        />
      </div>

      {/* Analytics + table rows (§9.1): funnel 8/12 · standing 4/12 · cohorts 8/12 · activity 4/12 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FunnelCard funnel={kpis.funnel} className="lg:col-span-2" />
        <PeerRankingCard standing={standing} />
        <div className="lg:col-span-2">
          <DataTable
            columns={instituteCohortColumns}
            data={cohorts}
            loading={loading}
            title="Cohort performance"
            emptyState={
              <EmptyState
                title="No cohorts yet"
                description="Cohorts appear here once trainees are enrolled at your center."
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
                  {cohort.programme} · {number(cohort.trainees)} trainees ·{" "}
                  {percent(cohort.placementRate, { sign: false, digits: 1 })} placed
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

export function DashboardView({
  userName,
  isTrainee,
  isInstitute = false,
}: {
  userName: string;
  isTrainee: boolean;
  isInstitute?: boolean;
}) {
  // Trainees land on the jobs board (UI-09); institutes get the center-scoped
  // §9.1 KPI view (INST-04); admin gets the unscoped KPI view.
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

  if (isInstitute) {
    return <InstituteDashboard userName={userName} />;
  }

  return <AdminDashboard userName={userName} />;
}
