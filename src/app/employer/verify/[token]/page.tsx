"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, XCircle, Loader2, AlertCircle, Info, Edit, Save, ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/hooks/use-toast";

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

interface ClaimData {
  id: string;
  traineeFirstName: string;
  employerName: string | null;
  role: string | null;
  startDate: string | null;
  salaryBand: string | null;
}

export default function EmployerVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

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
      .then((data) => {
        setClaim(data.claim);
        setEditData({
          employerName: data.claim.employerName || "",
          role: data.claim.role || "",
          salaryBand: data.claim.salaryBand || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to submit");

      toast({
        title: action === "confirm" ? "Confirmed" : action === "reject" ? "Rejected" : "Updated",
        description:
          action === "confirm"
            ? "Employment claim has been confirmed."
            : action === "reject"
            ? "Employment claim has been rejected."
            : "Employment claim has been updated.",
        variant: action === "confirm" ? "success" : action === "reject" ? "destructive" : "success",
      });

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verification Link Invalid</h1>
        <p className="text-muted-foreground mb-6">
          {error || "This verification link is invalid, expired, or has already been used."}
        </p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const salaryBandLabels: Record<string, string> = {
    LT_10K: "< ₹10,000",
    B_10_20K: "₹10,000 - ₹20,000",
    B_20_35K: "₹20,000 - ₹35,000",
    B_35_50K: "₹35,000 - ₹50,000",
    GT_50K: "> ₹50,000",
  };

  return (
    <div className="container py-8 max-w-md">
      <div className="text-center mb-8">
        <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Verify Employment</h1>
        <p className="text-muted-foreground mt-2">
          Please review the details below and confirm or reject this employment claim.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employment Claim</CardTitle>
          <CardDescription>Submitted by {claim.traineeFirstName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="edit-employerName" className="text-sm font-medium text-muted-foreground">Employer</label>
                <input
                  id="edit-employerName"
                  type="text"
                  value={editData.employerName}
                  onChange={(e) => setEditData((prev) => ({ ...prev, employerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Employer name"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-role" className="text-sm font-medium text-muted-foreground">Role</label>
                <input
                  id="edit-role"
                  type="text"
                  value={editData.role}
                  onChange={(e) => setEditData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Role/designation"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-salaryBand" className="text-sm font-medium text-muted-foreground">Salary Band</label>
                <select
                  id="edit-salaryBand"
                  value={editData.salaryBand}
                  onChange={(e) => setEditData((prev) => ({ ...prev, salaryBand: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select salary band</option>
                  <option value="LT_10K">Less than ₹10,000</option>
                  <option value="B_10_20K">₹10,000 - ₹20,000</option>
                  <option value="B_20_35K">₹20,000 - ₹35,000</option>
                  <option value="B_35_50K">₹35,000 - ₹50,000</option>
                  <option value="GT_50K">More than ₹50,000</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Employer</label>
                <p className="font-medium">{claim.employerName || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="font-medium">{claim.role || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="font-medium">{claim.startDate ? new Date(claim.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Salary Band</label>
                <p className="font-medium">{claim.salaryBand ? salaryBandLabels[claim.salaryBand] : "Not provided"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {!isEditing ? (
          <div className="flex gap-4">
            <Button
              type="button"
              variant={action === "confirm" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setAction("confirm")}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Confirm
            </Button>
            <Button
              type="button"
              variant={action === "reject" ? "destructive" : "outline"}
              className="flex-1"
              onClick={() => setAction("reject")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              type="button"
              variant={action === "edit" ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                setIsEditing(true);
                setAction("edit");
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              variant={action === "edit" ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                setAction("edit");
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}

        {action === "reject" && (
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for rejection (required)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this claim..."
              rows={3}
              required
            />
          </div>
        )}

        {action && (
          <Button type="submit" disabled={submitting} className="w-full" variant={action === "confirm" ? "default" : action === "edit" ? "default" : "destructive"}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {action === "confirm" ? "Confirm Employment" : action === "edit" ? "Save Changes" : "Reject Claim"}
          </Button>
        )}

        {!action && !isEditing && (
          <p className="text-center text-sm text-muted-foreground">
            Select an option above to proceed
          </p>
        )}
      </form>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <Info className="h-4 w-4 text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">
          This is a one-time verification link. Once submitted, it cannot be used again.
        </span>
      </div>
    </div>
  );
}