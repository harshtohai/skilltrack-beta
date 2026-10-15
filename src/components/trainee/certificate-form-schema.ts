import { z } from "zod";

/**
 * Certificate form contract (T2): one zod schema shared by the upload and
 * edit modes of CertificateFormDialog (the file itself is validated outside
 * RHF against the same server rules — validateCertificateFile). Dates are
 * native date-input strings "YYYY-MM-DD"; multipart/JSON bodies are built
 * here so both modes stay symmetric with the API.
 */

export const CERTIFICATE_FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const certificateFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be 120 characters or fewer"),
    issuer: z
      .string()
      .min(2, "Issuer must be at least 2 characters")
      .max(120, "Issuer must be 120 characters or fewer"),
    issueDate: z.string().min(1, "Issue date is required").regex(DATE_RE, "Enter a valid date"),
    expiryDate: z.string().regex(DATE_RE, "Enter a valid date").or(z.literal("")),
  })
  .refine((v) => !v.expiryDate || v.expiryDate >= v.issueDate, {
    message: "Expiry must be on or after the issue date",
    path: ["expiryDate"],
  });

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

/** ISO datetime → "YYYY-MM-DD" for the native date input. */
export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

/** Multipart body for POST /api/v1/trainee/certificates. */
export function buildUploadBody(values: CertificateFormValues, file: File): FormData {
  const body = new FormData();
  body.append("file", file);
  body.append("name", values.name);
  body.append("issuer", values.issuer);
  body.append("issueDate", values.issueDate);
  if (values.expiryDate) body.append("expiryDate", values.expiryDate);
  return body;
}
