"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Save, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { ErrorState } from "~/components/patterns/error-state";
import { Spinner } from "~/components/ui/spinner";
import { format } from "~/lib/format";

/**
 * Employer verification per design §9.2 — Shell S4 (centered card). The
 * verifier is the employer: after submitting, return to the employer login
 * (a /dashboard redirect would lock non-trainee roles out).
 */

interface ClaimData {
  id: string;
  traineeFirstName: string;
  employerName: string | null;
  role: string | null;
  startDate: string | null;
  salaryBand: string | null;
}

interface VerificationResponse {
  claim: ClaimData;
  error?: { message?: string };
}

const salaryBandLabels: Record<string, string> = {
  LT_10K: "< ₹10,000",
  B_10_20K: "₹10,000 - ₹20,000",
  B_20_35K: "₹20,000 - ₹35,000",
  B_35_50K: "₹35,000 - ₹50,000",
  GT_50K: "> ₹50,000",
};

export default function EmployerVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params.token === "string" ? params.token : "";

  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"confirm" | "reject" | "edit" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState({ employerName: "", role: "", salaryBand: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/v1/verification/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load verification");
        return res.json();
      })
      .then((data: VerificationResponse) => {
        setClaim(data.claim);
        setEditData({
          employerName: data.claim.employerName ?? "",
          role: data.claim.role ?? "",
          salaryBand: data.claim.salaryBand ?? "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load verification");
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || (!reason && action === "reject")) return;

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "reject") body.reason = reason;
      if (action === "edit") {
        body.employerName = editData.employerName;
        body.role = editData.role;
        body.salaryBand = editData.salaryBand;
      }

      const res = await fetch(`/api/v1/verification/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as VerificationResponse;
      if (!res.ok) throw new Error(data.error?.message ?? "Failed to submit");

      toast.success(
        action === "confirm" ? "Employment confirmed" : action === "reject" ? "Claim rejected" : "Claim updated",
        { description: "Sign in to see the updated status." },
      );

      setTimeout(() => router.push("/employer/login"), 2000);
    } catch (err) {
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background p-4">
        <Spinner className="size-6 text-primary-strong" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="grid min-h-svh place-items-center bg-background p-4">
        <ErrorState
          title="Verification link invalid"
          description={
            error ?? "This verification link is invalid, expired, or has already been used."
          }
          retryLabel="Back to sign in"
          onRetry={() => router.push("/login")}
        />
      </div>
    );
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo above card (§9.2) */}
        <div className="mb-8 flex justify-center">
          <span className="flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <span className="text-title font-semibold text-foreground">
              SkillsTrack
            </span>
          </span>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          {/* Card header — center (§3.6 auth) */}
          <div className="space-y-1 text-center">
            <h2 className="text-h2 font-semibold">Verify employment</h2>
            <p className="text-caption text-muted-foreground">
              Review the details below, then confirm or reject this claim from{" "}
              {claim.traineeFirstName}.
            </p>
          </div>

          {/* Claim details — bg-muted panel (§4.4) */}
          <div className="mt-6 grid gap-3 rounded-lg bg-muted p-3">
            {isEditing ? (
              <>
                <div className="grid gap-1.5">
                  <label htmlFor="edit-employerName" className="text-caption font-medium text-muted-foreground">
                    Employer
                  </label>
                  <Input
                    id="edit-employerName"
                    type="text"
                    value={editData.employerName}
                    onChange={(e) => setEditData((prev) => ({ ...prev, employerName: e.target.value }))}
                    placeholder="Employer name"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="edit-role" className="text-caption font-medium text-muted-foreground">
                    Role
                  </label>
                  <Input
                    id="edit-role"
                    type="text"
                    value={editData.role}
                    onChange={(e) => setEditData((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Role/designation"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="edit-salaryBand" className="text-caption font-medium text-muted-foreground">
                    Salary band
                  </label>
                  <Select
                    value={editData.salaryBand}
                    onValueChange={(v) => setEditData((prev) => ({ ...prev, salaryBand: v }))}
                  >
                    <SelectTrigger id="edit-salaryBand" className="w-full">
                      <SelectValue placeholder="Select salary band" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LT_10K">Less than ₹10,000</SelectItem>
                      <SelectItem value="B_10_20K">₹10,000 - ₹20,000</SelectItem>
                      <SelectItem value="B_20_35K">₹20,000 - ₹35,000</SelectItem>
                      <SelectItem value="B_35_50K">₹35,000 - ₹50,000</SelectItem>
                      <SelectItem value="GT_50K">More than ₹50,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Employer</p>
                  <p className="text-body-sm font-medium">{claim.employerName ?? "Not provided"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Role</p>
                  <p className="text-body-sm font-medium">{claim.role ?? "Not provided"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Start date</p>
                  <p className="text-body-sm font-medium">
                    {claim.startDate ? format.date(claim.startDate) : "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Salary band</p>
                  <p className="text-body-sm font-medium">
                    {claim.salaryBand ? salaryBandLabels[claim.salaryBand] : "Not provided"}
                  </p>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {!isEditing ? (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={action === "confirm" ? "default" : "outline"}
                  onClick={() => setAction("confirm")}
                >
                  <ShieldCheck aria-hidden />
                  Confirm
                </Button>
                <Button
                  type="button"
                  variant={action === "reject" ? "destructive" : "outline"}
                  onClick={() => setAction("reject")}
                >
                  <XCircle aria-hidden />
                  Reject
                </Button>
                <Button
                  type="button"
                  variant={action === "edit" ? "default" : "outline"}
                  onClick={() => {
                    setIsEditing(true);
                    setAction("edit");
                  }}
                >
                  <Edit aria-hidden />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Back
                </Button>
                <Button type="button" variant="default" onClick={() => setAction("edit")}>
                  <Save aria-hidden />
                  Save changes
                </Button>
              </div>
            )}

            {action === "reject" ? (
              <div className="grid gap-1.5">
                <label htmlFor="reason" className="text-body-sm font-medium">
                  Reason for rejection <span className="text-danger-text">*</span>
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this claim..."
                  rows={3}
                  required
                  aria-required="true"
                />
              </div>
            ) : null}

            {action ? (
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                size="lg"
                variant={action === "reject" ? "destructive" : "default"}
              >
                {submitting ? <Spinner className="size-4" /> : null}
                {action === "confirm" ? "Confirm employment" : action === "edit" ? "Save changes" : "Reject claim"}
              </Button>
            ) : (
              <p className="text-center text-caption text-muted-foreground">
                Select an option above to proceed
              </p>
            )}
          </form>
        </div>

        {/* Footer note (§9.2 caption slot) */}
        <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-caption text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          This is a one-time verification link — once submitted, it cannot be used again.
        </p>
      </div>
    </div>
  );
}
