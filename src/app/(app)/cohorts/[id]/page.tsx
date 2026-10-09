import { Suspense } from "react";
import Link from "next/link";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/patterns/skeleton";
import { maskPhoneE164 } from "~/lib/utils";
import { CohortDetailView, type CohortTraineeRow } from "./cohort-detail-view";

export const dynamic = "force-dynamic";

async function getCohort(id: string) {
  const cohort = await db.cohort.findUnique({
    where: { id },
    include: {
      programme: true,
      enrolments: {
        include: { trainee: true },
      },
    },
  });
  return cohort;
}

/**
 * Cohort detail per design §9.5 — Shell S1. Server component: the Prisma query
 * stays server-side; actions + table render through cohort-detail-view.tsx
 * (client) so event handlers and column renderers can cross the boundary.
 */
export default function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<TraineeTableSkeleton />}>
      <CohortDetailContent params={params} />
    </Suspense>
  );
}

async function CohortDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cohort = await getCohort(id);

  if (!cohort) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-h2 font-semibold">Cohort not found</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          That cohort ID does not match any record.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const traineeIds = cohort.enrolments.map((e) => e.traineeId);
  const followups = await db.followupEvent.findMany({
    where: { traineeId: { in: traineeIds }, checkpointDays: 30 },
  });
  const followupMap = new Map(followups.map((f) => [f.traineeId, f]));

  const rows: CohortTraineeRow[] = cohort.enrolments.map((enrolment) => {
    const trainee = enrolment.trainee;
    return {
      traineeId: trainee.id,
      publicId: trainee.publicId,
      fullName: trainee.fullName,
      phone: maskPhoneE164(trainee.phoneE164),
      district: trainee.district,
      followupStatus: followupMap.get(trainee.id)?.status ?? "NOT_TRIGGERED",
    };
  });

  return (
    <CohortDetailView
      cohortId={cohort.id}
      cohortName={cohort.name}
      programmeName={cohort.programme.name}
      startDate={cohort.startDate.toISOString()}
      endDate={cohort.endDate.toISOString()}
      rows={rows}
    />
  );
}

function TraineeTableSkeleton() {
  return (
    <Card className="p-5">
      <CardHeader className="p-0">
        <CardTitle>Trainees</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
