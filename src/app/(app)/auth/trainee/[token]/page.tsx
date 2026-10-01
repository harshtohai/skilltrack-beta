"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Briefcase, Pencil, Target, Clock, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { date, datetime } from "~/lib/format";
import { maskPhoneE164 } from "~/lib/utils";

/**
 * Trainee magic-link portal (§9.10 "Profile (user)"): S1 shell from the (app)
 * layout, profile header card (avatar 64, name, caption, PRIMARY "Edit
 * profile"), line-style tabs Profile/Employment/Certificates/Skills/Outcomes,
 * personal info as a description list, employment timeline rows, certificate
 * grid, skills empty state, outcome checkpoints as left-accent cards. Statuses
 * via StatusBadge only (§4.10/CL-12).
 */

interface TraineeProfile {
  id: string;
  publicId: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  district: string;
  language: string;
  consentGiven: boolean;
  consentGivenAt: string | null;
  consentMethod: string | null;
  certificates: Certificate[];
  employmentHistory: EmploymentHistory[];
  outcomeEvents: OutcomeEvent[];
  followupEvents: FollowupEvent[];
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  fileUrl: string | null;
}

interface EmploymentHistory {
  id: string;
  employer: string;
  role: string;
  salaryBand: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

interface OutcomeEvent {
  id: string;
  checkpointDays: number;
  outcomeStatus: string;
  verificationStatus: string;
  source: string;
  evidenceLevel: number;
  createdAt: string;
  employmentClaim?: {
    employerName: string | null;
    role: string | null;
    salaryBand: string | null;
  } | null;
}

interface FollowupEvent {
  id: string;
  checkpointDays: number;
  status: string;
  channel: string;
  sentAt: string | null;
  respondedAt: string | null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function PortalSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

export default function TraineeAuthPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyNonce, setVerifyNonce] = useState(0);
  // StrictMode double-fires effects in dev — guard so each token/nonce pair
  // verifies exactly once (the token is one-time server-side; a second POST
  // would hit TOKEN_USED and wrongly flip the loaded profile to the error state).
  const verifiedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    const key = `${token}:${verifyNonce}`;
    if (verifiedKeysRef.current.has(key)) return;
    verifiedKeysRef.current.add(key);
    void (async function verifyToken() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/auth/trainee/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: { message?: string } };
          throw new Error(data.error?.message ?? "Invalid or expired link");
        }
        const data = (await res.json()) as { trainee: TraineeProfile };
        setProfile(data.trainee);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, verifyNonce]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PortalSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <ErrorState
          title="Couldn't verify your link"
          description={error || "This magic link is invalid or has expired."}
          onRetry={() => setVerifyNonce((n) => n + 1)}
        />
        <div className="text-center">
          <Link
            href="/login"
            className="text-body-sm text-muted-foreground underline hover:text-foreground"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Profile header card (§9.10 "Profile (user)") */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
          <Avatar className="size-16 shrink-0">
            <AvatarFallback className="text-xl font-medium">
              {initialsOf(profile.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-h1 font-medium tracking-tight">{profile.fullName}</h1>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Trainee · {profile.district} · ID {profile.publicId.slice(0, 8)}…
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => router.push("/trainee/profile")} className="gap-2">
              <Pencil />
              Edit profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger variant="line" value="profile"><User />Profile</TabsTrigger>
          <TabsTrigger variant="line" value="employment"><Briefcase />Employment</TabsTrigger>
          <TabsTrigger variant="line" value="certificates"><Award />Certificates</TabsTrigger>
          <TabsTrigger variant="line" value="skills"><Target />Skills</TabsTrigger>
          <TabsTrigger variant="line" value="outcomes"><Clock />Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-caption text-muted-foreground">Full name</dt>
                  <dd className="mt-0.5 text-body-sm font-medium">{profile.fullName}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground">Trainee ID</dt>
                  <dd className="mt-0.5 font-mono text-body-sm font-medium tabular-nums">{profile.publicId}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5 font-mono text-body-sm font-medium tabular-nums">{maskPhoneE164(profile.phoneE164)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 text-body-sm font-medium">{profile.email ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground">District</dt>
                  <dd className="mt-0.5 text-body-sm font-medium">{profile.district}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground">Preferred language</dt>
                  <dd className="mt-0.5 text-body-sm font-medium">
                    {profile.language === "HI" ? "Hindi" : profile.language === "MR" ? "Marathi" : "English"}
                  </dd>
                </div>
              </dl>
              <Separator />
              <div>
                <dt className="text-caption text-muted-foreground">Consent status</dt>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <StatusBadge status={profile.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
                  {profile.consentGivenAt && (
                    <span className="text-caption text-muted-foreground">
                      Given on {datetime(profile.consentGivenAt)} via {profile.consentMethod}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.employmentHistory.length === 0 ? (
                <EmptyState
                  icon={<Briefcase />}
                  title="No employment history yet"
                  description="Your work experience will appear here once it's verified."
                />
              ) : (
                <div className="relative space-y-6 before:absolute before:inset-y-2 before:left-[5px] before:w-px before:bg-border">
                  {profile.employmentHistory.map((job) => (
                    <div key={job.id} className="relative pl-6">
                      <span
                        aria-hidden
                        className="absolute left-0 top-1 size-[11px] rounded-full border-2 border-primary bg-background"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium">{job.role}</p>
                          <p className="text-body-sm text-muted-foreground">{job.employer}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{job.salaryBand ?? "Not specified"}</Badge>
                          <Badge variant={job.isCurrent ? "success" : "secondary"}>
                            {job.isCurrent ? "Current" : "Previous"}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-caption text-muted-foreground">
                        {date(job.startDate)} — {job.isCurrent ? "Present" : job.endDate ? date(job.endDate) : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.certificates.length === 0 ? (
                <EmptyState
                  icon={<Award />}
                  title="No certificates yet"
                  description="Your programme certificates will appear here once issued."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {profile.certificates.map((cert) => (
                    <div key={cert.id} className="rounded-xl border bg-card p-4">
                      <p className="text-body-sm font-medium">{cert.name}</p>
                      <p className="mt-0.5 text-caption text-muted-foreground">{cert.issuer}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 text-caption text-muted-foreground">
                        <span>Issued {date(cert.issueDate)}</span>
                        {cert.expiryDate && <span>Expires {date(cert.expiryDate)}</span>}
                      </div>
                      {cert.fileUrl && (
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
                        >
                          View certificate
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Self-Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Target />}
                title="Skill assessment coming soon"
                description="Rate your skills and map them to your training programme."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
