"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { EmployerJobsResponse, EmployerVerificationStatus } from "~/lib/job-board-contracts";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABELS);
const WORK_MODES = Object.keys(WORK_MODE_LABELS);
const SALARY_BANDS = Object.keys(SALARY_BAND_LABELS);

const emptyForm = {
  title: "",
  description: "",
  employmentType: "FULL_TIME",
  workMode: "ONSITE",
  salaryBand: "",
  district: "",
  skills: "",
  openings: "1",
  applicationDeadline: "",
};

/**
 * Post Job (F25): the job creation form on its own page — the dashboard
 * keeps a single "Post Job" button that navigates here (a page scales
 * better than a popup as more posting options are added). Same verification
 * gate as the dashboard: PENDING/SUSPENDED/REJECTED employers see the
 * banner only. On success it returns to the dashboard, where the new
 * posting appears in the list.
 */
export default function PostJobPage() {
  const router = useRouter();
  const [status, setStatus] = useState<EmployerVerificationStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [gateError, setGateError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/employer/jobs");
        if (!active) return;
        if (res.status === 401) {
          router.push("/employer/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load employer profile");
        const json = (await res.json()) as EmployerJobsResponse;
        setStatus(json.employer.verificationStatus);
      } catch (err) {
        console.error("Post-job gate error:", err);
        if (active) setGateError("Failed to load employer profile");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/v1/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          employmentType: form.employmentType,
          workMode: form.workMode,
          ...(form.salaryBand ? { salaryBand: form.salaryBand } : {}),
          district: form.district,
          skillsRequired: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          openings: form.openings,
          ...(form.applicationDeadline
            ? { applicationDeadline: new Date(form.applicationDeadline).toISOString() }
            : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to create job posting");
      }
      setPosted(true);
      // Let the success state register, then return to the dashboard where
      // the new posting heads the list.
      setTimeout(() => router.push("/employer/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job posting");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href="/employer/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {checking ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : gateError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{gateError}</AlertDescription>
          </Alert>
        ) : status === "PENDING" ? (
          <Alert className="border-yellow-600 bg-yellow-50 [&>svg]:text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification pending</AlertTitle>
            <AlertDescription>
              Your registration is under review. You can log in, and will be able to post jobs once
              an admin verifies your account.
            </AlertDescription>
          </Alert>
        ) : status === "SUSPENDED" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Account suspended</AlertTitle>
            <AlertDescription>
              Job posting is disabled. Contact the skill mission team to reinstate your account.
            </AlertDescription>
          </Alert>
        ) : status === "REJECTED" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration rejected</AlertTitle>
            <AlertDescription>
              Your employer registration was not approved. Contact the skill mission team for
              details.
            </AlertDescription>
          </Alert>
        ) : posted ? (
          <Alert className="border-green-600 bg-green-50 [&>svg]:text-green-600">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Job posted</AlertTitle>
            <AlertDescription>
              Your posting is live on the trainee job board. Returning to the dashboard…
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create a new job posting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. CNC Machine Operator"
                    maxLength={120}
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="job-description">Description</Label>
                  <Textarea
                    id="job-description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Role, responsibilities, requirements…"
                    maxLength={5000}
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                    <SelectTrigger className="w-full" disabled={creating}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t] ?? t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select value={form.workMode} onValueChange={(v) => setForm({ ...form, workMode: v })}>
                    <SelectTrigger className="w-full" disabled={creating}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_MODES.map((m) => (
                        <SelectItem key={m} value={m}>{WORK_MODE_LABELS[m] ?? m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Salary Band</Label>
                  <Select
                    value={form.salaryBand || "none"}
                    onValueChange={(v) => setForm({ ...form, salaryBand: v === "none" ? "" : v })}
                  >
                    <SelectTrigger className="w-full" disabled={creating}>
                      <SelectValue placeholder="Not specified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {SALARY_BANDS.map((b) => (
                        <SelectItem key={b} value={b}>{SALARY_BAND_LABELS[b] ?? b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                    <SelectTrigger className="w-full" disabled={creating}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-skills">Skills Required</Label>
                  <Input
                    id="job-skills"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="Comma-separated, e.g. Welding, CNC, Safety"
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-openings">Openings</Label>
                  <Input
                    id="job-openings"
                    type="number"
                    min={1}
                    max={100}
                    value={form.openings}
                    onChange={(e) => setForm({ ...form, openings: e.target.value })}
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="job-deadline">Application Deadline (optional)</Label>
                  <Input
                    id="job-deadline"
                    type="date"
                    value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                    disabled={creating}
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                className="gap-2"
                onClick={() => void handleCreate()}
                disabled={
                  creating ||
                  form.title.trim().length < 3 ||
                  form.description.trim().length < 10 ||
                  !form.district ||
                  form.skills.split(",").filter((s) => s.trim()).length === 0
                }
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Posting…" : "Post Job"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
