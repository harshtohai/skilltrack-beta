"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/patterns/skeleton";
import { ErrorState } from "~/components/patterns/error-state";
import { EmptyState } from "~/components/patterns/empty-state";
import { StatusBadge } from "~/components/patterns/status-badge";
import { date } from "~/lib/format";
import { IssueCertificateDialog, RejectCertificateDialog } from "./trainee-certificate-dialogs";

export interface CertificateRow {
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
 * reason (dialogs in trainee-certificate-dialogs.tsx). Decisions are
 * append-only; the trainee sees the result immediately on their profile.
 */
export function TraineeCertificates({ publicId, canManage }: { publicId: string; canManage: boolean }) {
  const [certs, setCerts] = useState<CertificateRow[] | null>(null);
  const [error, setError] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<CertificateRow | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/certificates`);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { certificates: CertificateRow[] };
      setCerts(body.certificates);
    } catch {
      setError(true);
    }
  }, [publicId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleVerify(cert: CertificateRow) {
    setVerifyingId(cert.id);
    try {
      const res = await fetch(`/api/v1/trainees/${publicId}/certificates/${cert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "VERIFIED" }),
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(body.error?.message ?? "Could not record the review.");
        return;
      }
      toast.success("Certificate verified.");
      await load();
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <Card className="p-5 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle className="text-title">Certificates</CardTitle>
        {canManage ? (
          <Button size="sm" variant="outline" onClick={() => setIssueOpen(true)}>
            Issue certificate
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {certs === null ? (
          <div className="space-y-2" aria-busy>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <ErrorState
            title="Couldn't load certificates"
            description="Check your connection and retry."
            onRetry={() => void load()}
          />
        ) : certs.length === 0 ? (
          <EmptyState title="No certificates yet" description="Issued and trainee-uploaded certificates appear here." />
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
                    {cert.issuer} · {date(cert.issueDate)}
                    {cert.expiryDate ? ` · expires ${date(cert.expiryDate)}` : ""}
                  </p>
                  {cert.status === "REJECTED" && cert.rejectionReason ? (
                    <p className="text-caption text-destructive">Reason: {cert.rejectionReason}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={cert.status} />
                  {cert.hasFile ? (
                    <a
                      href={`/api/v1/trainees/${publicId}/certificates/${cert.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm text-primary-strong hover:underline"
                    >
                      View proof
                    </a>
                  ) : null}
                  {canManage && cert.status === "PENDING" ? (
                    <>
                      <Button size="sm" variant="outline" disabled={verifyingId === cert.id} onClick={() => void handleVerify(cert)}>
                        {verifyingId === cert.id && <Loader2 className="size-4 animate-spin" />} Verify
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectTarget(cert)}>
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

      <IssueCertificateDialog
        publicId={publicId}
        open={issueOpen}
        onOpenChange={setIssueOpen}
        onIssued={load}
      />
      <RejectCertificateDialog
        publicId={publicId}
        target={rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        onRejected={load}
      />
    </Card>
  );
}
