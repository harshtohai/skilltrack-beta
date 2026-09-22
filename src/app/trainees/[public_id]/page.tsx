import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User, Phone, MapPin, Briefcase, Award, ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle } from "lucide-react";
import { db } from "~/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { formatDateTime, maskPhoneE164 } from "~/lib/utils";

export const dynamic = "force-dynamic";

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
  type: "CERTIFICATION" | "FOLLOWUP" | "CLAIM" | "VERIFICATION";
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

type TimelineEvent = CertificationEvent | FollowupEvent | ClaimEvent | VerificationEvent;

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
    ...enrolments.map((e): CertificationEvent => ({
      type: "CERTIFICATION",
      date: e.certificationDate,
      title: `Certified: ${e.cohort.programme.name} - ${e.cohort.name}`,
      description: `Completed training in ${e.cohort.programme.code}`,
      metadata: { cohortId: e.cohortId, programmeId: e.cohort.programmeId },
      icon: Award,
    })),
    ...followups.map((f): FollowupEvent => ({
      type: "FOLLOWUP",
      date: f.sentAt ?? f.createdAt,
      title: `${f.checkpointDays}-day follow-up`,
      description: `Status: ${f.status}`,
      metadata: { followupId: f.id, checkpointDays: f.checkpointDays, status: f.status },
      icon: Calendar,
    })),
    ...claims.map((c): ClaimEvent => ({
      type: "CLAIM",
      date: c.createdAt,
      title: "Employment claim submitted",
      description: `${c.verificationStatus} • ${c.employerName ?? "N/A"} • ${c.role ?? "N/A"} • ${c.salaryBand ?? "N/A"}`,
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
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceBadge({ level }: { level: number }) {
  const labels = ["Unknown", "Self-reported", "Provider confirmed", "Employer confirmed", "Document verified", "System verified"];
  const colors: ("default" | "outline" | "info" | "success" | "warning" | "destructive")[] = ["default", "outline", "info", "success", "warning", "destructive"];
  return (
    <Badge variant={colors[level] ?? "default"} className="gap-1">
      <ShieldCheck className="h-3 w-3" />
      Level {level}: {labels[level] ?? "Unknown"}
    </Badge>
  );
}

function isClaimEvent(event: TimelineEvent): event is ClaimEvent {
  return event.type === "CLAIM";
}

function isVerificationEvent(event: TimelineEvent): event is VerificationEvent {
  return event.type === "VERIFICATION";
}

async function TraineeTimeline({ publicId }: { publicId: string }) {
  const trainee = await getTrainee(publicId);
  if (!trainee) return null;

  const events = await getTimeline(trainee.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={`${event.type}-${event.date.toISOString()}-${index}`} className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <event.icon className="h-4 w-4 text-primary" />
                </div>
                {index < events.length - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-border" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground">{formatDateTime(event.date)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {(() => {
                  if (isClaimEvent(event)) {
                    return event.metadata.evidenceLevel !== undefined ? (
                      <EvidenceBadge level={event.metadata.evidenceLevel} />
                    ) : null;
                  }
                  if (isVerificationEvent(event)) {
                    // Verification events don't have evidenceLevel in our current schema
                    return null;
                  }
                  return null;
                })()}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No events yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TraineeDetailPage({ params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = await params;
  const trainee = await getTrainee(public_id);

  if (!trainee) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Trainee not found</h1>
        <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const latestClaim = trainee.employmentClaims?.length
    ? trainee.employmentClaims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1 mb-2">
          <ArrowRight className="h-4 w-4 rotate-180" /> Dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{trainee.fullName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Trainee ID</p>
                <p className="font-mono">{trainee.publicId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{maskPhoneE164(trainee.phoneE164)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">District</p>
                <p>{trainee.district}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p>{trainee.language === "EN" ? "English" : "Hindi"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Consent Status</p>
                <div className="flex items-center gap-2">
                  {trainee.consentGiven ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Given</span>
                      {trainee.consentGivenAt && (
                        <span className="text-xs text-muted-foreground">
                          on {formatDateTime(trainee.consentGivenAt)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Not given</span>
                    </>
                  )}
                  {trainee.consentRevokedAt && (
                    <span className="text-xs text-orange-500">(Revoked)</span>
                  )}
                </div>
              </div>
            </div>
            {trainee.consentMethod && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Consent Method</p>
                  <p>{trainee.consentMethod}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestClaim ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <Badge variant={
                    latestClaim.verificationStatus === "EMPLOYER_CONFIRMED" ? "success" :
                    latestClaim.verificationStatus === "CONFLICT" ? "destructive" :
                    "outline"
                  } className="text-capitalize">
                    {latestClaim.verificationStatus.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Evidence Level</p>
                  <EvidenceBadge level={latestClaim.evidenceLevel} />
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Employer</p>
                  <p className="font-medium">{latestClaim.employerName ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{latestClaim.role ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary Band</p>
                  <p className="font-medium">{latestClaim.salaryBand ?? "Not provided"}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No employment claim yet</p>
                <p className="text-sm">Trigger a follow-up to start tracking</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<TimelineSkeleton />}>
        <TraineeTimeline publicId={public_id} />
      </Suspense>
    </div>
  );
}