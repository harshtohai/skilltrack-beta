"use client";

import Link from "next/link";
import { Briefcase, Calendar, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/patterns/empty-state";
import { datetime } from "~/lib/format";
import type { KPIData } from "./types";

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FOLLOWUP: Calendar,
  CLAIM: Briefcase,
  VERIFICATION: ShieldCheck,
};

/** Recent-activity timeline card (§9.1 activity slot, 4/12). */
export function ActivityCard({
  activity,
  className,
}: {
  activity: NonNullable<KPIData["recentActivity"]>;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState
            icon={<Calendar />}
            title="No activity yet"
            description="Follow-ups, claims and verifications show up here."
          />
        ) : (
          <div className="space-y-4">
            {activity.map((event, index) => {
              const Icon = ACTIVITY_ICONS[event.type] ?? Calendar;
              return (
                <div key={`${event.type}-${event.date}-${index}`} className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
                      <Icon className="h-3.5 w-3.5 text-primary-strong" />
                    </div>
                    {index < activity.length - 1 && (
                      <div className="absolute bottom-0 left-3 top-7 w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-body-sm font-medium">{event.title}</p>
                    <p className="text-caption text-muted-foreground">
                      {event.traineeName} • {datetime(event.date)}
                    </p>
                    <Link
                      href={`/trainees/${event.traineePublicId}`}
                      className="text-caption text-primary-strong hover:underline"
                    >
                      View trainee
                    </Link>
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
