"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type {
  PendingEmployer,
  PendingEmployersResponse,
  VerifyEmployerInput,
} from "~/lib/job-board-contracts";

interface VerificationQueueProps {
  /** Notify the parent so dependent analytics (verified badge) refresh. */
  onChanged?: () => void;
}

interface ConfirmAction {
  employer: PendingEmployer;
  decision: VerifyEmployerInput["decision"];
}

/** Admin verification queue: pending recruiters with Approve / Reject. */
export function VerificationQueue({ onChanged }: VerificationQueueProps) {
  const [employers, setEmployers] = useState<PendingEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<ConfirmAction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/employers/pending");
      if (!res.ok) throw new Error("Failed to fetch pending recruiters");
      const json = (await res.json()) as PendingEmployersResponse;
      setEmployers(json.employers);
    } catch (err) {
      console.error("Failed to fetch pending recruiters:", err);
      setError("Failed to load the verification queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const recordDecision = async () => {
    if (!action) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/employers/${action.employer.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: action.decision } satisfies VerifyEmployerInput),
      });
      if (!res.ok) throw new Error("Failed to record decision");
      setEmployers((prev) => prev.filter((e) => e.id !== action.employer.id));
      setAction(null);
      onChanged?.();
    } catch (err) {
      console.error("Failed to record decision:", err);
      setError("Failed to record the decision. Please retry.");
      setAction(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Verification Queue</CardTitle>
          <p className="text-sm text-gray-500">
            Recruiter signups awaiting a decision. Approve lets them post jobs immediately; Reject marks them rejected.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => void fetchQueue()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          </div>
        ) : employers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No pending recruiters</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Recruiter</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Registration No</TableHead>
                <TableHead>Hiring Needs</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employers.map((employer) => (
                <TableRow key={employer.id}>
                  <TableCell className="font-medium">{employer.companyName}</TableCell>
                  <TableCell className="font-mono text-xs">{employer.contactEmail}</TableCell>
                  <TableCell>{employer.sector}</TableCell>
                  <TableCell>{employer.district}</TableCell>
                  <TableCell className="font-mono text-xs">{employer.registrationNo ?? "—"}</TableCell>
                  <TableCell className="max-w-[220px] truncate" title={employer.hiringNeeds ?? undefined}>
                    {employer.hiringNeeds ?? "—"}
                  </TableCell>
                  <TableCell>{employer.employeeCount ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(employer.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
                        disabled={submitting}
                        onClick={() => setAction({ employer, decision: "VERIFIED" })}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                        disabled={submitting}
                        onClick={() => setAction({ employer, decision: "REJECTED" })}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={action !== null} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.decision === "VERIFIED" ? "Approve recruiter?" : "Reject recruiter?"}
            </DialogTitle>
            <DialogDescription>
              {action?.decision === "VERIFIED"
                ? `${action?.employer.companyName} will be verified and can post jobs immediately.`
                : `${action?.employer.companyName} will be marked rejected.`}{" "}
              The decision is recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={action?.decision === "VERIFIED" ? "default" : "destructive"}
              disabled={submitting}
              onClick={() => void recordDecision()}
            >
              {submitting ? "Saving…" : action?.decision === "VERIFIED" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
