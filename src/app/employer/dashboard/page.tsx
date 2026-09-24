"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, TrendingUp, ShieldCheck, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { MetricCard } from "~/components/charts/MetricCard";
import { LineChart } from "~/components/charts/LineChart";
import { ComparisonChart } from "~/components/charts/ComparisonChart";
import { PeerComparisonChart } from "~/components/charts/PeerComparisonChart";
import { formatDateTime } from "~/lib/utils";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

interface EmployerAnalytics {
  employer: {
    name: string;
    isDemo: boolean;
    totalClaims: number;
    verifiedClaims: number;
  };
  retention: {
    score: number | null;
    numerator: number;
    denominator: number;
  };
  ranking: {
    rank: number | null;
    of: number;
    peerAvg: number | null;
    peerTopQuartile: number | null;
  };
  timeline: Array<{ month: string; count: number }>;
  verificationHistory: Array<{ status: string; count: number }>;
  wageBands: Array<{ band: string; count: number }>;
  recentClaims: Array<{
    id: string;
    traineeId: string;
    employerName: string | null;
    role: string | null;
    salaryBand: string | null;
    verificationStatus: string;
    createdAt: string;
  }>;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<EmployerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/employer/me");
      if (res.status === 401) {
        router.push("/employer/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load employer analytics");
      setData((await res.json()) as EmployerAnalytics);
    } catch (err) {
      console.error("Employer dashboard error:", err);
      setError("Failed to load employer analytics");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error || "Failed to load"}</p>
      </div>
    );
  }

  const retentionScore = data.retention.score;
  const retentionDenominatorNote =
    data.retention.denominator > 0
      ? `${data.retention.numerator} of ${data.retention.denominator} confirmed claims sustained`
      : "Insufficient evidence — no confirmed claims with later checkpoint data";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
                <p className="text-sm text-gray-500">{data.employer.name}</p>
              </div>
            </div>
            {data.employer.isDemo && <Badge variant="secondary">Demo View</Badge>}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Metrics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Retention Score"
            value={retentionScore !== null ? `${retentionScore}` : "—"}
            subtitle={retentionDenominatorNote}
            icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
            variant={retentionScore !== null && retentionScore >= 50 ? "success" : "default"}
          />
          <MetricCard
            title="Total Claims"
            value={data.employer.totalClaims.toLocaleString()}
            subtitle="Employment claims recorded"
            icon={<Building2 className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="Verified Claims"
            value={data.employer.verifiedClaims.toLocaleString()}
            subtitle="Employer-confirmed or document-verified"
            icon={<ShieldCheck className="h-6 w-6 text-green-500" />}
          />
          <MetricCard
            title="Retention Rank"
            value={data.ranking.rank !== null ? `#${data.ranking.rank}` : "—"}
            subtitle={data.ranking.of > 0 ? `of ${data.ranking.of} employers` : "No scored peers yet"}
            icon={<BarChart3 className="h-6 w-6 text-orange-500" />}
          />
        </div>

        {/* Graphs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Claims Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {data.timeline.length === 0 ? (
                <p className="text-sm text-gray-500">No claims yet.</p>
              ) : (
                <LineChart
                  data={data.timeline.map((t) => ({ name: t.month, count: t.count }))}
                  xKey="name"
                  height={300}
                  lines={[{ key: "count", label: "Claims", color: "#3b82f6" }]}
                  yAxisLabel="Claims"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              {data.verificationHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No verification data yet.</p>
              ) : (
                <ComparisonChart
                  data={data.verificationHistory.map((v) => ({
                    name: v.status.replace(/_/g, " ").toLowerCase(),
                    actual: v.count,
                    expected: v.count,
                  }))}
                  xKey="name"
                  height={300}
                  yAxisLabel="Claims"
                  colors={{ actual: "#22c55e", expected: "#22c55e" }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wage Band Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {data.wageBands.length === 0 ? (
                <p className="text-sm text-gray-500">No salary data yet.</p>
              ) : (
                <ComparisonChart
                  data={data.wageBands.map((w) => ({
                    name: SALARY_BAND_LABELS[w.band] ?? w.band,
                    actual: w.count,
                    expected: w.count,
                  }))}
                  xKey="name"
                  height={300}
                  yAxisLabel="Claims"
                  colors={{ actual: "#f97316", expected: "#f97316" }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retention vs Peers</CardTitle>
            </CardHeader>
            <CardContent>
              {data.ranking.peerAvg === null ? (
                <p className="text-sm text-gray-500">No scored peers yet.</p>
              ) : (
                <PeerComparisonChart
                  data={[
                    { name: "Your Company", value: retentionScore ?? 0, isCurrent: true },
                    { name: "Peer Average", value: data.ranking.peerAvg, isCurrent: false },
                    { name: "Top Quartile", value: data.ranking.peerTopQuartile ?? data.ranking.peerAvg, isCurrent: false },
                  ]}
                  xKey="name"
                  height={300}
                  yAxisLabel="Retention Score"
                  color="#8b5cf6"
                  showAverage={true}
                  averageValue={data.ranking.peerAvg}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent claims table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentClaims.length === 0 ? (
              <p className="text-sm text-gray-500">No claims yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 font-medium">Trainee</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Salary Band</th>
                      <th className="pb-3 font-medium">Verification</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <span className="font-mono text-xs text-primary">{claim.traineeId.slice(0, 8)}…</span>
                        </td>
                        <td className="py-3">{claim.role ?? "—"}</td>
                        <td className="py-3">{claim.salaryBand ? SALARY_BAND_LABELS[claim.salaryBand] ?? claim.salaryBand : "—"}</td>
                        <td className="py-3">
                          <Badge
                            variant={claim.verificationStatus === "EMPLOYER_CONFIRMED" || claim.verificationStatus === "DOCUMENT_VERIFIED" ? "success" : "secondary"}
                          >
                            {claim.verificationStatus.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-3">{formatDateTime(new Date(claim.createdAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
