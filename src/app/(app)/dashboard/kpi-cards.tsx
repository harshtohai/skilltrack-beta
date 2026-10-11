"use client";

import {
  AlertTriangle,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatCard } from "~/components/patterns/stat-card";
import { DotSparkline } from "~/components/viz/dot-sparkline";
import { kpiDelta, kpiSeries, type KpiMetric, type KpiSnapshotRow } from "~/lib/kpi-deltas";
import { number, percent } from "~/lib/format";
import type { KPIData } from "./types";

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

/** Admin KPI row (§9.1, 4-up). */
export function AdminKpiCards({ kpis, now }: { kpis: KPIData; now: Date }) {
  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* KPI row (§9.1) — delta chips + 7-day sparklines from the snapshot history
          (spec #80); they render only once real history exists (≥2 rows) */}
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
  );
}

/** Institute KPI row (§9.1, 4-up) — center-scoped numbers (INST-04). */
export function InstituteKpiCards({ kpis, now }: { kpis: KPIData; now: Date }) {
  // Placement rate per the scoring engine's basis: placed among trainees with
  // known outcomes (matches the cohort table's placementRate below).
  const placedRate =
    kpis.funnel.outcomeKnown.count > 0
      ? Math.round((kpis.funnel.employed.count / kpis.funnel.outcomeKnown.count) * 100)
      : 0;

  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* KPI row (§9.1) — center-scoped numbers with delta chips + 7-day sparklines
          from the snapshot history (spec #80); they render only once real history
          exists (≥2 rows) */}
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
  );
}
