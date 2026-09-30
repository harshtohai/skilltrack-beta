import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Send, Download } from "lucide-react";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { formatDate, maskPhoneE164 } from "~/lib/utils";

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

async function getFollowups(traineeIds: string[]) {
  const followups = await db.followupEvent.findMany({
    where: { traineeId: { in: traineeIds }, checkpointDays: 30 },
  });
  return followups;
}

function TraineeTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainees</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Follow-up Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

async function CohortDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cohort = await getCohort(id);

  if (!cohort) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Cohort not found</h1>
        <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const traineeIds = cohort.enrolments.map((e) => e.traineeId);
  const followups = await getFollowups(traineeIds);
  const followupMap = new Map(followups.map((f) => [f.traineeId, f]));

  const statusColors: Record<string, "default" | "info" | "success" | "destructive" | "secondary" | "warning" | "outline"> = {
    SCHEDULED: "default",
    SENT: "info",
    RESPONDED: "success",
    FAILED: "destructive",
    EXPIRED: "secondary",
    NOT_TRIGGERED: "outline",
  };

  const handleTriggerFollowup = async () => {
    const res = await fetch(`/api/v1/cohorts/${id}/followups/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkpointDays: 30 }),
    });
    if (res.ok) window.location.reload();
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowRight className="h-4 w-4 rotate-180" /> Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{cohort.name}</h1>
          <p className="text-muted-foreground">{cohort.programme.name} • {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `/api/v1/export/cohort?cohortId=${cohort.id}&format=csv`;
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
          <Button variant="outline" onClick={handleTriggerFollowup}>
            <Send className="h-4 w-4 mr-2" /> Trigger 30-day Follow-up
          </Button>
        </div>
      </div>

      <Suspense fallback={<TraineeTableSkeleton />}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Trainees ({cohort.enrolments.length})</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {Array.from(new Set(cohort.enrolments.map((e) => e.trainee.district))).map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Follow-up Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohort.enrolments.map((enrolment) => {
                  const trainee = enrolment.trainee;
                  const followup = followupMap.get(trainee.id);
                  const status = followup?.status ?? "NOT_TRIGGERED";
                  return (
                    <TableRow key={trainee.id}>
                      <TableCell className="font-medium">{trainee.fullName}</TableCell>
                      <TableCell>{maskPhoneE164(trainee.phoneE164)}</TableCell>
                      <TableCell>{trainee.district}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[status] ?? "default"}>{status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/trainees/${trainee.publicId}`} className="text-primary hover:underline flex items-center gap-1">
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}

export default function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CohortDetailContent params={params} />;
}