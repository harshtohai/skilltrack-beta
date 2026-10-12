"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { ChangeEmailValues } from "./change-email-schema";

/**
 * Step 1 of the change-email dialog (T5): the new-email field. Owns no state
 * — the dialog passes the shared react-hook-form instance (same split as the
 * signup form) plus the submit callback that triggers the OTP send.
 */
export function ChangeEmailEmailStep({
  form,
  currentEmail,
  submitting,
  onSubmit,
}: {
  form: UseFormReturn<ChangeEmailValues>;
  currentEmail: string | null;
  submitting: boolean;
  onSubmit: (email: string) => void;
}) {
  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit(values.newEmail))} className="grid gap-4">
      <FormField
        control={form.control}
        name="newEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>New email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                disabled={submitting}
                {...field}
              />
            </FormControl>
            {currentEmail ? <FormDescription>Current: {currentEmail}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send code"}
      </Button>
    </form>
  );
}
