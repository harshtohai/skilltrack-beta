"use client";

import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { ChartCard } from "~/components/patterns/chart-card";
import type { InstituteAnalyticsData } from "./types";

/** Monthly comparisons (§4.11 — chart tokens, built-in legends, semantic names). */
export function MonthlyCharts({ data }: { data: InstituteAnalyticsData }) {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Placement rate: your institute vs peer average"
        description={`Peer average across ${data.peerComparison.centerCount} centers.`}
      >
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
      </ChartCard>

      <ChartCard
        title="Retention rate: your institute vs benchmark"
        description="60% state benchmark."
      >
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
      </ChartCard>

      <ChartCard
        title="Verified employment rate trend"
        description="Verified employment and wage progression per month."
      >
        <LineChart
          data={data.monthlyData.map((d) => ({
            name: d.month,
            verifiedRate: d.verifiedRate,
            wageProgressionRate: d.wageProgressionRate,
          }))}
          xKey="month"
          height={320}
          lines={[
            { key: "verifiedRate", label: "Verified Rate" },
            { key: "wageProgressionRate", label: "Wage Progression" },
          ]}
          yAxisLabel="Rate (%)"
        />
      </ChartCard>

      <ChartCard title="Monthly volume trends" description="Counts per month.">
        <LineChart
          data={data.monthlyData.map((d) => ({
            name: d.month,
            certified: d.certified,
            employed: d.employed,
            retained90: d.retained90,
          }))}
          xKey="month"
          height={320}
          lines={[
            { key: "certified", label: "Certified" },
            { key: "employed", label: "Employed" },
            { key: "retained90", label: "Retained 90-Day" },
          ]}
          yAxisLabel="Count"
        />
      </ChartCard>
    </div>
  );
}
