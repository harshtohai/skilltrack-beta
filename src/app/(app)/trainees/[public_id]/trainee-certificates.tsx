"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/patterns/skeleton";
import { ErrorState } from "~/components/patterns/error-state";
import { EmptyState } from "~/components/patterns/empty-state";
import { date } from "~/lib/format";
import { IssueCertificateDialog } from "./trainee-certificate-dialogs";

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
 * (born VERIFIED). There is no review workflow — self-reported certificates
 * are live immediately; this surface shows provenance and proof files.
 */
export function TraineeCertificates({ publicId, canManage }: { publicId: string; canManage: boolean }) {
  const [certs, setCerts] = useState<CertificateRow[] | null>(null);
  const [error, setError] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);

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
                    <a
                      href={`/api/v1/trainees/${publicId}/certificates/${cert.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm text-primary-strong hover:underline"
                    >
                      View proof
                    </a>
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
    </Card>
  );
}
