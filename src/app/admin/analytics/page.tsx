"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Building2, Users, TrendingUp, Target, Download, Filter, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { MetricCard } from "~/components/charts/MetricCard";
import { format } from "date-fns";

interface GovernmentAnalyticsData {
  timeWindow: string;
  labels: string[];
  monthlyData: MonthlyData[];
  overall: {
    totalCertified: number;
    totalEmployed: number;
    totalRetained: number;
    totalVerified: number;
  };
  targets: {
    placementRate: number;
    retentionRate: number;
    verifiedRate: number;
    wageProgressionRate: number;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface MonthlyData {
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
  expectedPlacement: number;
  expectedRetention: number;
  expectedVerified: number;
  expectedWageProgression: number;
}

const TIME_WINDOWS = [
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "24m", label: "Last 24 Months" },
  { value: "all", label: "All Time" },
];

export default function GovernmentAnalyticsDashboard() {
  const [data, setData] = useState<GovernmentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState("12m");
  const [programmeId, setProgrammeId] = useState("");
  const [district, setDistrict] = useState("");
  const [limit, setLimit] = useState("24");

  const DISTRICTS = [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
    "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
    "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
    "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ timeWindow, limit });
      if (programmeId) params.append("programmeId", programmeId);
      if (district) params.append("district", district);

      const res = await fetch(`/api/v1/analytics/government?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = (await res.json()) as GovernmentAnalyticsData;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch government analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [timeWindow, programmeId, district, limit, fetchData]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Government Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Expected vs Actual Outcomes — Longitudinal Tracking</p>
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
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Districts</SelectItem>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="36">36 Months</SelectItem>
                  <SelectItem value="48">48 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Certified"
            value={data.overall.totalCertified.toLocaleString()}
            subtitle={`${data.targets.placementRate}% target placement`}
            icon={<Users className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="Placement Rate"
            value={`${latest?.placementRate.toFixed(1) ?? 0}%`}
            trend={{ value: (latest?.placementRate ?? 0) - data.targets.placementRate, label: "vs Target" }}
            icon={<Target className="h-6 w-6 text-green-500" />}
            variant={latest && latest.placementRate >= data.targets.placementRate ? "success" : "default"}
          />
          <MetricCard
            title="90-Day Retention"
            value={`${latest?.retentionRate.toFixed(1) ?? 0}%`}
            trend={{ value: (latest?.retentionRate ?? 0) - data.targets.retentionRate, label: "vs Target" }}
            icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
            variant={latest && latest.retentionRate >= data.targets.retentionRate ? "success" : "default"}
          />
          <MetricCard
            title="Verified Employment"
            value={`${latest?.verifiedRate.toFixed(1) ?? 0}%`}
            trend={{ value: (latest?.verifiedRate ?? 0) - data.targets.verifiedRate, label: "vs Target" }}
            icon={<Building2 className="h-6 w-6 text-orange-500" />}
            variant={latest && latest.verifiedRate >= data.targets.verifiedRate ? "success" : "default"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Placement Rate: Expected vs Actual</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-400" />
                  Expected (70%)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={data.monthlyData.map((d) => ({
                  name: d.month,
                  actual: d.placementRate,
                  expected: d.expectedPlacement,
                }))}
                xKey="name"
                height={300}
                yAxisLabel="Placement Rate (%)"
                colors={{ actual: "#3b82f6", expected: "#94a3b8" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>90-Day Retention: Expected vs Actual</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-purple-500" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-400" />
                  Expected (60%)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={data.monthlyData.map((d) => ({
                  name: d.month,
                  actual: d.retentionRate,
                  expected: d.expectedRetention,
                }))}
                xKey="name"
                height={300}
                yAxisLabel="Retention Rate (%)"
                colors={{ actual: "#8b5cf6", expected: "#94a3b8" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Verified Employment: Expected vs Actual</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-orange-500" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-400" />
                  Expected (50%)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={data.monthlyData.map((d) => ({
                  name: d.month,
                  actual: d.verifiedRate,
                  expected: d.expectedVerified,
                }))}
                xKey="name"
                height={300}
                yAxisLabel="Verified Rate (%)"
                colors={{ actual: "#f97316", expected: "#94a3b8" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Wage Progression: Expected vs Actual</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-400" />
                  Expected (30%)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                data={data.monthlyData.map((d) => ({
                  name: d.month,
                  actual: d.wageProgressionRate,
                  expected: d.expectedWageProgression,
                }))}
                xKey="name"
                height={300}
                yAxisLabel="Wage Progression Rate (%)"
                colors={{ actual: "#22c55e", expected: "#94a3b8" }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={data.monthlyData.map((d) => ({ name: d.month, ...d }))}
                xKey="month"
                height={350}
                lines={[
                  { key: "placementRate", label: "Placement Rate", color: "#3b82f6" },
                  { key: "retentionRate", label: "Retention Rate", color: "#8b5cf6" },
                  { key: "verifiedRate", label: "Verified Rate", color: "#f97316" },
                  { key: "wageProgressionRate", label: "Wage Progression", color: "#22c55e" },
                ]}
                yAxisLabel="Rate (%)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={data.monthlyData.map((d) => ({ name: d.month, ...d }))}
                xKey="month"
                height={350}
                lines={[
                  { key: "certified", label: "Certified", color: "#6366f1" },
                  { key: "employed", label: "Employed", color: "#3b82f6" },
                  { key: "retained90", label: "Retained 90-Day", color: "#8b5cf6" },
                  { key: "verifiedEmployed", label: "Verified Employed", color: "#f97316" },
                ]}
                yAxisLabel="Count"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Month</th>
                    <th className="pb-3 font-medium">Certified</th>
                    <th className="pb-3 font-medium">Employed</th>
                    <th className="pb-3 font-medium">Placement %</th>
                    <th className="pb-3 font-medium">Retained 90</th>
                    <th className="pb-3 font-medium">Retention %</th>
                    <th className="pb-3 font-medium">Verified %</th>
                    <th className="pb-3 font-medium">Wage Prog %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyData.map((row) => (
                    <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium">{row.month}</td>
                      <td className="py-3">{row.certified}</td>
                      <td className="py-3">{row.employed}</td>
                      <td className="py-3">{row.placementRate.toFixed(1)}%</td>
                      <td className="py-3">{row.retained90}</td>
                      <td className="py-3">{row.retentionRate.toFixed(1)}%</td>
                      <td className="py-3">{row.verifiedRate.toFixed(1)}%</td>
                      <td className="py-3">{row.wageProgressionRate.toFixed(1)}%</td>
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