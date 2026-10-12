"use client";

import { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PageHeader } from "~/components/patterns/page-header";
import { DataTable } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { FilterBar } from "~/components/patterns/filter-bar";
import { TimeWindowSelect } from "~/components/patterns/time-window-select";
import { ProgrammeSelect } from "~/components/patterns/programme-select";
import { downloadCsvFile } from "~/lib/csv";
import { KpiCards } from "./kpi-cards";
import { MonthlyCharts } from "./monthly-charts";
import { PeerComparison } from "./peer-comparison";
import { cohortColumns } from "./columns";
import type { InstituteAnalyticsData } from "./types";

/** Client-side CSV export of the cohort performance table (idea bag #6). */
function downloadCsv(data: InstituteAnalyticsData) {
  downloadCsvFile(
    `institute-cohorts-${data.timeWindow}.csv`,
    [
      "Cohort",
      "Programme",
      "Trainees",
      "Placement %",
      "Retention %",
      "Verified %",
      "Wage Progression %",
      "Certs/Trainee",
    ],
    data.cohorts.map((c) => [
      `"${c.name}"`,
      `"${c.programme}"`,
      c.traineeCount,
      c.placementRate.toFixed(1),
      c.retentionRate.toFixed(1),
      c.verifiedRate.toFixed(1),
      c.wageProgressionRate.toFixed(1),
      c.certificatesPerTrainee.toFixed(2),
    ]),
  );
}

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

      const res = await fetch(
        `/api/v1/outcomes/institute?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = (await res.json()) as InstituteAnalyticsData;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch institute analytics:", err);
      setError(
        "Failed to load analytics. If you use an ad blocker, please allow this site and retry.",
      );
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
        description={
          error || "The data didn't arrive. Check your connection and retry."
        }
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
            <TimeWindowSelect
              value={timeWindow}
              onValueChange={setTimeWindow}
            />
            <Button
              variant="outline"
              onClick={() => downloadCsv(data)}
              className="gap-2"
            >
              <Download />
              Export CSV
            </Button>
          </>
        }
      />

      {/* Programme / cohort filters (§9.4 toolbar row) */}
      <FilterBar
        className="mb-6"
        onClear={
          filtersActive
            ? () => {
                setProgrammeId("");
                setCohortId("");
              }
            : undefined
        }
      >
        <ProgrammeSelect value={programmeId} onValueChange={setProgrammeId} />
        <Select
          value={cohortId === "" ? "all" : cohortId}
          onValueChange={(v) => setCohortId(v === "all" ? "" : v)}
        >
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

      <KpiCards data={data} latest={latest} />

      <MonthlyCharts data={data} />

      <PeerComparison data={data} latest={latest} />

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
