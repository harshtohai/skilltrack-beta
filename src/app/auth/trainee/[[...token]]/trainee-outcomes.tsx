"use client";

import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/patterns/empty-state";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { datetime } from "~/lib/format";
import type { TraineeProfile } from "./profile-types";

/**
 * Outcomes tab: 30/90-day outcome checkpoints as left-accent cards, then
 * pending follow-up records. Statuses via StatusBadge only (§4.10/CL-12).
 */
export function TraineeOutcomesTab({ profile }: { profile: TraineeProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome History</CardTitle>
      </CardHeader>
      <CardContent>
        {profile.outcomeEvents.length === 0 && profile.followupEvents.length === 0 ? (
          <EmptyState
            icon={<Clock />}
            title="No outcome records yet"
            description="Your 30/90-day follow-up outcomes will appear here."
          />
        ) : (
          <div className="space-y-4">
            {profile.outcomeEvents.map((outcome) => (
              <Card key={outcome.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={outcome.outcomeStatus as StatusKey} />
                        <StatusBadge status={outcome.verificationStatus as StatusKey} />
                      </div>
                      <p className="mt-1 text-caption text-muted-foreground">
                        {outcome.checkpointDays}-day follow-up · {datetime(outcome.createdAt ?? "")}
                      </p>
                    </div>
                    {outcome.employmentClaim && (
                      <div className="text-body-sm text-muted-foreground sm:text-right">
                        <p>{outcome.employmentClaim.employerName ?? "Not specified"}</p>
                        <p>{outcome.employmentClaim.role ?? "Not specified"}</p>
                        <p>{outcome.employmentClaim.salaryBand ?? "Not specified"}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {profile.followupEvents.map((fe) => (
              <Card key={fe.id} className="border-l-4 border-l-border">
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium">{fe.checkpointDays}-day Follow-up</p>
                      <p className="mt-1 text-caption text-muted-foreground">
                        Channel: {fe.channel}
                        {fe.sentAt && ` · Sent: ${datetime(fe.sentAt)}`}
                        {fe.respondedAt && ` · Responded: ${datetime(fe.respondedAt)}`}
                      </p>
                    </div>
                    <StatusBadge status={fe.status as StatusKey} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
