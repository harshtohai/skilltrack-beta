"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { compact, number } from "~/lib/format";
import { EmptyState } from "~/components/patterns/empty-state";
import type { DistrictPoint } from "./types";

const MAX_DISTRICT_BARS = 8;

/** District-distribution chart card (§9.1 map-card slot, 4/12). */
export function DistrictCard({
  districts,
  className,
}: {
  districts: DistrictPoint[];
  className?: string;
}) {
  const shown = districts.slice(0, MAX_DISTRICT_BARS);
  const max = Math.max(...shown.map((d) => d.count), 1);
  const total = districts.reduce((sum, d) => sum + d.count, 0);
  const avg = districts.length > 0 ? Math.round(total / districts.length) : 0;
  const top = districts[0];

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>District distribution</CardTitle>
          <CardDescription>Trainees by district.</CardDescription>
        </div>
        <Button variant="ghost" size="icon-xs" asChild aria-label="Open trainees">
          <Link href="/trainees">
            <ArrowUpRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <EmptyState
            icon={<MapPin />}
            title="No district data"
            description="Districts appear once trainees are added."
          />
        ) : (
          <div className="space-y-3">
            {shown.map((d) => (
              <div key={d.district} className="space-y-1">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="truncate font-medium">{d.district}</span>
                  <span className="tabular-nums text-muted-foreground">{number(d.count)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-chart-2 transition-all duration-500"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {districts.length > MAX_DISTRICT_BARS && (
              <p className="text-caption text-muted-foreground">
                Showing top {MAX_DISTRICT_BARS} of {number(districts.length)} districts
              </p>
            )}
          </div>
        )}

        {/* 3-stat footer (§9.1 map card slot) */}
        {districts.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
            <div>
              <p className="text-body-sm font-semibold tabular-nums">{number(districts.length)}</p>
              <p className="text-caption text-muted-foreground">Districts</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold">{top?.district ?? "—"}</p>
              <p className="text-caption text-muted-foreground">Top district</p>
            </div>
            <div>
              <p className="text-body-sm font-semibold tabular-nums">{compact(avg)}</p>
              <p className="text-caption text-muted-foreground">Avg per district</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
