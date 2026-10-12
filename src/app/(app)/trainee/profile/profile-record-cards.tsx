"use client";

import { Briefcase, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { EmptyState } from "~/components/patterns/empty-state";
import { cn } from "~/lib/utils";
import { date, datetime } from "~/lib/format";
import type { TraineeProfile } from "./profile-sections";

/**
 * Trainee profile record cards (§9.7 rows pattern): employment history and
 * outcome checkpoints. Read-only — data comes from the page's /trainee/me
 * load. Row markup is byte-identical to the original inline cards. The
 * certificates card was replaced by the interactive certificates section
 * (~/components/trainee/certificates-section, T2).
 */

export function EmploymentHistoryCard({
  employmentHistory,
}: {
  employmentHistory: TraineeProfile["employmentHistory"];
}) {
  return (
    <Card id="employment" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Employment History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {employmentHistory.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="No employment history yet"
            description="Your verified work experience will appear here."
          />
        ) : (
          employmentHistory.map((job) => (
            <div key={job.id} className="flex items-center justify-between gap-4 border-b py-4">
              <div className="min-w-0">
                <p className="text-body-sm font-medium">{job.employer}</p>
                <p className="text-caption text-muted-foreground">{job.role ?? "—"}</p>
              </div>
              <div className="shrink-0 text-right">
                {job.isCurrent && <Badge variant="success">Current</Badge>}
                <p className={cn("text-caption text-muted-foreground", job.isCurrent && "mt-1")}>
                  {date(job.startDate)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function OutcomeCheckpointsCard({
  outcomeEvents,
}: {
  outcomeEvents: TraineeProfile["outcomeEvents"];
}) {
  return (
    <Card id="outcomes" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Outcome Checkpoints</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {outcomeEvents.length === 0 ? (
          <EmptyState
            icon={<Target />}
            title="No outcome checkpoints yet"
            description="Your 30/90-day follow-up outcomes will appear here."
          />
        ) : (
          outcomeEvents.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-4 border-b py-4">
              <span className="text-body-sm font-medium">{o.checkpointDays}-day checkpoint</span>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.outcomeStatus as StatusKey} />
                <span className="text-caption text-muted-foreground">{datetime(o.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
