"use client";

import { Users, TrendingUp, Target, Award } from "lucide-react";
import { StatCard } from "~/components/patterns/stat-card";
import { number, percent } from "~/lib/format";
import type { InstituteAnalyticsData, InstituteMonthlyData } from "./types";

/** KPI row (§9.10) — deltas are vs peer avg / benchmark (real values). */
export function KpiCards({
  data,
  latest,
}: {
  data: InstituteAnalyticsData;
  /** Latest month with certified > 0 (API buckets run up to today). */
  latest: InstituteMonthlyData | undefined;
}) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total certified"
        value={
          <>
            {number(data.overall.totalCertified)}{" "}
            <span className="text-body-sm text-muted-foreground font-normal">
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
        delta={
          (latest?.placementRate ?? 0) - data.peerComparison.avgPlacementRate
        }
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
            <span className="text-body-sm text-muted-foreground font-normal">
              {number(data.overall.totalCertificates)} total
            </span>
          </>
        }
        icon={<Award />}
        chip="brand"
      />
    </div>
  );
}
