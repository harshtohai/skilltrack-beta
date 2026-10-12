"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "~/components/patterns/page-header";
import { ErrorState } from "~/components/patterns/error-state";
import { TraineeJobsBoard } from "~/components/trainee/jobs-board";
import { AdminKpiCards, InstituteKpiCards } from "./kpi-cards";
import { FunnelCard } from "./funnel-card";
import { DistrictCard } from "./district-card";
import { PeerRankingCard } from "./peer-ranking-card";
import { AdminCohortTable, InstituteCohortTable } from "./cohort-table";
import { ActivityCard } from "./recent-activity";
import { DashboardHeader, DashboardSkeleton, welcomeTitle } from "./dashboard-chrome";
import type {
  CenterStanding,
  Cohort,
  DistrictPoint,
  DistrictsResponse,
  InstituteCohort,
  KPIData,
  StandingResponse,
} from "./types";

/* ------------------------------------------------------------------ */
/* Admin + institute KPI views (§9.1)                                  */
/* ------------------------------------------------------------------ */

function AdminDashboard({ userName }: { userName: string }) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [districts, setDistricts] = useState<DistrictPoint[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fresh = false) => {
    try {
      const [kpisRes, cohortsRes, districtsRes] = await Promise.all([
        // fresh=1 (Refresh button) skips today's snapshot read → live recompute
        // + upsert, so the shared snapshot row refreshes for every viewer
        fetch(`/api/v1/kpis/overview${fresh ? "?fresh=1" : ""}`),
        fetch("/api/v1/cohorts"),
        fetch("/api/v1/kpis/districts"),
      ]);
      if (kpisRes.status === 429) {
        // Refresh pressed inside the 30s cooldown (fresh=1 is the only 429
        // path) — keep the current cards, nudge via toast instead of
        // replacing the dashboard with an error state.
        const body = (await kpisRes.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.info(body?.error?.message ?? "KPI refresh is cooling down — try again shortly");
        return;
      }
      if (!kpisRes.ok || !cohortsRes.ok || !districtsRes.ok) throw new Error("Failed to fetch data");

      const kpisData = (await kpisRes.json()) as KPIData;
      const cohortsData = (await cohortsRes.json()) as { data?: Cohort[] };
      const districtsData = (await districtsRes.json()) as DistrictsResponse;

      setKpis(kpisData);
      setCohorts(cohortsData.data ?? []);
      setDistricts(districtsData.districts);
      setUpdatedAt(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  if (loading && !kpis) return <DashboardSkeleton />;

  if (error || !kpis) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description="The data didn't arrive. Check your connection and retry."
        onRetry={() => void fetchData()}
      />
    );
  }

  // "Today" for the delta guards (spec #80) — the browser clock, injected into
  // the pure helpers so tests stay deterministic.
  const now = new Date();

  return (
    <div>
      <DashboardHeader
        userName={userName}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={refetch}
      />

      <AdminKpiCards kpis={kpis} now={now} />

      {/* Analytics + table rows (§9.1): funnel 8/12 · districts 4/12 · cohorts 8/12 · activity 4/12 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FunnelCard funnel={kpis.funnel} className="lg:col-span-2" />
        <DistrictCard districts={districts} />
        <div className="lg:col-span-2">
          <AdminCohortTable cohorts={cohorts} loading={loading} />
        </div>
        <ActivityCard activity={kpis.recentActivity ?? []} />
      </div>
    </div>
  );
}

/**
 * Institute dashboard (INST-04): the §9.1 KPI view with center-scoped numbers
 * from /api/v1/kpis/overview and peer ranking from /api/v1/kpis/center-standing.
 */
function InstituteDashboard({ userName }: { userName: string }) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [standing, setStanding] = useState<CenterStanding | null>(null);
  const [cohorts, setCohorts] = useState<InstituteCohort[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (fresh = false) => {
    try {
      const [kpisRes, standingRes] = await Promise.all([
        fetch(`/api/v1/kpis/overview${fresh ? "?fresh=1" : ""}`),
        fetch("/api/v1/kpis/center-standing"),
      ]);
      if (!kpisRes.ok || !standingRes.ok) throw new Error("Failed to fetch data");

      const kpisData = (await kpisRes.json()) as KPIData;
      const standingData = (await standingRes.json()) as StandingResponse;

      setKpis(kpisData);
      setStanding(standingData.standing);
      setCohorts(standingData.cohorts);
      setUpdatedAt(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  if (loading && !kpis) return <DashboardSkeleton />;

  if (error || !kpis) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description="The data didn't arrive. Check your connection and retry."
        onRetry={() => void fetchData()}
      />
    );
  }

  // "Today" for the delta guards (spec #80) — the browser clock, injected into
  // the pure helpers so tests stay deterministic.
  const now = new Date();

  return (
    <div>
      <DashboardHeader
        userName={userName}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={refetch}
      />

      <InstituteKpiCards kpis={kpis} now={now} />

      {/* Analytics + table rows (§9.1): funnel 8/12 · standing 4/12 · cohorts 8/12 · activity 4/12 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FunnelCard funnel={kpis.funnel} className="lg:col-span-2" />
        <PeerRankingCard standing={standing} />
        <div className="lg:col-span-2">
          <InstituteCohortTable cohorts={cohorts} loading={loading} />
        </div>
        <ActivityCard activity={kpis.recentActivity ?? []} />
      </div>
    </div>
  );
}

export function DashboardView({
  userName,
  isTrainee,
  isInstitute = false,
}: {
  userName: string;
  isTrainee: boolean;
  isInstitute?: boolean;
}) {
  // Trainees land on the jobs board (UI-09); institutes get the center-scoped
  // §9.1 KPI view (INST-04); admin gets the unscoped KPI view.
  if (isTrainee) {
    return (
      <div>
        <PageHeader
          title={welcomeTitle(userName)}
          caption="Browse open jobs and track your applications."
        />
        <TraineeJobsBoard />
      </div>
    );
  }

  if (isInstitute) {
    return <InstituteDashboard userName={userName} />;
  }

  return <AdminDashboard userName={userName} />;
}
