"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, ShieldCheck, AlertTriangle, Loader2, Calendar, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { formatDate, formatDateTime } from "~/lib/utils";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */

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

function DashboardContent() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [kpisRes, cohortsRes] = await Promise.all([
        fetch("/api/v1/kpis/overview"),
        fetch("/api/v1/cohorts"),
      ]);

      if (!kpisRes.ok || !cohortsRes.ok) throw new Error("Failed to fetch data");

      const kpisData = await kpisRes.json();
      const cohortsData = await cohortsRes.json();

      setKpis(kpisData);
      setCohorts(cohortsData.data || []);
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

      <CohortTable cohorts={cohorts} />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}