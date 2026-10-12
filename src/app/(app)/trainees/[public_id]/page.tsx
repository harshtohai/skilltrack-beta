import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { Button } from "~/components/ui/button";
import { StatusBadge } from "~/components/patterns/status-badge";
import { CurrentStatusCard, IdentityCard } from "./trainee-detail-cards";
import { getTrainee, TimelineSkeleton, TraineeTimeline } from "./trainee-timeline";
import { TraineeActions } from "./trainee-actions";
import { TraineeCertificates } from "./trainee-certificates";

export const dynamic = "force-dynamic";

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
        <IdentityCard
          publicId={trainee.publicId}
          phoneE164={trainee.phoneE164}
          district={trainee.district}
          language={trainee.language}
          consentGiven={trainee.consentGiven}
          consentGivenAt={trainee.consentGivenAt}
          consentMethod={trainee.consentMethod}
          consentRevokedAt={trainee.consentRevokedAt}
        />

        {/* Certificates (T3): institute/admin issue + review — ADR-002 */}
        <TraineeCertificates publicId={trainee.publicId} canManage={scope.role === "admin" || inScope} />

        {/* aside (col-span-1): current status + timeline (§9.5 Details + Activity) */}
        <div className="space-y-4">
          <CurrentStatusCard
            claim={
              latestClaim
                ? {
                    verificationStatus: latestClaim.verificationStatus,
                    evidenceLevel: latestClaim.evidenceLevel,
                    employerName: latestClaim.employerName,
                    role: latestClaim.role,
                    salaryBand: latestClaim.salaryBand,
                  }
                : null
            }
          />

          <Suspense fallback={<TimelineSkeleton />}>
            <TraineeTimeline publicId={public_id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
