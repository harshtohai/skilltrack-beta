"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "~/components/ui/dialog";
import { StatusBadge } from "~/components/patterns/status-badge";
import { CERT_ALLOWED_MIME, CERT_MAX_BYTES } from "~/server/certificates";

interface CertificateRow {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  source: "SELF_REPORTED" | "ISSUED";
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
  fileUrl: string | null;
  hasFile: boolean;
}

/**
 * T3 (spec #102 / ADR-002): certificates on the trainee detail page.
 * Institute (own center's trainees) and admin can issue ad-hoc certificates
 * (born VERIFIED) and review self-reported ones — verify, or reject with a
 * reason. Decisions are append-only; the trainee sees the result immediately
 * on their profile.
 */
export function TraineeCertificates({ publicId, canManage }: { publicId: string; canManage: boolean }) {
  const [certs, setCerts] = useState<CertificateRow[] | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<CertificateRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/trainees/${publicId}/certificates`);
    if (res.ok) {
      const body = (await res.json()) as { certificates: CertificateRow[] };
      setCerts(body.certificates);
    } else {

      setCerts([]);
    }
  }, [publicId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleIssue(form: HTMLFormElement) {
    const data = new FormData(form);
    const file = fileRef.current?.files?.[0];
    if (file) {
      if (!CERT_ALLOWED_MIME.includes(file.type as never)) {
        toast.error("Only PDF, JPG or PNG files are allowed.");
        return;
      }
      if (file.size > CERT_MAX_BYTES) {
        toast.error("The file is larger than 1 MB.");
        return;
      }
      data.set("file", file);
    }
    setBusy("issue");
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/certificates`, { method: "POST", body: data });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(body.error?.message ?? "Could not issue the certificate.");
        return;
      }
      toast.success("Certificate issued and verified.");
      setIssueOpen(false);
      form.reset();
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleReview(cert: CertificateRow, decision: "VERIFIED" | "REJECTED", reason?: string) {
    setBusy(cert.id);
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/certificates/${cert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, rejectionReason: reason }),
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(body.error?.message ?? "Could not record the review.");
        return;
      }
      toast.success(decision === "VERIFIED" ? "Certificate verified." : "Certificate rejected.");
      setRejectTarget(null);
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle className="text-h3">Certificates</CardTitle>
        {canManage ? (
          <Button size="sm" variant="outline" onClick={() => setIssueOpen(true)}>
            Issue certificate
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {certs === null ? (
          <p className="text-body-sm text-muted-foreground">Loading…</p>
        ) : certs.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No certificates yet.</p>
        ) : (
          <ul className="divide-y">
            {certs.map((cert) => (
              <li key={cert.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-body font-medium">
                    {cert.name}
                    <span className="ml-2 text-caption text-muted-foreground">
                      {cert.source === "ISSUED" ? "Institute-issued" : "Uploaded by trainee"}
                    </span>
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {cert.issuer} · {new Date(cert.issueDate).toLocaleDateString()}
                    {cert.expiryDate ? ` · expires ${new Date(cert.expiryDate).toLocaleDateString()}` : ""}
                  </p>
                  {cert.status === "REJECTED" && cert.rejectionReason ? (
                    <p className="text-caption text-destructive">Reason: {cert.rejectionReason}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={cert.status} />
                  {canManage && cert.status === "PENDING" ? (
                    <>
                      <Button size="sm" variant="outline" disabled={busy === cert.id} onClick={() => void handleReview(cert, "VERIFIED")}>
                        Verify
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" disabled={busy === cert.id} onClick={() => setRejectTarget(cert)}>
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {/* Issue dialog (ADR-002: ISSUED is born VERIFIED) */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue certificate</DialogTitle>
            <DialogDescription>Issued certificates are recorded as verified. A file is optional (PDF/JPG/PNG, ≤ 1 MB).</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void handleIssue(e.currentTarget);
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="cert-name">Certificate name</Label>
              <Input id="cert-name" name="name" required maxLength={200} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cert-issuer">Issuer</Label>
              <Input id="cert-issuer" name="issuer" required maxLength={200} placeholder="e.g. MSSDS" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cert-issued">Issue date</Label>
                <Input id="cert-issued" name="issueDate" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cert-expiry">Expiry (optional)</Label>
                <Input id="cert-expiry" name="expiryDate" type="date" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cert-file">File (optional)</Label>
              <Input id="cert-file" ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIssueOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy === "issue"}>{busy === "issue" ? "Issuing…" : "Issue"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject dialog (CL-18: governance decisions are confirmed with a reason) */}
      <Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject certificate</DialogTitle>
            <DialogDescription>
              {rejectTarget ? `Reject “${rejectTarget.name}” — the trainee will see the reason and can re-upload.` : ""}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const rawReason = new FormData(e.currentTarget).get("reason");
              const reason = typeof rawReason === "string" ? rawReason : "";
              if (rejectTarget) void handleReview(rejectTarget, "REJECTED", reason);

            }}
          >
            <div className="space-y-1">
              <Label htmlFor="reject-reason">Reason (required)</Label>
              <Textarea id="reject-reason" name="reason" required maxLength={500} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={busy !== null}>Reject</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
