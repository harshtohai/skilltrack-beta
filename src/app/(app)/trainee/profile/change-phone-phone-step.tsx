"use client";

import { Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

/**
 * Step 1 of the "Change phone" dialog (T6): collect the new number —
 * paste-friendly per Bug Bag #7 (strip the +91 country code off a paste
 * instead of truncating it into a wrong-looking number).
 */
export function ChangePhonePhoneStep({
  phone,
  onPhoneChange,
  onSubmit,
  error,
  onClearError,
  submitting,
}: {
  phone: string;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  error: string;
  onClearError: () => void;
  submitting: boolean;
}) {
  const digits = phone.replace(/\D/g, "");
  const phoneValid = /^\d{10}$/.test(digits);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="change-phone-new" className="text-body-sm font-medium">
          New mobile number <span className="text-danger-text">*</span>
        </label>
        <Input
          id="change-phone-new"
          type="tel"
          inputMode="numeric"
          placeholder="9876543210"
          autoComplete="tel-national"
          aria-invalid={error ? true : undefined}
          aria-required="true"
          required
          disabled={submitting}
          value={phone}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            onPhoneChange(raw.length === 12 && raw.startsWith("91") ? raw.slice(2) : e.target.value);
            if (error) onClearError();
          }}
        />
        {error ? (
          <p role="alert" className="text-caption text-danger-text">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={submitting || !phoneValid}>
        {submitting && <Loader2 className="size-4 animate-spin" />} Send code
      </Button>
    </form>
  );
}
