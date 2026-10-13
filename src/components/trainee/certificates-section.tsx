"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmptyState } from "~/components/patterns/empty-state";
import { ConfirmDialog } from "~/components/patterns/confirm-dialog";
import { Skeleton } from "~/components/patterns/skeleton";
import { date } from "~/lib/format";
import { CertificateFormDialog } from "~/components/trainee/certificate-form-dialog";

/**
 * Trainee certificates section (T2, provenance-only per ADR-003): self-service
 * list on the profile page — upload via dialog, view file (signed-URL route),
 * edit/delete own self-reported certificates any time; institute-issued ones
 * are the institute's record and stay immutable. Own state and fetches to
 * /api/v1/trainee/certificates; the page's dirty-state/leave-guard form logic
 * is untouched.
 */

export interface TraineeCertificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  source: string;
  hasFile: boolean;
  fileUrl: string | null;
}

const SOURCE_HINTS: Record<string, string> = {
  SELF_REPORTED: "Uploaded by you",
  ISSUED: "Issued by institute",
};

function canModify(cert: TraineeCertificate): boolean {
  return cert.source === "SELF_REPORTED";
}

export function CertificatesSection() {
  const [certificates, setCertificates] = useState<TraineeCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TraineeCertificate | null>(null);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/trainee/certificates");
      if (!res.ok) throw new Error("Failed to load certificates");
      const json = (await res.json()) as { certificates: TraineeCertificate[] };
      setCertificates(json.certificates);
    } catch (err) {
      console.error("Certificate load error:", err);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

  const openUpload = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (cert: TraineeCertificate) => {
    setEditing(cert);
    setDialogOpen(true);
  };

  const handleDelete = async (cert: TraineeCertificate) => {
    try {
      const res = await fetch(`/api/v1/trainee/certificates/${cert.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to delete certificate");
      }
      toast.success("Certificate deleted");
      void loadCertificates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete certificate");
    }
  };

  return (
    <Card id="certificates" className="scroll-mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Certificates</CardTitle>
        <Button size="sm" onClick={openUpload} className="gap-2">
          <Plus />
          Upload certificate
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={<Award />}
            title="No certificates yet"
            description="Upload a certificate you already hold, or one issued by your training centre will appear here."
          />
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="border-b py-4 last:border-b-0">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-body-sm font-medium">{cert.name}</p>
                  <p className="text-caption text-muted-foreground">{cert.issuer}</p>
                  <p className="text-caption text-muted-foreground">
                    {date(cert.issueDate)}
                    {cert.expiryDate ? ` – ${date(cert.expiryDate)}` : ""}
                    {" · "}
                    {SOURCE_HINTS[cert.source] ?? "Uploaded"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {cert.hasFile && (
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`View file for ${cert.name}`}>
                      <a
                        href={`/api/v1/trainee/certificates/${cert.id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink />
                      </a>
                    </Button>
                  )}
                  {canModify(cert) && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(cert)}
                      aria-label={`Edit ${cert.name}`}
                    >
                      <Pencil />
                    </Button>
                  )}
                  {canModify(cert) && (
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${cert.name}`}
                        >
                          <Trash2 />
                        </Button>
                      }
                      title={`Delete "${cert.name}"?`}
                      description="This removes the certificate and its file. This can't be undone."
                      confirmLabel="Delete"
                      onConfirm={() => void handleDelete(cert)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <CertificateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        certificate={editing}
        onSaved={() => void loadCertificates()}
      />
    </Card>
  );
}
