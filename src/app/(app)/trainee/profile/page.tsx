"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Save, Lock, Loader2, Award, Briefcase, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { cn } from "~/lib/utils";
import { date, datetime } from "~/lib/format";
import { maskPhoneE164 } from "~/lib/utils";

/**
 * Trainee self-service profile (§9.7 settings pattern): S1 shell from the
 * (app) layout, `lg:flex lg:gap-8` with a left sub-nav (items h-9, active
 * bg-accent) and a `max-w-3xl` content column. Trainee ID card with copy,
 * profile details form with dirty-state Save (toast on save, leave guard when
 * dirty), verified-information card with lock + consent, certificates/
 * employment/checkpoint cards as §9.7 border-b rows. Statuses via StatusBadge
 * only (§4.10/CL-12).
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
  certificates: Array<{ id: string; name: string; issuer: string; issueDate: string; expiryDate: string | null; fileUrl: string | null }>;
  employmentHistory: Array<{ id: string; employer: string; role: string | null; salaryBand: string | null; startDate: string; endDate: string | null; isCurrent: boolean }>;
  outcomeEvents: Array<{ id: string; checkpointDays: number; outcomeStatus: string; verificationStatus: string; createdAt: string }>;
}

interface MeResponse {
  trainee: TraineeProfile;
  districts: string[];
}

const SUB_NAV = [
  { label: "Profile details", href: "#profile-details" },
  { label: "Verified info", href: "#verified-info" },
  { label: "Certificates", href: "#certificates" },
  { label: "Employment", href: "#employment" },
  { label: "Outcomes", href: "#outcomes" },
] as const;

function ProfileSkeleton() {
  return (
    <div className="lg:flex lg:gap-8" aria-busy>
      <Skeleton className="hidden lg:block lg:w-56 lg:shrink-0" />
      <div className="min-w-0 flex-1 space-y-6 lg:max-w-3xl">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function TraineeProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("");
  const [activeSection, setActiveSection] = useState<string>("profile-details");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/trainee/me");
      if (res.status === 401) {
        router.push("/login?redirect=/trainee/profile");
        return;
      }
      if (!res.ok) throw new Error("Failed to load profile");
      const json = (await res.json()) as MeResponse;
      setData(json);
      setFullName(json.trainee.fullName);
      setEmail(json.trainee.email ?? "");
      setDistrict(json.trainee.district);
      setLanguage(json.trainee.language);
      setError("");
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (saving || !data) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/v1/trainee/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: email.trim() || null,
          district,
          language,
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to update profile");
      }
      toast.success("Profile updated");
      void loadProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const copyTraineeId = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.trainee.publicId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy trainee ID");
    }
  };

  const dirty = data
    ? fullName !== data.trainee.fullName ||
      email !== (data.trainee.email ?? "") ||
      district !== data.trainee.district ||
      language !== data.trainee.language
    : false;

  // Leave guard per §10 settings flow: warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!data) {
    return (
      <ErrorState
        title="Couldn't load your profile"
        description={error || "Check your connection and try again."}
        onRetry={() => void loadProfile()}
      />
    );
  }

  const trainee = data.trainee;

  return (
    <div className="lg:flex lg:gap-8">
      {/* Sub-nav (§9.7): vertical, items h-9, active bg-accent */}
      <nav className="hidden lg:block lg:w-56 lg:shrink-0" aria-label="Profile sections">
        <div className="sticky top-6 flex flex-col gap-0.5">
          {SUB_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActiveSection(item.href.slice(1))}
              aria-current={activeSection === item.href.slice(1) ? "true" : undefined}
              className={cn(
                "flex h-9 items-center rounded-lg px-3 text-body-sm transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                activeSection === item.href.slice(1) && "bg-accent font-medium",
              )}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1 space-y-6 lg:max-w-3xl">
        {/* Trainee ID — prominent + copyable */}
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
              Your Trainee ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-2xl font-semibold text-primary-strong tabular-nums">{trainee.publicId}</span>
              <Button variant="outline" size="sm" onClick={() => void copyTraineeId()} className="gap-2">
                {copied ? <Check className="text-success-text" /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-caption text-muted-foreground">
              Share this ID with your training center or employer for verification.
            </p>
          </CardContent>
        </Card>

        {/* Editable profile (§10 settings flow: dirty state enables Save) */}
        <Card id="profile-details" className="scroll-mt-6">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district" className="w-full">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.districts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="HI">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="MR">मराठी (Marathi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-6 gap-2"
              onClick={() => void handleSave()}
              disabled={saving || !dirty || !fullName.trim()}
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Locked fields (§9.7 rows pattern) */}
        <Card id="verified-info" className="scroll-mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Verified Information</CardTitle>
            <Lock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-4 border-b py-4">
              <span className="text-body-sm text-muted-foreground">Phone (verified via WhatsApp)</span>
              <span className="font-mono text-body-sm font-medium tabular-nums">{maskPhoneE164(trainee.phoneE164)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b py-4">
              <span className="text-body-sm text-muted-foreground">Consent</span>
              <div className="flex items-center gap-3">
                <StatusBadge status={trainee.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
                {trainee.consentGiven && trainee.consentGivenAt ? (
                  <span className="text-caption text-muted-foreground">{datetime(trainee.consentGivenAt)}</span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates (§9.7 rows pattern) */}
        <Card id="certificates" className="scroll-mt-6">
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {trainee.certificates.length === 0 ? (
              <EmptyState
                icon={<Award />}
                title="No certificates yet"
                description="Your programme certificates will appear here once issued."
              />
            ) : (
              trainee.certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between gap-4 border-b py-4">
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium">{cert.name}</p>
                    <p className="text-caption text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <span className="shrink-0 text-caption text-muted-foreground">{date(cert.issueDate)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Employment history (§9.7 rows pattern) */}
        <Card id="employment" className="scroll-mt-6">
          <CardHeader>
            <CardTitle>Employment History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {trainee.employmentHistory.length === 0 ? (
              <EmptyState
                icon={<Briefcase />}
                title="No employment history yet"
                description="Your verified work experience will appear here."
              />
            ) : (
              trainee.employmentHistory.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-4 border-b py-4">
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium">{job.employer}</p>
                    <p className="text-caption text-muted-foreground">{job.role ?? "—"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {job.isCurrent && <Badge variant="success">Current</Badge>}
                    <p className={cn("text-caption text-muted-foreground", job.isCurrent && "mt-1")}>
                      {date(job.startDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Outcome checkpoints (§9.7 rows pattern) */}
        <Card id="outcomes" className="scroll-mt-6">
          <CardHeader>
            <CardTitle>Outcome Checkpoints</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {trainee.outcomeEvents.length === 0 ? (
              <EmptyState
                icon={<Target />}
                title="No outcome checkpoints yet"
                description="Your 30/90-day follow-up outcomes will appear here."
              />
            ) : (
              trainee.outcomeEvents.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-4 border-b py-4">
                  <span className="text-body-sm font-medium">{o.checkpointDays}-day checkpoint</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.outcomeStatus as StatusKey} />
                    <span className="text-caption text-muted-foreground">{datetime(o.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
