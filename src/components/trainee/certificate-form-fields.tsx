"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CERTIFICATE_FILE_ACCEPT, type CertificateFormValues } from "~/components/trainee/certificate-form-schema";

/**
 * Fields for the certificate upload/edit dialog (T2): the file picker
 * (upload mode only — edit keeps the existing file) plus name, issuer and
 * the native date inputs. The file error renders under the picker in the
 * FormMessage style since the file lives outside RHF.
 */

export function CertificateFormFields({
  control,
  submitting,
  withFile,
  fileError,
  onFileChange,
}: {
  control: Control<CertificateFormValues>;
  submitting: boolean;
  /** Upload mode shows the file picker; edit mode does not. */
  withFile: boolean;
  fileError: string;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <>
      {withFile && (
        <div className="space-y-1.5">
          <Label htmlFor="certificate-file">Certificate file</Label>
          <Input
            id="certificate-file"
            type="file"
            accept={CERTIFICATE_FILE_ACCEPT}
            disabled={submitting}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          {fileError ? (
            <p className="text-caption font-medium text-danger-text">{fileError}</p>
          ) : (
            <p className="text-caption text-muted-foreground">PDF, JPG or PNG · up to 1 MB</p>
          )}
        </div>
      )}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certificate name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Electrician Level 3" {...field} disabled={submitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="issuer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Issuer</FormLabel>
            <FormControl>
              <Input placeholder="e.g. MSSDS / Skill India" {...field} disabled={submitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="issueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={submitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry (optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={submitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
