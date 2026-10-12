"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorState } from "~/components/patterns/error-state";
import {
  ProfileSkeleton,
  ProfileSubNav,
  TraineeIdCard,
  VerifiedInfoCard,
  MyTrainingCard,
  type TraineeProfile,
} from "./profile-sections";
import { CertificatesCard, EmploymentHistoryCard, OutcomeCheckpointsCard } from "./profile-record-cards";
import { ProfileDetailsForm } from "./profile-details-form";

/**
 * Trainee self-service profile (§9.7 settings pattern): S1 shell from the
 * (app) layout, `lg:flex lg:gap-8` with a left sub-nav (items h-9, active
 * bg-accent) and a `max-w-3xl` content column. Trainee ID card with copy,
 * profile details form with dirty-state Save (toast on save, leave guard when
 * dirty), verified-information card with lock + consent, certificates/
 * employment/checkpoint cards as §9.7 border-b rows. Statuses via StatusBadge
 * only (§4.10/CL-12). Form state and the save/dirty/leave-guard logic live
 * here; sections render from profile-sections.tsx, profile-record-cards.tsx
 * and profile-details-form.tsx.
 */

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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("");
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [genderSelfDescribed, setGenderSelfDescribed] = useState("");

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
      setGender(json.trainee.gender ?? "PREFER_NOT_TO_SAY");
      setGenderSelfDescribed(json.trainee.genderSelfDescribed ?? "");
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
          gender,
          genderSelfDescribed: gender === "SELF_DESCRIBED" ? genderSelfDescribed.trim() || null : null,
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

  const dirty = data
    ? fullName !== data.trainee.fullName ||
      email !== (data.trainee.email ?? "") ||
      district !== data.trainee.district ||
      language !== data.trainee.language ||
      gender !== data.trainee.gender ||
      genderSelfDescribed !== (data.trainee.genderSelfDescribed ?? "")
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
  const saveDisabled =
    saving ||
    !dirty ||
    !fullName.trim() ||
    (gender === "SELF_DESCRIBED" && !genderSelfDescribed.trim());

  return (
    <div className="lg:flex lg:gap-8">
      <ProfileSubNav />

      <div className="min-w-0 flex-1 space-y-6 lg:max-w-3xl">
        {/* Trainee ID — prominent + copyable */}
        <TraineeIdCard publicId={trainee.publicId} />

        {/* Editable profile (§10 settings flow: dirty state enables Save) */}
        <ProfileDetailsForm
          fullName={fullName}
          onFullNameChange={setFullName}
          email={email}
          onEmailChange={setEmail}
          district={district}
          onDistrictChange={setDistrict}
          language={language}
          onLanguageChange={setLanguage}
          gender={gender}
          onGenderChange={setGender}
          genderSelfDescribed={genderSelfDescribed}
          onGenderSelfDescribedChange={setGenderSelfDescribed}
          districts={data.districts}
          saving={saving}
          saveDisabled={saveDisabled}
          onSave={() => void handleSave()}
        />

        {/* Locked fields (§9.7 rows pattern) */}
        <VerifiedInfoCard
          phoneE164={trainee.phoneE164}
          consentGiven={trainee.consentGiven}
          consentGivenAt={trainee.consentGivenAt}
          gender={trainee.gender}
          genderSelfDescribed={trainee.genderSelfDescribed}
          onPhoneChanged={() => void loadProfile()}
        />

        {/* My Training (T8): read-only enrolment chain */}
        <MyTrainingCard training={trainee.training ?? []} />

        {/* Certificates (§9.7 rows pattern) */}
        <CertificatesCard certificates={trainee.certificates} />

        {/* Employment history (§9.7 rows pattern) */}
        <EmploymentHistoryCard employmentHistory={trainee.employmentHistory} />

        {/* Outcome checkpoints (§9.7 rows pattern) */}
        <OutcomeCheckpointsCard outcomeEvents={trainee.outcomeEvents} />
      </div>
    </div>
  );
}
