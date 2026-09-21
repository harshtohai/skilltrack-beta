"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Loader2, AlertCircle, User, Briefcase, Award, Target, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { formatDate, formatPhoneE164 } from "~/lib/utils";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

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
  };
}

interface FollowupEvent {
  id: string;
  checkpointDays: number;
  status: string;
  channel: string;
  sentAt: string | null;
  respondedAt: string | null;
}

export default function TraineeAuthPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    void (async function verifyToken() {
      try {
        const res = await fetch(`/api/v1/auth/trainee/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Invalid or expired link");
        }
        const data = (await res.json()) as { trainee: TraineeProfile };
        setProfile(data.trainee);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Verifying your magic link...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Invalid Link</h2>
            <p className="mb-6 text-muted-foreground">{error || "This magic link is invalid or has expired."}</p>
            <Link href="/login">
              <Button>Request New Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EMPLOYED": case "SELF_EMPLOYED": case "APPRENTICE":
        return "bg-green-100 text-green-800";
      case "LOOKING":
        return "bg-yellow-100 text-yellow-800";
      case "NOT_WORKING":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "DOCUMENT_VERIFIED": case "EMPLOYER_CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PROVIDER_CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "SELF_REPORTED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary-foreground">OutcomeTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Signed in as {profile.fullName}</span>
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{profile.fullName}</h1>
              <p className="text-muted-foreground">Trainee ID: {profile.publicId.slice(0, 8)}... • District: {profile.district}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="text-xs" variant="outline">{profile.language === "HI" ? "हिंदी" : "English"}</Badge>
              <Badge className="text-xs" variant={profile.consentGiven ? "default" : "destructive"}>
                {profile.consentGiven ? "Consent Given" : "No Consent"}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="employment"><Briefcase className="mr-2 h-4 w-4" />Employment</TabsTrigger>
            <TabsTrigger value="certificates"><Award className="mr-2 h-4 w-4" />Certificates</TabsTrigger>
            <TabsTrigger value="skills"><Target className="mr-2 h-4 w-4" />Skills</TabsTrigger>
            <TabsTrigger value="outcomes"><Clock className="mr-2 h-4 w-4" />Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg">{profile.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Trainee ID</label>
                    <p className="text-lg font-mono">{profile.publicId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg">{formatPhoneE164(profile.phoneE164)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{profile.email ?? "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">District</label>
                    <p className="text-lg">{profile.district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                    <p className="text-lg capitalize">{profile.language === "HI" ? "Hindi" : "English"}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Consent Status</label>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant={profile.consentGiven ? "default" : "destructive"}>
                      {profile.consentGiven ? "✓ Consent Given" : "✗ Consent Not Given"}
                    </Badge>
                    {profile.consentGivenAt && (
                      <span className="text-sm text-muted-foreground">
                        Given on {formatDate(profile.consentGivenAt)} via {profile.consentMethod}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employment Timeline</CardTitle>
                <Button size="sm" variant="outline">Add Employment</Button>
              </CardHeader>
              <CardContent>
                {profile.employmentHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p>No employment history recorded yet.</p>
                    <p className="text-sm">Add your work experience to build your timeline.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.employmentHistory.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h4 className="font-semibold">{job.role}</h4>
                            <p className="text-muted-foreground">{job.employer}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 text-sm">
                            <Badge variant="outline">{job.salaryBand ?? "Not specified"}</Badge>
                            <Badge variant={job.isCurrent ? "default" : "outline"}>
                              {job.isCurrent ? "Current" : "Previous"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>📅 {formatDate(job.startDate)} — {job.isCurrent ? "Present" : formatDate(job.endDate ?? "")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Certificates</CardTitle>
                <Button size="sm" variant="outline">Upload Certificate</Button>
              </CardHeader>
              <CardContent>
                {profile.certificates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p>No certificates uploaded yet.</p>
                    <p className="text-sm">Add your certifications to showcase your skills.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profile.certificates.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                          <span>Issued: {formatDate(cert.issueDate)}</span>
                          {cert.expiryDate && <span>Expires: {formatDate(cert.expiryDate)}</span>}
                        </div>
                        {cert.fileUrl && (
                          <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            View Certificate
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
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p>Skill assessment feature coming soon.</p>
                  <p className="text-sm">Rate your skills and map them to your training programme.</p>
                </div>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p>No outcome records yet.</p>
                    <p className="text-sm">Your 30/90-day follow-up outcomes will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.outcomeEvents.map((outcome) => (
                      <Card key={outcome.id} className="border-l-4 border-primary">
                        <CardContent className="pt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(outcome.outcomeStatus)}>
                                  {outcome.outcomeStatus.replace("_", " ")}
                                </Badge>
                                <Badge className={getVerificationColor(outcome.verificationStatus)}>
                                  {outcome.verificationStatus.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {outcome.checkpointDays}-day follow-up • {formatDate(outcome.createdAt ?? "")}
                              </p>
                            </div>
                            {outcome.employmentClaim && (
                              <div className="text-right text-sm text-muted-foreground">
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
                      <Card key={fe.id} className="border-l-4 border-muted">
                        <CardContent className="pt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <p className="font-medium">{fe.checkpointDays}-day Follow-up</p>
                              <p className="text-sm text-muted-foreground">
                                Channel: {fe.channel} • Status: {fe.status}
                                {fe.sentAt && ` • Sent: ${formatDate(fe.sentAt)}`}
                                {fe.respondedAt && ` • Responded: ${formatDate(fe.respondedAt)}`}
                              </p>
                            </div>
                            <Badge variant={fe.status === "RESPONDED" ? "default" : "outline"}>
                              {fe.status}
                            </Badge>
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
      </main>
    </div>
  );
}