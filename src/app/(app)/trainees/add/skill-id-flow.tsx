"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { StatusBadge } from "~/components/patterns/status-badge";
import { EDUCATION_LEVELS, maskEmail } from "~/lib/utils";
import { EnrollmentSelect } from "./enrollment-select";
import type { CohortOption } from "./add-trainee-form";

/**
 * "Has a SkillID" path (INST-04): global lookup (TRN id or phone) → the
 * institute confirms the person and fills any MISSING identity fields
 * (never overwrites) → picks programme/cohort → link-enrol creates ONE new
 * enrolment on the existing trainee record. Not found → clean hand-off to
 * the manual form.
 */

type LookupProfile = {
  id: string;
  publicId: string;
  fullName: string;
  phoneMasked: string;
  email: string | null;
  district: string;
  dateOfBirth: string | null;
  address: string | null;
  educationLevel: string | null;
  consentGiven: boolean;
};

type LookupEnrolment = {
  id: string;
  status: string;
  cohortName: string;
  programmeName: string;
  centerName: string;
  startDate: string;
  endDate: string;
};

type LookupResult = { profile: LookupProfile; enrolments: LookupEnrolment[]; missing: string[] };

const SEND_FAIL = "Lookup failed. Try again in a moment.";

export function SkillIdFlow({
  programmes,
  cohorts,
  onSwitchToManual,
}: {
  programmes: { id: string; name: string }[];
  cohorts: Pick<CohortOption, "id" | "name" | "programmeId">[];
  onSwitchToManual: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"lookup" | "confirm" | "enrol">("lookup");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [updates, setUpdates] = useState<{ email: string; dateOfBirth: string; address: string; educationLevel: string }>({
    email: "",
    dateOfBirth: "",
    address: "",
    educationLevel: "",
  });
  const [programmeId, setProgrammeId] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [enrolError, setEnrolError] = useState("");
  const [alreadyLink, setAlreadyLink] = useState<string | null>(null);
  const [otherSkillId, setOtherSkillId] = useState<string | null>(null);

  async function runLookup(qOverride?: string) {
    const q = (qOverride ?? query).trim();
    if (q.length < 4) return setError("Enter the SkillID or the trainee's phone number");
    setError("");
    setNotFound(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/trainees/lookup?q=${encodeURIComponent(q)}`);
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & Partial<LookupResult>;
      if (!res.ok || !json.profile) {
        setError(json.error?.message ?? SEND_FAIL);
        setLoading(false);
        return;
      }
      setResult({ profile: json.profile, enrolments: json.enrolments ?? [], missing: json.missing ?? [] });
      // Fresh profile — stale fill values from a previous lookup must not leak in.
      setUpdates({ email: "", dateOfBirth: "", address: "", educationLevel: "" });
      setStep("confirm");
    } catch {
      setError(SEND_FAIL);
    }
    setLoading(false);
  }

  const fill = (key: keyof typeof updates) => {
    const value = updates[key].trim();
    return value !== "" ? { [key]: value } : {};
  };

  async function submitLink() {
    if (!result || !cohortId) return;
    setEnrolError("");
    setOtherSkillId(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/trainees/link-enrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traineeId: result.profile.id,
          cohortId,
          confirmed: true,
          updates: { ...fill("email"), ...fill("dateOfBirth"), ...fill("address"), ...fill("educationLevel") },
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
        traineePublicId?: string;
        otherTraineePublicId?: string;
      };
      if (res.ok) {
        router.push(`/trainees/${json.traineePublicId ?? result.profile.publicId}`);
        return;
      }
      if (json.error?.code === "ALREADY_ENROLLED") {
        setAlreadyLink(json.traineePublicId ?? result.profile.publicId);
      } else if (json.error?.code === "EMAIL_ON_OTHER_SKILLID") {
        // The filled email belongs to a different trainee row (duplicate
        // human) — offer to pull that record up instead.
        setOtherSkillId(json.otherTraineePublicId ?? null);
      }
      setEnrolError(json.error?.message ?? "Couldn't enrol the trainee. Try again.");
    } catch {
      setEnrolError("Couldn't enrol the trainee. Try again.");
    }
    setLoading(false);
  }

  if (step === "lookup") {
    return (
      <Card className="p-5">
        <CardHeader className="p-0">
          <CardTitle>Find the trainee</CardTitle>
          <CardDescription>
            Search by their SkillID (TRN-…) or phone number — works across all centers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-0 pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="TRN-XXXXXX-XXXX or 9876543210"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError("");
                if (notFound) setNotFound(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && void runLookup()}
              disabled={loading}
              aria-label="SkillID or phone number"
            />
            <Button onClick={() => void runLookup()} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Search
            </Button>
          </div>

          {error ? (
            <p role="alert" className="text-caption text-danger-text">
              {error}
            </p>
          ) : null}

          {notFound ? (
            <Alert>
              <AlertTitle>No match</AlertTitle>
              <AlertDescription>
                No trainee matches that SkillID or phone. They may be brand new —{" "}
                <button type="button" className="font-medium underline" onClick={onSwitchToManual}>
                  add them manually instead
                </button>
                .
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const p = result?.profile;
  const enrolments = result?.enrolments ?? [];
  const missing = result?.missing ?? [];

  return (
    <div className="space-y-4">
      {/* Step: confirm identity + fill what's missing */}
      {step === "confirm" && p ? (
        <>
          <Card className="p-5">
            <CardHeader className="p-0">
              <CardTitle>Confirm the trainee</CardTitle>
              <CardDescription>
                Match found — check this is the person in front of you before enrolling.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 p-0 pt-4">
              <dl className="grid grid-cols-2 gap-y-2 text-body-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{p.fullName}</dd>
                <dt className="text-muted-foreground">SkillID</dt>
                <dd className="font-mono text-primary-strong">{p.publicId}</dd>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-mono">{p.phoneMasked}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{p.email ? maskEmail(p.email) : "—"}</dd>
                <dt className="text-muted-foreground">District</dt>
                <dd>{p.district}</dd>
                <dt className="text-muted-foreground">Consent</dt>
                <dd>
                  <StatusBadge status={p.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
                </dd>
              </dl>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="p-0">
              <CardTitle className="text-body">Existing enrolments</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              {enrolments.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">None yet — this would be their first.</p>
              ) : (
                <ul className="space-y-2">
                  {enrolments.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 text-body-sm">
                      <span>
                        {e.programmeName} · {e.cohortName}
                        <span className="text-muted-foreground"> @ {e.centerName}</span>
                      </span>
                      <Badge variant="outline">{e.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {missing.length > 0 ? (
            <Card className="p-5">
              <CardHeader className="p-0">
                <CardTitle className="text-body">Missing details</CardTitle>
                <CardDescription>
                  Optional — fill what the trainee is missing. Existing data is never overwritten.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-0 pt-3">
                {missing.includes("email") ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="fill-email">Email</Label>
                    <Input
                      id="fill-email"
                      type="email"
                      value={updates.email}
                      onChange={(e) => setUpdates((u) => ({ ...u, email: e.target.value }))}
                      placeholder="trainee@email.com"
                      disabled={loading}
                    />
                  </div>
                ) : null}
                {missing.includes("dateOfBirth") ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="fill-dob">Date of birth</Label>
                    <Input
                      id="fill-dob"
                      type="date"
                      value={updates.dateOfBirth}
                      onChange={(e) => setUpdates((u) => ({ ...u, dateOfBirth: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                ) : null}
                {missing.includes("address") ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="fill-address">Address</Label>
                    <Textarea
                      id="fill-address"
                      rows={2}
                      value={updates.address}
                      onChange={(e) => setUpdates((u) => ({ ...u, address: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                ) : null}
                {missing.includes("educationLevel") ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="fill-education">Education</Label>
                    <Select
                      value={updates.educationLevel}
                      onValueChange={(v) => setUpdates((u) => ({ ...u, educationLevel: v }))}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select highest qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="p-5">
            <CardContent className="space-y-3 p-0">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirm-identity"
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v === true)}
                  disabled={loading}
                />
                <Label htmlFor="confirm-identity" className="text-body-sm font-normal leading-snug">
                  This is the same person — I have verified their identity against the record.
                </Label>
              </div>
              <div className="flex justify-between gap-3">
                <Button variant="outline" size="sm" onClick={() => setStep("lookup")} disabled={loading}>
                  Back
                </Button>
                <Button size="sm" disabled={!confirmed} onClick={() => setStep("enrol")}>
                  Continue to enrollment
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Step: pick cohort, then link */}
      {step === "enrol" && p ? (
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Enrol {p.fullName}</CardTitle>
            <CardDescription>
              Creates a new enrolment on their existing record ({p.publicId}) — nothing is duplicated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-0 pt-4">
            <EnrollmentSelect
              programmes={programmes}
              cohorts={cohorts}
              programmeId={programmeId}
              cohortId={cohortId}
              onProgrammeChange={setProgrammeId}
              onCohortChange={setCohortId}
              disabled={loading}
            />
            {enrolError ? (
              <div className="space-y-2">
                <p role="alert" className="text-caption text-danger-text">
                  {enrolError}{" "}
                  {alreadyLink ? (
                    <Link href={`/trainees/${alreadyLink}`} className="underline">
                      View their record
                    </Link>
                  ) : null}
                </p>
                {otherSkillId ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEnrolError("");
                      setOtherSkillId(null);
                      setStep("lookup");
                      void runLookup(otherSkillId);
                    }}
                  >
                    Search {otherSkillId} instead
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep("confirm")} disabled={loading}>
                Back
              </Button>
              <Button size="sm" disabled={loading || !cohortId} onClick={() => void submitLink()}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null} Enrol trainee
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

