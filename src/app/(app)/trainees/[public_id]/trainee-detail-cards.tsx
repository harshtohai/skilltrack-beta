import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CopyButton } from "~/components/copy-button";
import { EmptyState } from "~/components/patterns/empty-state";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { date, datetime } from "~/lib/format";
import { educationLabel, maskPhoneE164 } from "~/lib/utils";
import { SALARY_BAND_LABELS } from "./trainee-timeline";

/**
 * Trainee detail header cards (§9.5): Identity as a description list (Summary)
 * and Current status for the latest employment claim (Details). Server
 * components — the page passes only serializable, field-narrow props.
 */

/** Description list per §4: `grid grid-cols-2 gap-y-3`, label muted, value medium. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-body-sm text-muted-foreground">{label}</dt>
      <dd className="text-body-sm font-medium">{children}</dd>
    </>
  );
}

export function IdentityCard({
  publicId,
  phoneE164,
  email,
  dateOfBirth,
  address,
  educationLevel,
  district,
  language,
  consentGiven,
  consentGivenAt,
  consentMethod,
  consentRevokedAt,
}: {
  publicId: string;
  phoneE164: string;
  email: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  educationLevel: string | null;
  district: string;
  language: string;
  consentGiven: boolean;
  consentGivenAt: Date | null;
  consentMethod: string | null;
  consentRevokedAt: Date | null;
}) {
  return (
    <Card className="p-5 lg:col-span-2">
      <CardHeader className="p-0">
        <CardTitle>Identity</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <dl className="grid grid-cols-2 gap-y-3">
          <DetailRow label="Trainee ID">
            <span className="inline-flex items-center gap-1">
              <span className="font-mono text-primary-strong">{publicId}</span>
              <CopyButton value={publicId} />
            </span>
          </DetailRow>
          <DetailRow label="Phone">
            <span className="font-mono">{maskPhoneE164(phoneE164)}</span>
          </DetailRow>
          <DetailRow label="Email">{email ?? "—"}</DetailRow>
          <DetailRow label="Date of birth">{dateOfBirth ? date(dateOfBirth) : "—"}</DetailRow>
          <DetailRow label="Education">{educationLabel(educationLevel)}</DetailRow>
          <DetailRow label="District">{district}</DetailRow>
          <DetailRow label="Language">{language === "EN" ? "English" : "Hindi"}</DetailRow>
          <div className="col-span-2">
            <DetailRow label="Address">{address ?? "—"}</DetailRow>
          </div>
          <DetailRow label="Consent">
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <StatusBadge status={consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
              {consentGiven && consentGivenAt ? (
                <span className="text-caption font-normal text-muted-foreground">
                  on {datetime(consentGivenAt)}
                </span>
              ) : null}
              {consentRevokedAt ? (
                <span className="text-caption font-normal text-warning-text">(Revoked)</span>
              ) : null}
            </span>
          </DetailRow>
          {consentMethod ? (
            <DetailRow label="Consent method">{consentMethod}</DetailRow>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Narrowed view of the latest employment claim — serializable across the
 * server page → card boundary without coupling to the Prisma model. */
export interface LatestClaimView {
  verificationStatus: StatusKey;
  evidenceLevel: number;
  employerName: string | null;
  role: string | null;
  salaryBand: string | null;
}

export function CurrentStatusCard({ claim }: { claim: LatestClaimView | null }) {
  return (
    <Card className="p-5">
      <CardHeader className="p-0">
        <CardTitle>Current status</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {claim ? (
          <dl className="grid grid-cols-2 gap-y-3">
            <DetailRow label="Verification">
              <StatusBadge status={claim.verificationStatus} />
            </DetailRow>
            <DetailRow label="Evidence">
              <StatusBadge evidence={claim.evidenceLevel} />
            </DetailRow>
            <DetailRow label="Employer">{claim.employerName ?? "—"}</DetailRow>
            <DetailRow label="Role">{claim.role ?? "—"}</DetailRow>
            <DetailRow label="Salary band">
              {claim.salaryBand
                ? SALARY_BAND_LABELS[claim.salaryBand] ?? claim.salaryBand
                : "—"}
            </DetailRow>
          </dl>
        ) : (
          <EmptyState
            icon={<Briefcase />}
            title="No employment claim yet"
            description="Trigger a follow-up to start tracking."
          />
        )}
      </CardContent>
    </Card>
  );
}
