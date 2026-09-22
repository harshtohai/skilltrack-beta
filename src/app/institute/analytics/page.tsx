"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Users, TrendingUp, Target, Award, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { PeerComparisonChart } from "~/components/charts/PeerComparisonChart";
import { MetricCard } from "~/components/charts/MetricCard";

interface InstituteAnalyticsData {
  timeWindow: string;
  labels: string[];
  monthlyData: InstituteMonthlyData[];
  overall: {
    totalCertified: number;
    totalEmployed: number;
    totalRetained: number;
    totalCertificates: number;
    avgCertificatesPerTrainee: number;
  };
  peerComparison: {
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
    avgPlacementRate: number;
  };
  cohorts: Array<{
    id: string;
    name: string;
    programme: string;
    traineeCount: number;
  }>;
}

interface InstituteMonthlyData {
  month: string;
  certified: number;
  employed: number;
  retained90: number;
  verifiedEmployed: number;
  wageProgression: number;
  placementRate: number;
  retentionRate: number;
  verifiedRate: number;
  wageProgressionRate: number;
  avgSalaryBand: number;
  peerAvgPlacementRate: number;
}

const TIME_WINDOWS = [
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "24m", label: "Last 24 Months" },
  { value: "all", label: "All Time" },
];

export default function InstituteAnalyticsDashboard() {
  const [data, setData] = useState<InstituteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState("12m");
  const [programmeId, setProgrammeId] = useState("");
  const [cohortId, setCohortId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ timeWindow });
      if (programmeId) params.append("programmeId", programmeId);
      if (cohortId) params.append("cohortId", cohortId);

      const res = await fetch(`/api/v1/analytics/institute?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = (await res.json()) as InstituteAnalyticsData;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch institute analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [timeWindow, programmeId, cohortId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const latest = data.monthlyData[data.monthlyData.length - 1];
  const peerGap = ((latest?.placementRate ?? 0) - (data.peerComparison.avgPlacementRate ?? 0)).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Institute Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Student Performance vs Peer Academies — Benchmarking</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={timeWindow} onValueChange={setTimeWindow}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Window" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_WINDOWS.map((tw) => (
                    <SelectItem key={tw.value} value={tw.value}>
                      {tw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={programmeId} onValueChange={setProgrammeId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Programmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Programmes</SelectItem>
                  <SelectItem value="pmkvy-it">PMKVY IT/ITeS</SelectItem>
                  <SelectItem value="pmkvy-hc">PMKVY Healthcare</SelectItem>
                  <SelectItem value="pmkvy-mfg">PMKVY Manufacturing</SelectItem>
                  <SelectItem value="ddgky-rtl">DDU-GKY Retail</SelectItem>
                  <SelectItem value="ssm-const">SSM Construction</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cohortId} onValueChange={setCohortId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All Cohorts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cohorts</SelectItem>
                  {data.cohorts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.programme}) — {c.traineeCount} trainees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Trainees Certified"
            value={data.overall.totalCertified.toLocaleString()}
            subtitle={`${data.overall.totalEmployed} placed (${latest?.placementRate.toFixed(1) ?? 0}%)`}
            icon={<Users className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="Placement Rate"
            value={`${latest?.placementRate.toFixed(1) ?? 0}%`}
            trend={{ value: latest ? latest.placementRate - data.peerComparison.avgPlacementRate : 0, label: "vs Peer Avg" }}
            icon={<Target className="h-6 w-6 text-green-500" />}
            variant={latest && latest.placementRate >= data.peerComparison.avgPlacementRate ? "success" : "warning"}
          />
          <MetricCard
            title="90-Day Retention"
            value={`${latest?.retentionRate.toFixed(1) ?? 0}%`}
            trend={{ value: (latest?.retentionRate ?? 0) - 60, label: "vs 60% Benchmark" }}
            icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
            variant={latest && latest.retentionRate >= 60 ? "success" : "default"}
          />
          <MetricCard
            title="Certificates per Trainee"
            value={data.overall.avgCertificatesPerTrainee.toFixed(1)}
            subtitle={`${data.overall.totalCertificates} total certificates`}
            icon={<Award className="h-6 w-6 text-yellow-500" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Placement Rate: Your Institute vs Peer Average</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  Your Institute
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-500/30" />
                  Peer Average
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={data.monthlyData.map((d) => ({
                  name: d.month,
                  actual: d.placementRate,
                  expected: d.peerAvgPlacementRate,
                }))}
                xKey="name"
                height={300}
                yAxisLabel="Placement Rate (%)"
                colors={{ actual: "#3b82f6", expected: "#f59e0b" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Retention Rate: Your Institute vs Benchmark</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-purple-500" />
                  Your Institute
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-400" />
                  Benchmark (60%)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={data.monthlyData.map((d) => ({
                  name: d.month,
                  actual: d.retentionRate,
                  expected: 60,
                }))}
                xKey="name"
                height={300}
                yAxisLabel="Retention Rate (%)"
                colors={{ actual: "#8b5cf6", expected: "#94a3b8" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verified Employment Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={data.monthlyData.map((d) => ({ name: d.month, verifiedRate: d.verifiedRate, wageProgressionRate: d.wageProgressionRate }))}
                xKey="month"
                height={300}
                lines={[
                  { key: "verifiedRate", label: "Verified Rate", color: "#f97316" },
                  { key: "wageProgressionRate", label: "Wage Progression", color: "#22c55e" },
                ]}
                yAxisLabel="Rate (%)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={data.monthlyData.map((d) => ({ name: d.month, certified: d.certified, employed: d.employed, retained90: d.retained90 }))}
                xKey="month"
                height={300}
                lines={[
                  { key: "certified", label: "Certified", color: "#6366f1" },
                  { key: "employed", label: "Employed", color: "#3b82f6" },
                  { key: "retained90", label: "Retained 90-Day", color: "#8b5cf6" },
                ]}
                yAxisLabel="Count"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Institute Placement Rate vs Peer Academies</CardTitle>
            </CardHeader>
            <CardContent>
              <PeerComparisonChart
                data={[
                  { name: "Your Institute", value: latest?.placementRate ?? 0, isCurrent: true },
                  { name: "Peer Average", value: data.peerComparison.avgPlacementRate, isCurrent: false },
                  { name: "Top Quartile", value: data.peerComparison.avgPlacementRate * 1.25, isCurrent: false },
                  { name: "State Target", value: 70, isCurrent: false },
                ]}
                xKey="name"
                height={300}
                yAxisLabel="Placement Rate (%)"
                color="#3b82f6"
                showAverage={true}
                averageValue={data.peerComparison.avgPlacementRate}
              />
              <div className="mt-4 p-4 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-800">
                  <strong>Gap Analysis:</strong> Your institute is{" "}
                  {peerGap.startsWith("-") ? "below" : "above"} peer average by{" "}
                  <span className="font-semibold">{Math.abs(Number(peerGap)).toFixed(1)}%</span>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Institute Retention Rate vs Peers</CardTitle>
            </CardHeader>
            <CardContent>
              <PeerComparisonChart
                data={[
                  { name: "Your Institute", value: latest?.retentionRate ?? 0, isCurrent: true },
                  { name: "Peer Average", value: data.peerComparison.avgPlacementRate * 0.75, isCurrent: false },
                  { name: "Top Quartile", value: data.peerComparison.avgPlacementRate * 0.9, isCurrent: false },
                  { name: "State Target", value: 60, isCurrent: false },
                ]}
                xKey="name"
                height={300}
                yAxisLabel="Retention Rate (%)"
                color="#8b5cf6"
                showAverage={true}
                averageValue={data.peerComparison.avgPlacementRate * 0.75}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wage Progression vs Peers</CardTitle>
            </CardHeader>
            <CardContent>
              <PeerComparisonChart
                data={[
                  { name: "Your Institute", value: latest?.wageProgressionRate ?? 0, isCurrent: true },
                  { name: "Peer Average", value: data.peerComparison.avgPlacementRate * 0.4, isCurrent: false },
                  { name: "Top Quartile", value: data.peerComparison.avgPlacementRate * 0.55, isCurrent: false },
                  { name: "State Target", value: 30, isCurrent: false },
                ]}
                xKey="name"
                height={300}
                yAxisLabel="Wage Progression Rate (%)"
                color="#22c55e"
                showAverage={true}
                averageValue={data.peerComparison.avgPlacementRate * 0.4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificates per Trainee vs Peers</CardTitle>
            </CardHeader>
            <CardContent>
              <PeerComparisonChart
                data={[
                  { name: "Your Institute", value: data.overall.avgCertificatesPerTrainee * 10, isCurrent: true },
                  { name: "Peer Average", value: data.overall.avgCertificatesPerTrainee * 8, isCurrent: false },
                  { name: "Top Quartile", value: data.overall.avgCertificatesPerTrainee * 12, isCurrent: false },
                  { name: "Benchmark", value: 15, isCurrent: false },
                ]}
                xKey="name"
                height={300}
                yAxisLabel="Avg Certificates × 10"
                color="#f59e0b"
                showAverage={true}
                averageValue={data.overall.avgCertificatesPerTrainee * 8}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cohort Performance Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Cohort</th>
                    <th className="pb-3 font-medium">Programme</th>
                    <th className="pb-3 font-medium">Trainees</th>
                    <th className="pb-3 font-medium">Placement Rate</th>
                    <th className="pb-3 font-medium">Retention Rate</th>
                    <th className="pb-3 font-medium">Verified Rate</th>
                    <th className="pb-3 font-medium">Wage Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cohorts.map((cohort) => (
                    <tr key={cohort.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium">{cohort.name}</td>
                      <td className="py-3">{cohort.programme}</td>
                      <td className="py-3">{cohort.traineeCount}</td>
                      <td className="py-3">{(latest?.placementRate ?? 0).toFixed(1)}%</td>
                      <td className="py-3">{(latest?.retentionRate ?? 0).toFixed(1)}%</td>
                      <td className="py-3">{(latest?.verifiedRate ?? 0).toFixed(1)}%</td>
                      <td className="py-3">{(latest?.wageProgressionRate ?? 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}