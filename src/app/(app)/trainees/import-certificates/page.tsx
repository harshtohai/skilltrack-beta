"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ErrorState } from "~/components/patterns/error-state";

/**
 * Bulk CSV certificate import (issue #114): one row per certificate —
 * `publicId,name,issuer,issueDate[,expiryDate]`. Rows naming trainees outside
 * the institute's center are row errors; existing certificates are skipped
 * (re-upload safe). Created certificates are ISSUED and immediately visible
 * on the trainee's profile.
 */

interface RowResult {
  row: number;
  publicId: string;
  status: "created" | "skipped" | "error";
  message?: string;
}

interface ImportResponse {
  created?: number;
  skipped?: number;
  results?: RowResult[];
  error?: { message?: string };
}

const TEMPLATE = "publicId,name,issuer,issueDate,expiryDate\nTRN-XXXXXX-XXXX,Certificate Name,MSSDS,2026-10-13,";

function downloadTemplate() {
  const blob = new Blob([TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "certificate-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_STYLES: Record<RowResult["status"], string> = {
  created: "text-success-text",
  skipped: "text-muted-foreground",
  error: "text-destructive",
};

export default function ImportCertificatesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [failed, setFailed] = useState(false);

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/v1/trainees/import-certificates", { method: "POST", body });
      const json = (await res.json()) as ImportResponse;
      if (!res.ok) {
        setFailed(true);
        toast.error(json.error?.message ?? "Import failed.");
        return;
      }
      setResult(json);
      toast.success(`Imported ${json.created ?? 0} certificate(s), skipped ${json.skipped ?? 0}.`);
      setFile(null);
    } catch {
      setFailed(true);
      toast.error("Import failed — check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
        All trainees <span aria-hidden>/</span> Import certificates
      </nav>
      <h1 className="mb-1 text-h1 font-medium tracking-tight">Import certificates</h1>
      <p className="mb-6 max-w-2xl text-body-sm text-muted-foreground">
        Upload a CSV (one row per certificate) to issue certificates in bulk. Each created certificate is
        institute-issued and immediately visible on the trainee profile. Trainees outside your
        center cohorts are reported as row errors — nothing is created for them.
      </p>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-title flex items-center gap-2">
            <FileSpreadsheet className="size-4" aria-hidden /> CSV upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={submitting}
              aria-label="Certificate CSV file"
            />
            <p className="text-caption text-muted-foreground">
              Columns: <code>publicId,name,issuer,issueDate[,expiryDate]</code> · dates{" "}
              <code>YYYY-MM-DD</code> · max 500 rows, 1 MB.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => void handleSubmit()} disabled={!file || submitting} className="gap-2">
              <Upload className="size-4" aria-hidden /> {submitting ? "Importing…" : "Import"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download template
            </Button>
          </div>

          {failed ? (
            <ErrorState
              title="Import failed"
              description="Fix the file and try again."
              onRetry={() => void handleSubmit()}
            />
          ) : null}

          {result && !failed ? (
            <div className="rounded-lg border p-4">
              <p className="text-body-sm font-medium">
                {result.created ?? 0} created · {result.skipped ?? 0} skipped ·{" "}
                {(result.results ?? []).filter((r) => r.status === "error").length} errors
              </p>
              {(result.results ?? []).length > 0 ? (
                <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto text-caption">
                  {result.results?.map((r) => (
                    <li key={`${r.row}-${r.publicId}`} className={STATUS_STYLES[r.status]}>
                      Row {r.row} ({r.publicId || "—"}): {r.status}
                      {r.message ? ` — ${r.message}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
