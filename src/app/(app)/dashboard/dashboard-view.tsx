"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Users,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/utils";
import { compact, number, percent, date as fmtDate } from "~/lib/format";
import { PageHeader } from "~/components/patterns/page-header";
import { StatCard } from "~/components/patterns/stat-card";
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
