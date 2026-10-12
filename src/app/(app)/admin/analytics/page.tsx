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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VerificationQueue } from "~/components/admin/verification-queue";
import { JobMarketplacePanel } from "~/components/admin/job-marketplace-panel";
import { PageHeader } from "~/components/patterns/page-header";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { FilterBar } from "~/components/patterns/filter-bar";
import { TimeWindowSelect } from "~/components/patterns/time-window-select";
import { ProgrammeSelect } from "~/components/patterns/programme-select";
import { downloadCsvFile } from "~/lib/csv";
import { MAHARASHTRA_DISTRICTS } from "~/lib/districts";
import { OutcomesTab } from "./outcomes-tab";
import type { GovernmentAnalyticsData } from "./types";

/** Client-side CSV export (idea bag #6 — real action, no backend route). */
function downloadCsv(data: GovernmentAnalyticsData, timeWindow: string) {
  downloadCsvFile(
    `government-analytics-${timeWindow}.csv`,
    [
      "Month",
      "Certified",
      "Employed",
      "Placement %",
      "Retained 90",
      "Retention %",
      "Verified %",
      "Wage Prog %",
    ],
    data.monthlyData.map((r) => [
      r.month,
      r.certified,
      r.employed,
      r.placementRate.toFixed(1),
      r.retained90,
      r.retentionRate.toFixed(1),
      r.verifiedRate.toFixed(1),
      r.wageProgressionRate.toFixed(1),
    ]),
  );
}

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
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
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

      const res = await fetch(
        `/api/v1/outcomes/government?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = (await res.json()) as GovernmentAnalyticsData;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch government analytics:", err);
      setError(
        "Failed to load analytics. If you use an ad blocker, please allow this site and retry.",
      );
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
        description={
          error || "The data didn't arrive. Check your connection and retry."
        }
        onRetry={() => void fetchData()}
      />
    );
  }

  const latest =
    [...data.monthlyData].reverse().find((m) => m.certified > 0) ??
    data.monthlyData[data.monthlyData.length - 1];
  const placementDelta =
    (latest?.placementRate ?? 0) - data.targets.placementRate;
  const filtersActive = programmeId !== "" || district !== "";

  return (
    <div>
      <PageHeader
        title="Government analytics"
        caption="Expected vs actual outcomes — longitudinal tracking."
        actions={
          <>
            <TimeWindowSelect
              value={timeWindow}
              onValueChange={setTimeWindow}
            />
            <Button
              variant="outline"
              onClick={() => downloadCsv(data, timeWindow)}
              className="gap-2"
            >
              <Download />
              Export CSV
            </Button>
          </>
        }
      />

      {/* Programme / district / table-depth filters (§9.4 toolbar row) */}
      <FilterBar
        className="mb-6"
        onClear={
          filtersActive
            ? () => {
                setProgrammeId("");
                setDistrict("");
              }
            : undefined
        }
      >
        <ProgrammeSelect value={programmeId} onValueChange={setProgrammeId} />
        <Select
          value={district === "" ? "all" : district}
          onValueChange={(v) => setDistrict(v === "all" ? "" : v)}
        >
          <SelectTrigger aria-label="District">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {MAHARASHTRA_DISTRICTS.map((d) => (
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
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="verification">Verification queue</TabsTrigger>
          <TabsTrigger value="marketplace">Job marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="outcomes">
          <OutcomesTab
            data={data}
            latest={latest}
            placementDelta={placementDelta}
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
