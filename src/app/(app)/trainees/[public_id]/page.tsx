import { Suspense } from "react";
import Link from "next/link";
import { Calendar, Briefcase, Award, ShieldCheck, AlertTriangle, ChevronRight, UserMinus } from "lucide-react";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CopyButton } from "~/components/copy-button";
import { EmptyState } from "~/components/patterns/empty-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { datetime } from "~/lib/format";
import { maskPhoneE164 } from "~/lib/utils";
import { TraineeActions } from "./trainee-actions";

export const dynamic = "force-dynamic";

const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

async function getTrainee(publicId: string) {
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

function TimelineSkeleton() {
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

/** §9.5 Activity card — icon chips (bg-primary-soft) on a bg-border connector. */
async function TraineeTimeline({ publicId }: { publicId: string }) {
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

/** Description list per §4: `grid grid-cols-2 gap-y-3`, label muted, value medium. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-body-sm text-muted-foreground">{label}</dt>
      <dd className="text-body-sm font-medium">{children}</dd>
    </>
  );
}

export default async function TraineeDetailPage({ params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = await params;
  const trainee = await getTrainee(public_id);

  if (!trainee) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-h2 font-semibold">Trainee not found</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          That trainee ID does not match any record.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const latestClaim = trainee.employmentClaims?.length
    ? trainee.employmentClaims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  // INST-03 lifecycle: derived status ACTIVE > COMPLETED > DROPPED_OUT.
  const lifecycleStatus = trainee.enrolments.some((e) => e.status === "ACTIVE")
    ? "ACTIVE"
    : trainee.enrolments.some((e) => e.status === "COMPLETED")
      ? "COMPLETED"
      : trainee.enrolments.length > 0
        ? "DROPPED_OUT"
        : null;

  // Move/drop-out are admin+institute actions; institutes only within their
  // center (INST-01) and — for moves — only while the trainee has zero
  // progress data (followupEvents count 0, the checkpoints proxy).
  const scope = await getSessionScope();
  const activeEnrolments = trainee.enrolments.filter((e) => e.status === "ACTIVE");
  const inScope = !scope.centerId || trainee.enrolments.some((e) => e.cohort.trainingCenterId === scope.centerId);
  const [followupCount, cohortRows] = await Promise.all([
    db.followupEvent.count({ where: { traineeId: trainee.id } }),
    // Cohorts of the trainee's active programmes, excluding any cohort they
    // already have an enrolment record in (the unique constraint would 409).
    db.cohort.findMany({
      where: {
        programmeId: { in: activeEnrolments.map((e) => e.cohort.programmeId) },
        id: { notIn: trainee.enrolments.map((e) => e.cohortId) },
        ...(scope.centerId ? { trainingCenterId: scope.centerId } : {}),
      },
      select: { id: true, name: true, programme: { select: { name: true } } },
      orderBy: { startDate: "desc" },
    }),
  ]);
  const canMove = activeEnrolments.length > 0 && inScope && (scope.role === "admin" || followupCount === 0);
  const canDrop = activeEnrolments.length > 0 && inScope;

  return (
    <div>
      {/* Breadcrumb (§9.5 — above H1, mb-2) */}
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-1 text-caption text-muted-foreground"
      >
        <Link href="/dashboard" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          Dashboard
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link href="/trainees" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          Trainees
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-foreground" aria-current="page">{trainee.fullName}</span>
      </nav>

      {/* H1 + status badges + lifecycle actions (§9.5 header) */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 font-medium tracking-tight">{trainee.fullName}</h1>
          {lifecycleStatus ? <StatusBadge status={lifecycleStatus} /> : null}
          <StatusBadge status={trainee.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
        </div>
        <TraineeActions
          publicId={trainee.publicId}
          traineeName={trainee.fullName}
          programmeName={activeEnrolments[0]?.cohort.programme.name ?? ""}
          canMove={canMove}
          canDrop={canDrop}
          cohorts={cohortRows.map((c) => ({ id: c.id, name: c.name, programmeName: c.programme.name }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* main (col-span-2): identity as a description list (§9.5 Summary) */}
        <Card className="p-5 lg:col-span-2">
          <CardHeader className="p-0">
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <dl className="grid grid-cols-2 gap-y-3">
              <DetailRow label="Trainee ID">
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono text-primary-strong">{trainee.publicId}</span>
                  <CopyButton value={trainee.publicId} />
                </span>
              </DetailRow>
              <DetailRow label="Phone">
                <span className="font-mono">{maskPhoneE164(trainee.phoneE164)}</span>
              </DetailRow>
              <DetailRow label="District">{trainee.district}</DetailRow>
              <DetailRow label="Language">{trainee.language === "EN" ? "English" : "Hindi"}</DetailRow>
              <DetailRow label="Consent">
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={trainee.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
                  {trainee.consentGiven && trainee.consentGivenAt ? (
                    <span className="text-caption font-normal text-muted-foreground">
                      on {datetime(trainee.consentGivenAt)}
                    </span>
                  ) : null}
                  {trainee.consentRevokedAt ? (
                    <span className="text-caption font-normal text-warning-text">(Revoked)</span>
                  ) : null}
                </span>
              </DetailRow>
              {trainee.consentMethod ? (
                <DetailRow label="Consent method">{trainee.consentMethod}</DetailRow>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        {/* aside (col-span-1): current status + timeline (§9.5 Details + Activity) */}
        <div className="space-y-4">
          <Card className="p-5">
            <CardHeader className="p-0">
              <CardTitle>Current status</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              {latestClaim ? (
                <dl className="grid grid-cols-2 gap-y-3">
                  <DetailRow label="Verification">
                    <StatusBadge status={latestClaim.verificationStatus} />
                  </DetailRow>
                  <DetailRow label="Evidence">
                    <StatusBadge evidence={latestClaim.evidenceLevel} />
                  </DetailRow>
                  <DetailRow label="Employer">{latestClaim.employerName ?? "—"}</DetailRow>
                  <DetailRow label="Role">{latestClaim.role ?? "—"}</DetailRow>
                  <DetailRow label="Salary band">
                    {latestClaim.salaryBand
                      ? SALARY_BAND_LABELS[latestClaim.salaryBand] ?? latestClaim.salaryBand
                      : "—"}
                  </DetailRow>
                </dl>
              ) : (
                <EmptyState
                  icon={<Briefcase />}
                  title="No employment claim yet"
                  description="Trigger a follow-up to start tracking."
                />
              )}
            </CardContent>
          </Card>

          <Suspense fallback={<TimelineSkeleton />}>
            <TraineeTimeline publicId={public_id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
