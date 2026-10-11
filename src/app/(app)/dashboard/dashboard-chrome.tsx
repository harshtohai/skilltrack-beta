"use client";

import { RotateCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/patterns/page-header";
import { Skeleton } from "~/components/patterns/skeleton";
import { date as fmtDate } from "~/lib/format";

/** Relative time for the "Last updated" caption (§9.1); absolute past 24h. */
function timeAgo(d: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return fmtDate(d);
}

function welcomeTitle(userName: string): string {
  return userName.trim() !== "" ? `Welcome back, ${userName}` : "Welcome back";
}

/** §9.1 dashboard header — welcome title + "Last updated" caption + Refresh. */
function DashboardHeader({
  userName,
  updatedAt,
  refreshing,
  onRefresh,
}: {
  userName: string;
  updatedAt: Date | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}) {
  return (
    <PageHeader
      title={welcomeTitle(userName)}
      caption={updatedAt ? `Last updated ${timeAgo(updatedAt)}` : undefined}
      actions={
        <Button variant="outline" size="sm" onClick={() => void onRefresh()} disabled={refreshing}>
          <RotateCw className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      }
    />
  );
}

/** Shared loading skeleton (§9.1 layout: KPI row → analytics row → table). */
function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-14 w-72" />
      <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

export { DashboardHeader, DashboardSkeleton, welcomeTitle };
