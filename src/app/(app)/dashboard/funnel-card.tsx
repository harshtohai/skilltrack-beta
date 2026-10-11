"use client";

import { BadgeCheck, Briefcase, GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { number } from "~/lib/format";
import { EmptyState } from "~/components/patterns/empty-state";
import type { KPIData } from "./types";

interface FunnelStage {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FUNNEL_STAGES: FunnelStage[] = [
  { key: "certified", label: "Certified", icon: GraduationCap },
  { key: "outcomeKnown", label: "Outcome known", icon: TrendingUp },
  { key: "employed", label: "Employed", icon: Briefcase },
  { key: "verified", label: "Verified", icon: BadgeCheck },
];

/** Outcome-funnel chart card (§9.1 analytics slot, 8/12). */
export function FunnelCard({
  funnel,
  className,
}: {
  funnel: KPIData["funnel"];
  className?: string;
}) {
  function getStageData(key: string): { count: number; label: string } {
    const funnelMap = funnel as Record<string, { count: number; label: string }>;
    return funnelMap[key] ?? { count: 0, label: "" };
  }

  const counts = FUNNEL_STAGES.map((s) => getStageData(s.key).count);
  const allZero = counts.every((c) => c === 0);
  const maxCount = Math.max(...counts);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Outcome funnel</CardTitle>
        <CardDescription>Certified trainees progressing to verified employment.</CardDescription>
      </CardHeader>
      <CardContent>
        {allZero ? (
          <EmptyState
            icon={<TrendingUp />}
            title="No outcome data yet"
            description="Stages fill in as trainees are certified and outcomes are recorded."
          />
        ) : (
          <div className="space-y-4">
            {FUNNEL_STAGES.map((stage, index) => {
              const data = getStageData(stage.key);
              const Icon = stage.icon;
              const width = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
              const prevCount = index >= 1 ? counts[index - 1]! : 0;
              const dropOff =
                prevCount > 0 ? Math.round(((prevCount - data.count) / prevCount) * 100) : 0;

              return (
                <div key={stage.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{number(data.count)}</span>
                      {dropOff > 0 && (
                        <Badge variant="secondary" className="text-caption">
                          -{dropOff}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-chart-1 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
