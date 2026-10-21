"use client";

import { useRouter } from "next/navigation";
import { Award, Briefcase, Clock, Pencil, Target, User } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { StatusBadge } from "~/components/patterns/status-badge";
import { EmptyState } from "~/components/patterns/empty-state";
import { date, datetime } from "~/lib/format";
import { maskPhoneE164 } from "~/lib/utils";
import { TraineeOutcomesTab } from "./trainee-outcomes";
import type { TraineeProfile } from "./profile-types";

/**
 * Verified-trainee profile portal (§9.10 "Profile (user)"): S1 shell from the
 * (app) layout, profile header card (avatar 64, name, caption, PRIMARY "Edit
 * profile"), line-style tabs
 * Profile/Employment/Certificates/Skills/Outcomes, personal info as a
 * description list (with the read-only My Training chain), employment timeline
 * rows, certificate grid with provenance labels, skill self-assessment levels,
 * and outcome checkpoints as left-accent cards.
 */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export function TraineeProfileView({ profile }: { profile: TraineeProfile }) {
  const router = useRouter();

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
              {profile.training.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-caption text-muted-foreground">My Training</dt>
                    <div className="mt-2 space-y-3">
                      {profile.training.map((enrolment) => (
                        <div key={enrolment.id} className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-body-sm font-medium">{enrolment.programme.name}</p>
                            <p className="text-caption text-muted-foreground">
                              Cohort {enrolment.cohort.name}
                              {enrolment.trainingCenter ? ` · ${enrolment.trainingCenter.name}` : ""}
                              {enrolment.certificationDate ? ` · Certified ${date(enrolment.certificationDate)}` : " · Certification pending"}
                            </p>
                          </div>
                          <StatusBadge
                            status={enrolment.status === "ACTIVE" ? "ACTIVE" : enrolment.status === "COMPLETED" ? "COMPLETED" : "DROPPED_OUT"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
                <div className="relative space-y-6 before:absolute before:inset-y-2 before:left-1 before:w-px before:bg-border">
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
                      <p className="mt-0.5 text-caption text-muted-foreground">
                        {cert.issuer}
                        {cert.source === "ISSUED" ? " · Institute-issued" : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 text-caption text-muted-foreground">
                        <span>Issued {date(cert.issueDate)}</span>
                        {cert.expiryDate && <span>Expires {date(cert.expiryDate)}</span>}
                      </div>
                      {(cert.hasFile || cert.fileUrl) && (
                        <a
                          href={cert.hasFile ? `/api/v1/trainee/certificates/${cert.id}/file` : (cert.fileUrl ?? "#")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-body-sm text-primary-strong hover:underline"
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
              {profile.skills.length === 0 ? (
                <EmptyState
                  icon={<Target />}
                  title="No skills rated yet"
                  description="Rate your skills from your profile — employers never see this; it only tunes your course suggestions."
                />
              ) : (
                <div className="space-y-4">
                  {profile.skills.map((s) => (
                    <div key={s.skill} className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium">{s.label}</p>
                        <p className="text-caption text-muted-foreground">
                          Rated {date(s.assessedAt)}
                        </p>
                      </div>
                      <Badge variant="secondary">{s.level} / 5</Badge>
                    </div>
                  ))}
                  <p className="text-caption text-muted-foreground">
                    For you and your training center — employers never see this. Retake any time from your profile.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <TraineeOutcomesTab profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
