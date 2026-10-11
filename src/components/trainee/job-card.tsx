"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { date } from "~/lib/format";
import {
  EMPLOYMENT_TYPE_LABELS,
  SALARY_BAND_LABELS,
} from "~/lib/job-board-labels";
import type { PublicJob } from "~/lib/job-board-contracts";

// The trainee board uses the compact "Onsite" spelling (the employer-facing
// label map in ~/lib/job-board-labels says "On-site").
const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

export function JobCard({
  job,
  applying,
  onApply,
}: {
  job: PublicJob;
  applying: boolean;
  onApply: (jobId: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>{job.title}</CardTitle>
            <div className="text-body-sm text-muted-foreground mt-1 flex items-center gap-2">
              <span className="truncate">{job.companyName}</span>
              {job.employerVerified && (
                <Badge variant="success" className="text-caption gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
          </div>
          {job.applied && <Badge variant="info">Applied</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {job.salaryBand && (
            <Badge variant="secondary">
              {SALARY_BAND_LABELS[job.salaryBand] ?? job.salaryBand}
            </Badge>
          )}
          <Badge variant="outline">
            {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
          </Badge>
          <Badge variant="outline">
            {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" /> {job.district}
          </Badge>
          <Badge variant="outline">
            {job.openings} opening{job.openings > 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="text-caption text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          {job.applicationDeadline
            ? `Apply by ${date(job.applicationDeadline)}`
            : "Rolling applications"}
        </div>

        {job.retention.hires > 0 && (
          <div className="text-caption text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {job.retention.hires} hires ·{" "}
            {job.retention.retainedPct !== null
              ? `${job.retention.retainedPct}% retained 90d`
              : "retention data pending"}
          </div>
        )}

        {job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-caption font-normal"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailsOpen(true)}
          >
            Details
          </Button>
          <Button
            size="sm"
            disabled={job.applied || applying}
            onClick={() => onApply(job.id)}
          >
            {applying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : job.applied ? (
              <Check className="h-4 w-4" />
            ) : null}
            {job.applied ? "Applied" : "Apply"}
          </Button>
        </div>
      </CardContent>

      {/* Detail expansion: full description + skills (payload already carries them) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{job.title}</DialogTitle>
            <DialogDescription>
              {job.companyName} · {job.district} ·{" "}
              {job.applicationDeadline
                ? `Apply by ${date(job.applicationDeadline)}`
                : "Rolling applications"}
            </DialogDescription>
          </DialogHeader>
          <p className="text-body-sm whitespace-pre-wrap">{job.description}</p>
          {job.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skillsRequired.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-caption font-normal"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
