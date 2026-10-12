"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "~/components/ui/dialog";
import { CERT_ALLOWED_MIME, CERT_MAX_BYTES } from "~/server/certificates";

/**
 * T3 (spec #102 / ADR-002): issue + review dialogs for the institute/admin
 * certificate surface. ISSUED is born VERIFIED; rejecting a PENDING
 * self-reported certificate requires a reason (CL-18). Both dialogs own their
 * busy state and refresh the list through the passed callbacks.
 */

export function IssueCertificateDialog({
  publicId,
  open,
  onOpenChange,
  onIssued,
}: {
  publicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssued: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(form: HTMLFormElement) {
    const data = new FormData(form);
    const fileInput = form.elements.namedItem("file");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;
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
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/certificates`, { method: "POST", body: data });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(body.error?.message ?? "Could not issue the certificate.");
        return;
      }
      toast.success("Certificate issued and verified.");
      form.reset();
      onOpenChange(false);
      await onIssued();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue certificate</DialogTitle>
          <DialogDescription>Issued certificates are recorded as verified. A file is optional (PDF/JPG/PNG, ≤ 1 MB).</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e.currentTarget);
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
            <Input id="cert-file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />} Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RejectCertificateDialog({
  publicId,
  target,
  onOpenChange,
  onRejected,
}: {
  publicId: string;
  target: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
  onRejected: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(form: HTMLFormElement) {
    if (!target) return;
    const rawReason = new FormData(form).get("reason");
    const reason = typeof rawReason === "string" ? rawReason : "";
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/certificates/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "REJECTED", rejectionReason: reason }),
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(body.error?.message ?? "Could not record the review.");
        return;
      }
      toast.success("Certificate rejected.");
      form.reset();
      onOpenChange(false);
      await onRejected();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject certificate</DialogTitle>
          <DialogDescription>
            {target ? `Reject “${target.name}” — the trainee will see the reason and can re-upload.` : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e.currentTarget);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="reject-reason">Reason (required)</Label>
            <Textarea id="reject-reason" name="reason" required maxLength={500} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />} Reject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
