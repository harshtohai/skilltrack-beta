"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { StatusBadge } from "~/components/patterns/status-badge";
import { ChangeEmailDialog } from "./change-email-dialog";
import { datetime } from "~/lib/format";
import { maskPhoneE164 } from "~/lib/utils";

/**
 * Verified-information card (§9.7 rows pattern): email (with the T5
 * change-email dialog), masked phone, consent and gender. Locked except the
 * email, which changes only through the OTP-verified flow — never here.
 */
const GENDER_LABELS: Record<string, string> = {
  FEMALE: "Female",
  MALE: "Male",
  NON_BINARY: "Non-binary",
  SELF_DESCRIBED: "Prefer to self-describe",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export function VerifiedInfoCard({
  email,
  phoneE164,
  consentGiven,
  consentGivenAt,
  gender,
  genderSelfDescribed,
  onEmailChanged,
}: {
  email: string | null;
  phoneE164: string;
  consentGiven: boolean;
  consentGivenAt: string | null;
  gender: string;
  genderSelfDescribed: string | null;
  onEmailChanged: () => void;
}) {
  const [changeOpen, setChangeOpen] = useState(false);

  // Self-reported gender for the info list; "—" when prefer-not-to-say/unset.
  const genderDisplay =
    gender === "SELF_DESCRIBED" && genderSelfDescribed
      ? genderSelfDescribed
      : gender && gender !== "PREFER_NOT_TO_SAY"
        ? (GENDER_LABELS[gender] ?? "—")
        : "—";

  return (
    <Card id="verified-info" className="scroll-mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Verified Information</CardTitle>
        <Lock className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-4 border-b py-4">
          <span className="text-body-sm text-muted-foreground">Email</span>
          <div className="flex items-center gap-3">
            <span className="text-body-sm font-medium">{email ?? "—"}</span>
            <Button variant="outline" size="sm" onClick={() => setChangeOpen(true)}>
              Change email
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-b py-4">
          <span className="text-body-sm text-muted-foreground">Phone (verified via WhatsApp)</span>
          <span className="font-mono text-body-sm font-medium tabular-nums">{maskPhoneE164(phoneE164)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-b py-4">
          <span className="text-body-sm text-muted-foreground">Consent</span>
          <div className="flex items-center gap-3">
            <StatusBadge status={consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
            {consentGiven && consentGivenAt ? (
              <span className="text-caption text-muted-foreground">{datetime(consentGivenAt)}</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-b py-4">
          <span className="text-body-sm text-muted-foreground">Gender</span>
          <span className="text-body-sm font-medium">{genderDisplay}</span>
        </div>
      </CardContent>

      <ChangeEmailDialog
        open={changeOpen}
        onOpenChange={setChangeOpen}
        currentEmail={email}
        onCompleted={onEmailChanged}
      />
    </Card>
  );
}
