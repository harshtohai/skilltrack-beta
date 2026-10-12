"use client";

import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { DotForecast } from "~/components/viz/dot-forecast";
import { DataTable } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ChartCard } from "~/components/patterns/chart-card";
import { KpiCards } from "./kpi-cards";
import { leaderboardColumns, monthlyColumns } from "./columns";
import type { GovernmentAnalyticsData, MonthlyData } from "./types";

/**
 * Outcomes tab content (§4.14 DotForecast hero · §4.11 expected-vs-actual +
 * trend charts · §4.5 leaderboard and monthly tables; the §9.10 KPI row lives
 * in kpi-cards.tsx). Pure display — deltas and the latest-with-data month are
 * computed by the page.
 */
export function OutcomesTab({
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
    <>
      <KpiCards data={data} latest={latest} placementDelta={placementDelta} />

      {/* DotForecast hero (§4.14) — real monthly placement trend vs target bands */}
      <ChartCard
        className="mb-4"
        title="Placement trend"
        description={`Monthly placement rate vs the ${data.targets.placementRate}% target — each month is classified by its ratio to target.`}
      >
        <DotForecast
          data={data.monthlyData.map((d) => ({
            label: d.month,
            value: d.placementRate,
          }))}
          target={data.targets.placementRate}
          todayIndex={data.monthlyData.length - 1}
          growthPill={{
            value: `${placementDelta >= 0 ? "+" : ""}${placementDelta.toFixed(1)}%`,
            label: "vs target",
          }}
          ariaLabel="Monthly placement rate versus target"
        />
      </ChartCard>

      {/* Expected vs actual comparisons (§4.11 — chart tokens, built-in legends) */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Placement rate: expected vs actual"
          description={`Target ${data.targets.placementRate}%.`}
        >
          <ComparisonChart
            data={data.monthlyData.map((d) => ({
              name: d.month,
              actual: d.placementRate,
              expected: d.expectedPlacement,
            }))}
            xKey="name"
            height={320}
            yAxisLabel="Placement Rate (%)"
          />
        </ChartCard>

        <ChartCard
          title="90-day retention: expected vs actual"
          description={`Target ${data.targets.retentionRate}%.`}
        >
          <ComparisonChart
            data={data.monthlyData.map((d) => ({
              name: d.month,
              actual: d.retentionRate,
              expected: d.expectedRetention,
            }))}
            xKey="name"
            height={320}
            yAxisLabel="Retention Rate (%)"
          />
        </ChartCard>

        <ChartCard
          title="Verified employment: expected vs actual"
          description={`Target ${data.targets.verifiedRate}%.`}
        >
          <ComparisonChart
            data={data.monthlyData.map((d) => ({
              name: d.month,
              actual: d.verifiedRate,
              expected: d.expectedVerified,
            }))}
            xKey="name"
            height={320}
            yAxisLabel="Verified Rate (%)"
          />
        </ChartCard>

        <ChartCard
          title="Wage progression: expected vs actual"
          description={`Target ${data.targets.wageProgressionRate}%.`}
        >
          <ComparisonChart
            data={data.monthlyData.map((d) => ({
              name: d.month,
              actual: d.wageProgressionRate,
              expected: d.expectedWageProgression,
            }))}
            xKey="name"
            height={320}
            yAxisLabel="Wage Progression Rate (%)"
          />
        </ChartCard>
      </div>

      {/* Monthly trends (§4.11 line charts — chart token order, max 4 series) */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Monthly trends overview"
          description="Rates per month."
        >
          <LineChart
            data={data.monthlyData.map((d) => ({ name: d.month, ...d }))}
            xKey="month"
            height={320}
            lines={[
              { key: "placementRate", label: "Placement rate" },
              { key: "retentionRate", label: "Retention rate" },
              { key: "verifiedRate", label: "Verified Rate" },
              { key: "wageProgressionRate", label: "Wage Progression" },
            ]}
            yAxisLabel="Rate (%)"
          />
        </ChartCard>

        <ChartCard title="Volume metrics" description="Counts per month.">
          <LineChart
            data={data.monthlyData.map((d) => ({ name: d.month, ...d }))}
            xKey="month"
            height={320}
            lines={[
              { key: "certified", label: "Certified" },
              { key: "employed", label: "Employed" },
              { key: "retained90", label: "Retained 90-Day" },
              { key: "verifiedEmployed", label: "Verified Employed" },
            ]}
            yAxisLabel="Count"
          />
        </ChartCard>
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
    </>
  );
}
