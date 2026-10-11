"use client";

import { Building2, Target, TrendingUp, Users } from "lucide-react";
import { StatCard } from "~/components/patterns/stat-card";
import { number, percent } from "~/lib/format";
import type { GovernmentAnalyticsData, MonthlyData } from "./types";

/** KPI row (§9.10) — deltas are vs target (real values from the API). */
export function KpiCards({
  data,
  latest,
  placementDelta,
}: {
  data: GovernmentAnalyticsData;
  /** Latest month with certified > 0 (API buckets run up to today). */
  latest: MonthlyData | undefined;
  /** Latest placement rate minus target, in percent points. */
  placementDelta: number;
}) {
  return (
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
  );
}
