"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { number } from "~/lib/format";
import { EmptyState } from "~/components/patterns/empty-state";
import type { CenterStanding } from "./types";

/** Ordinal suffix for the center's leaderboard rank (§9.1 side card). */
function ordinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

/** Institute peer ranking (INST-04): the center's standing vs peers (§9.1 side-card slot). */
export function PeerRankingCard({
  standing,
  className,
}: {
  standing: CenterStanding | null;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Center standing</CardTitle>
          <CardDescription>
            {standing ? standing.centerName : "Your center"} vs peer centers.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon-xs" asChild aria-label="Open analytics">
          <Link href="/institute/analytics">
            <ArrowUpRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {standing === null ? (
          <EmptyState
            icon={<Trophy />}
            title="Not ranked yet"
            description="Your center appears once outcomes are recorded across centers."
          />
        ) : (
          <>
            <p className="text-stat font-semibold tabular-nums">
              {ordinal(standing.rank)}
              <span className="ml-2 text-body-sm font-normal text-muted-foreground">
                of {number(standing.totalCenters)} centers
              </span>
            </p>
            <p className="mt-1 text-caption text-muted-foreground">
              Ranked by overall score across all centers.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
              <div>
                <p className="text-body-sm font-semibold tabular-nums">
                  {number(standing.overallScore)}
                </p>
                <p className="text-caption text-muted-foreground">Overall</p>
              </div>
              <div>
                <p className="text-body-sm font-semibold tabular-nums">
                  {number(standing.placementScore)}
                </p>
                <p className="text-caption text-muted-foreground">Placement</p>
              </div>
              <div>
                <p className="text-body-sm font-semibold tabular-nums">
                  {number(standing.academicScore)}
                </p>
                <p className="text-caption text-muted-foreground">Academic</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
