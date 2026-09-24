"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Copy, Check, Save, Lock, AlertCircle, Award, Briefcase, Target } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { formatDate } from "~/lib/utils";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  certificates: Array<{ id: string; name: string; issuer: string; issueDate: string; expiryDate: string | null; fileUrl: string | null }>;
  employmentHistory: Array<{ id: string; employer: string; role: string | null; salaryBand: string | null; startDate: string; endDate: string | null; isCurrent: boolean }>;
  outcomeEvents: Array<{ id: string; checkpointDays: number; outcomeStatus: string; verificationStatus: string; createdAt: string }>;
}

interface MeResponse {
  trainee: TraineeProfile;
  districts: string[];
}

export default function TraineeProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("");

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
    setSaved(false);

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
      setSaved(true);
      void loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
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
      setError("Could not copy trainee ID");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error || "Failed to load profile"}</p>
      </div>
    );
  }

  const trainee = data.trainee;
  const dirty =
    fullName !== trainee.fullName ||
    email !== (trainee.email ?? "") ||
    district !== trainee.district ||
    language !== trainee.language;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">{trainee.fullName}</p>
            </div>
          </div>
          <Badge variant="secondary">{trainee.language === "HI" ? "हिंदी" : "English"}</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Trainee ID — prominent + copyable */}
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your Trainee ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <span className="text-2xl font-mono font-bold text-primary">{trainee.publicId}</span>
              <Button variant="outline" size="sm" onClick={() => void copyTraineeId()} className="gap-2">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Share this ID with your training center or employer for verification.</p>
          </CardContent>
        </Card>

        {/* Editable profile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Details</CardTitle>
            {saved && !dirty && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-6 gap-2"
              onClick={() => void handleSave()}
              disabled={saving || !dirty || !fullName.trim()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Locked fields */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Verified Information</CardTitle>
            <Lock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phone (verified via WhatsApp)</span>
              <span className="text-sm font-medium font-mono">{trainee.phoneE164.replace(/(\+91)(\d{5})(\d{5})/, "$1 XXXXX $3")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Consent</span>
              {trainee.consentGiven ? (
                <Badge variant="success">Granted{trainee.consentGivenAt ? ` · ${formatDate(new Date(trainee.consentGivenAt))}` : ""}</Badge>
              ) : (
                <Badge variant="secondary">Not given</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card>
          <CardTitle className="px-6 pt-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" /> Certificates
          </CardTitle>
          <CardContent className="pt-4">
            {trainee.certificates.length === 0 ? (
              <p className="text-sm text-gray-500">No certificates yet.</p>
            ) : (
              <div className="space-y-2">
                {trainee.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{cert.name}</p>
                      <p className="text-xs text-gray-500">{cert.issuer}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(new Date(cert.issueDate))}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment history */}
        <Card>
          <CardTitle className="px-6 pt-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" /> Employment History
          </CardTitle>
          <CardContent className="pt-4">
            {trainee.employmentHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No employment history yet.</p>
            ) : (
              <div className="space-y-2">
                {trainee.employmentHistory.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{job.employer}</p>
                      <p className="text-xs text-gray-500">{job.role ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      {job.isCurrent && <Badge variant="success" className="mb-1">Current</Badge>}
                      <p className="text-xs text-gray-500">{formatDate(new Date(job.startDate))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outcomes */}
        <Card>
          <CardTitle className="px-6 pt-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" /> Outcome Checkpoints
          </CardTitle>
          <CardContent className="pt-4">
            {trainee.outcomeEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No outcome checkpoints yet.</p>
            ) : (
              <div className="space-y-2">
                {trainee.outcomeEvents.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{o.checkpointDays}-day checkpoint</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(o.outcomeStatus) ? "success" : "secondary"}>
                        {o.outcomeStatus.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDate(new Date(o.createdAt))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
