"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { CertificateFormFields } from "~/components/trainee/certificate-form-fields";
import {
  buildUploadBody,
  certificateFormSchema,
  toDateInput,
  type CertificateFormValues,
} from "~/components/trainee/certificate-form-schema";
import { validateCertificateFile } from "~/server/certificates";
import type { TraineeCertificate } from "~/components/trainee/certificates-section";

/**
 * Certificate upload/edit dialog (T2): one RHF+zod form for both modes —
 * upload (multipart POST with the file) and edit of a PENDING certificate
 * (JSON PATCH, no file swap). The file check mirrors the server rules by
 * reusing validateCertificateFile; errors land as Sonner toasts and onSaved
 * refreshes the section list. Fields render via certificate-form-fields.
 */

export function CertificateFormDialog({
  open,
  onOpenChange,
  certificate,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null → upload mode; set → edit mode (PENDING only, enforced server-side). */
  certificate: TraineeCertificate | null;
  onSaved: () => void;
}) {
  const isEdit = certificate !== null;
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    mode: "onTouched",
    defaultValues: { name: "", issuer: "", issueDate: "", expiryDate: "" },
  });

  // Fresh form every open; prefill when editing.
  useEffect(() => {
    if (!open) return;
    setFile(null);
    setFileError("");
    form.reset({
      name: certificate?.name ?? "",
      issuer: certificate?.issuer ?? "",
      issueDate: certificate ? toDateInput(certificate.issueDate) : "",
      expiryDate: certificate?.expiryDate ? toDateInput(certificate.expiryDate) : "",
    });
  }, [open, certificate, form]);

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    setFileError("");
    if (!selected) return;
    const check = validateCertificateFile(selected.type, selected.size);
    if (!check.ok) setFileError(check.reason);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isEdit && certificate) {
        const res = await fetch(`/api/v1/trainee/certificates/${certificate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            issuer: values.issuer,
            issueDate: values.issueDate,
            expiryDate: values.expiryDate || null,
          }),
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: { message?: string } };
          throw new Error(json.error?.message ?? "Something went wrong");
        }
        toast.success("Certificate updated");
      } else {
        if (!file) {
          setFileError("Choose a certificate file");
          return;
        }
        const check = validateCertificateFile(file.type, file.size);
        if (!check.ok) {
          setFileError(check.reason);
          return;
        }
        const res = await fetch("/api/v1/trainee/certificates", {
          method: "POST",
          body: buildUploadBody(values, file),
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: { message?: string } };
          throw new Error(json.error?.message ?? "Something went wrong");
        }
        toast.success("Certificate uploaded — pending review");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(isEdit ? "Could not update certificate" : "Could not upload certificate", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit certificate" : "Upload certificate"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of your pending certificate."
              : "Add a certificate you already hold — your training centre will review it."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <CertificateFormFields
              control={form.control}
              submitting={submitting}
              withFile={!isEdit}
              fileError={fileError}
              onFileChange={handleFileChange}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || (!isEdit && (!file || !!fileError))} className="gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
