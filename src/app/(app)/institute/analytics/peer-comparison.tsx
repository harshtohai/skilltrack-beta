"use client";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { PeerComparisonChart } from "~/components/charts/PeerComparisonChart";
import { ChartCard } from "~/components/patterns/chart-card";
import type { InstituteAnalyticsData, InstituteMonthlyData } from "./types";

/** Peer comparison charts (§4.11 — chart-3 series, grey peers, dashed average). */
export function PeerComparison({
  data,
  latest,
}: {
  data: InstituteAnalyticsData;
  /** Latest month with certified > 0 (API buckets run up to today). */
  latest: InstituteMonthlyData | undefined;
}) {
  const peer = data.peerComparison;
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Placement rate: your institute vs peers"
        description="Current entry highlighted; dashed line marks the peer average."
      >
        <PeerComparisonChart
          data={[
            {
              name: "Your Institute",
              value: latest?.placementRate ?? 0,
              isCurrent: true,
            },
            {
              name: "Peer Average",
              value: peer.avgPlacementRate,
              isCurrent: false,
            },
            {
              name: "Top Quartile",
              value: peer.topQuartilePlacementRate,
              isCurrent: false,
            },
            { name: "State Target", value: 70, isCurrent: false },
          ]}
          xKey="name"
          height={320}
          yAxisLabel="Placement Rate (%)"
          showAverage={true}
          averageValue={peer.avgPlacementRate}
        />
        <Alert variant="info" className="mt-4">
          <AlertTitle>Gap analysis</AlertTitle>
          <AlertDescription>
            Your institute is {peer.gaps.placementRate < 0 ? "below" : "above"}{" "}
            peer average by{" "}
            <span className="font-semibold">
              {Math.abs(peer.gaps.placementRate).toFixed(1)}%
            </span>{" "}
            across {peer.centerCount} centers.
          </AlertDescription>
        </Alert>
      </ChartCard>

      <ChartCard
        title="Retention rate vs peers"
        description="Current entry highlighted; dashed line marks the peer average."
      >
        <PeerComparisonChart
          data={[
            {
              name: "Your Institute",
              value: latest?.retentionRate ?? 0,
              isCurrent: true,
            },
            {
              name: "Peer Average",
              value: peer.avgRetentionRate,
              isCurrent: false,
            },
            {
              name: "Top Quartile",
              value: peer.topQuartileRetentionRate,
              isCurrent: false,
            },
            { name: "Benchmark", value: 60, isCurrent: false },
          ]}
          xKey="name"
          height={320}
          yAxisLabel="Retention Rate (%)"
          showAverage={true}
          averageValue={peer.avgRetentionRate}
        />
      </ChartCard>

      <ChartCard
        title="Wage progression vs peers"
        description="Current entry highlighted; dashed line marks the peer average."
      >
        <PeerComparisonChart
          data={[
            {
              name: "Your Institute",
              value: latest?.wageProgressionRate ?? 0,
              isCurrent: true,
            },
            {
              name: "Peer Average",
              value: peer.avgWageProgressionRate,
              isCurrent: false,
            },
            {
              name: "Top Quartile",
              value: peer.topQuartileWageProgressionRate,
              isCurrent: false,
            },
            { name: "State Target", value: 30, isCurrent: false },
          ]}
          xKey="name"
          height={320}
          yAxisLabel="Wage Progression Rate (%)"
          showAverage={true}
          averageValue={peer.avgWageProgressionRate}
        />
      </ChartCard>

      <ChartCard
        title="Certificates per trainee vs peers"
        description="Current entry highlighted; dashed line marks the peer average."
      >
        <PeerComparisonChart
          data={[
            {
              name: "Your Institute",
              value: data.overall.avgCertificatesPerTrainee,
              isCurrent: true,
            },
            {
              name: "Peer Average",
              value: peer.avgCertificatesPerTrainee,
              isCurrent: false,
            },
            {
              name: "Top Quartile",
              value: peer.topQuartileCertificatesPerTrainee,
              isCurrent: false,
            },
            { name: "Benchmark", value: 2, isCurrent: false },
          ]}
          xKey="name"
          height={320}
          yAxisLabel="Avg Certificates per Trainee"
          showAverage={true}
          averageValue={peer.avgCertificatesPerTrainee}
        />
      </ChartCard>
    </div>
  );
}
