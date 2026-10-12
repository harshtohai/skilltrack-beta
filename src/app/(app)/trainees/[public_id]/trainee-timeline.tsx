import { Calendar, Briefcase, Award, ShieldCheck, AlertTriangle, UserMinus } from "lucide-react";
import { db } from "~/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/patterns/empty-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { datetime } from "~/lib/format";

/**
 * §9.5 Activity card — icon chips (bg-primary-soft) on a bg-border connector.
 * Server component: loads the trainee + timeline events itself (same data flow
 * as before the split), so the page only passes the serializable publicId.
 * SALARY_BAND_LABELS is exported for the current-status card.
 */

export const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

export async function getTrainee(publicId: string) {
  const trainee = await db.trainee.findUnique({
    where: { publicId },
    include: {
      enrolments: {
        include: { cohort: { include: { programme: true } } },
      },
      employmentClaims: {
        include: { verificationRequests: true },
      },
    },
  });
  return trainee;
}

interface BaseEvent {
  type: "CERTIFICATION" | "FOLLOWUP" | "CLAIM" | "VERIFICATION" | "DROPOUT";
  date: Date;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CertificationEvent extends BaseEvent {
  type: "CERTIFICATION";
  metadata: { cohortId: string; programmeId: string };
}

interface FollowupEvent extends BaseEvent {
  type: "FOLLOWUP";
  metadata: { followupId: string; checkpointDays: number; status: string };
}

interface ClaimEvent extends BaseEvent {
  type: "CLAIM";
  metadata: { claimId: string; verificationStatus: string; evidenceLevel: number; employerName: string | null; role: string | null; salaryBand: string | null };
}

interface VerificationEvent extends BaseEvent {
  type: "VERIFICATION";
  metadata: { verificationId: string; action: string | null; claimId: string };
}

interface DropoutEvent extends BaseEvent {
  type: "DROPOUT";
  metadata: { enrolmentId: string; cohortId: string; programmeId: string };
}

type TimelineEvent = CertificationEvent | FollowupEvent | ClaimEvent | VerificationEvent | DropoutEvent;

async function getTimeline(traineeId: string): Promise<TimelineEvent[]> {
  const [enrolments, followups, claims, verifications] = await Promise.all([
    db.enrolment.findMany({
      where: { traineeId },
      include: { cohort: { include: { programme: true } } },
      orderBy: { certificationDate: "asc" },
    }),
    db.followupEvent.findMany({
      where: { traineeId },
      orderBy: { checkpointDays: "asc" },
    }),
    db.employmentClaim.findMany({
      where: { traineeId },
      include: { followupEvent: true, verificationRequests: true },
      orderBy: { createdAt: "asc" },
    }),
    db.verificationRequest.findMany({
      where: { employmentClaim: { traineeId } },
      include: { employmentClaim: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const events: TimelineEvent[] = [
    // Dropped-out enrolments render the dropout node INSTEAD of the "Certified"
    // node (they never completed) — INST-03, same §9.5 timeline style.
    ...enrolments.flatMap((e): TimelineEvent[] => {
      if (e.status === "DROPPED_OUT") {
        return [{
          type: "DROPOUT",
          date: e.updatedAt,
          title: `Dropped out of ${e.cohort.programme.name}`,
          description: `${e.cohort.name} · ${e.cohort.programme.code}`,
          metadata: { enrolmentId: e.id, cohortId: e.cohortId, programmeId: e.cohort.programmeId },
          icon: UserMinus,
        }];
      }
      return [{
        type: "CERTIFICATION",
        date: e.certificationDate,
        title: `Certified: ${e.cohort.programme.name} - ${e.cohort.name}`,
        description: `Completed training in ${e.cohort.programme.code}`,
        metadata: { cohortId: e.cohortId, programmeId: e.cohort.programmeId },
        icon: Award,
      }];
    }),
    ...followups.map((f): FollowupEvent => ({
      type: "FOLLOWUP",
      date: f.sentAt ?? f.createdAt,
      title: `${f.checkpointDays}-day follow-up`,
      description: "",
      metadata: { followupId: f.id, checkpointDays: f.checkpointDays, status: f.status },
      icon: Calendar,
    })),
    ...claims.map((c): ClaimEvent => ({
      type: "CLAIM",
      date: c.createdAt,
      title: "Employment claim submitted",
      description: `${c.employerName ?? "N/A"} · ${c.role ?? "N/A"} · ${c.salaryBand ? SALARY_BAND_LABELS[c.salaryBand] ?? c.salaryBand : "N/A"}`,
      metadata: {
        claimId: c.id,
        verificationStatus: c.verificationStatus,
        evidenceLevel: c.evidenceLevel,
        employerName: c.employerName,
        role: c.role,
        salaryBand: c.salaryBand,
      },
      icon: Briefcase,
    })),
    ...verifications.map((v): VerificationEvent => ({
      type: "VERIFICATION",
      date: v.usedAt ?? v.createdAt,
      title: `Employer ${v.action?.toLowerCase() ?? "pending"}`,
      description: v.rejectionReason ?? "Verified by employer",
      metadata: {
        verificationId: v.id,
        action: v.action,
        claimId: v.employmentClaimId,
      },
      icon: v.action === "CONFIRMED" ? ShieldCheck : AlertTriangle,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
}

export function TimelineSkeleton() {
  return (
    <Card className="p-5">
      <CardHeader className="p-0">
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="space-y-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function isClaimEvent(event: TimelineEvent): event is ClaimEvent {
  return event.type === "CLAIM";
}

function isFollowupEvent(event: TimelineEvent): event is FollowupEvent {
  return event.type === "FOLLOWUP";
}

export async function TraineeTimeline({ publicId }: { publicId: string }) {
  const trainee = await getTrainee(publicId);
  if (!trainee) return null;

  const events = await getTimeline(trainee.id);

  return (
    <Card className="p-5">
      <CardHeader className="p-0">
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {events.length === 0 ? (
          <EmptyState
            title="No events yet"
            description="Certifications, claims and follow-ups show up here."
          />
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={`${event.type}-${event.date.toISOString()}-${index}`} className="relative flex gap-3">
                <div className="relative shrink-0">
                  <span className="grid size-8 place-items-center rounded-md bg-primary-soft text-primary-strong [&_svg]:size-4">
                    <event.icon />
                  </span>
                  {index < events.length - 1 && (
                    <div className="absolute bottom-0 left-4 top-8 w-px bg-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-body-sm font-medium">{event.title}</span>
                    <span className="text-caption text-muted-foreground">{datetime(event.date)}</span>
                  </div>
                  {event.description ? (
                    <p className="mt-0.5 text-body-sm text-muted-foreground">{event.description}</p>
                  ) : null}
                  {(() => {
                    if (isClaimEvent(event)) {
                      return (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={event.metadata.verificationStatus as StatusKey} />
                          <StatusBadge evidence={event.metadata.evidenceLevel} />
                        </div>
                      );
                    }
                    if (isFollowupEvent(event)) {
                      return <StatusBadge className="mt-1.5" status={event.metadata.status as StatusKey} />;
                    }
                    return null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
