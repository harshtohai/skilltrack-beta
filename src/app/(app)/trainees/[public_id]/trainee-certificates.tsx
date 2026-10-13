"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/patterns/skeleton";
import { ErrorState } from "~/components/patterns/error-state";
import { EmptyState } from "~/components/patterns/empty-state";
import { ConfirmDialog } from "~/components/patterns/confirm-dialog";
import { date } from "~/lib/format";
import { IssueCertificateDialog } from "./trainee-certificate-dialogs";
import { CertificatePreviewDialog } from "~/components/patterns/certificate-preview-dialog";

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
 * Certificates on the trainee detail page (T3, provenance-only per ADR-003):
 * institute (own center's trainees) and admin issue ad-hoc certificates
 * (born VERIFIED) and may REMOVE a trainee's self-reported certificate
 * (issue #112 remediation path — audit-logged, trainee emailed). There is no
 * review workflow; this surface shows provenance and proof files.
 */
export function TraineeCertificates({ publicId, canManage }: { publicId: string; canManage: boolean }) {
  const [certs, setCerts] = useState<CertificateRow[] | null>(null);
  const [error, setError] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [preview, setPreview] = useState<{ id: string; name: string } | null>(null);

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

  async function handleRemove(cert: CertificateRow) {
    const res = await fetch(`/api/v1/trainees/${publicId}/certificates/${cert.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(body.error?.message ?? "Could not remove the certificate.");
      return;
    }
    toast.success("Certificate removed — the trainee has been notified.");
    await load();
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
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {cert.hasFile ? (
                    <Button size="sm" variant="ghost" onClick={() => setPreview({ id: cert.id, name: cert.name })}>
                      View proof
                    </Button>
                  ) : null}
                  {canManage && cert.source === "SELF_REPORTED" ? (
                    <ConfirmDialog
                      trigger={
                        <Button size="sm" variant="outline" className="text-destructive">
                          Remove
                        </Button>
                      }
                      title={`Remove "${cert.name}"?`}
                      description="The certificate and its file are deleted and the trainee is emailed. This can't be undone."
                      confirmLabel="Remove"
                      onConfirm={() => void handleRemove(cert)}
                    />
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
      <CertificatePreviewDialog
        open={preview !== null}
        onOpenChange={(open) => !open && setPreview(null)}
        name={preview?.name ?? ""}
        fileSrc={preview ? `/api/v1/trainees/${publicId}/certificates/${preview.id}/file` : ""}
      />
    </Card>
  );
}
