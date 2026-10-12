"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { OtpSlots } from "~/components/auth/otp-slots";
import { changeEmailSchema, type ChangeEmailValues } from "./change-email-schema";
import { ChangeEmailEmailStep } from "./change-email-email-step";

/**
 * Two-step verified email change (T5): step 1 collects the new email and
 * triggers the OTP send; step 2 is the 6-slot OTP entry with auto-submit
 * (§4.2) and a 30 s resend cooldown seeded locally and re-seeded from a
 * server 429's retryAfter. Step-1 fields live in change-email-email-step.tsx
 * (shared react-hook-form instance, same split as signup). Server errors land
 * inline — on the field in step 1, as the OTP message in step 2; success
 * toasts, closes and lets the page refetch the profile via onCompleted.
 */
interface ApiErrorBody {
  error?: { code?: string; message?: string; retryAfter?: number };
}

export function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string | null;
  onCompleted: () => void;
}) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<ChangeEmailValues>({
    mode: "onTouched",
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "" },
  });

  // 30 s resend cooldown, ticked locally; a server 429 re-seeds it.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Fresh form every time the dialog opens; the parent owns closing.
  function handleOpenChange(next: boolean) {
    if (next) {
      setStep("email");
      setPendingEmail("");
      setOtp("");
      setOtpError("");
      setCooldown(0);
      setSubmitting(false);
      form.reset({ newEmail: "" });
    }
    onOpenChange(next);
  }

  /** Step-1 request (and step-2 resend): POSTs the new email, mints the OTP. */
  async function requestCode(email: string, source: "submit" | "resend") {
    if (submitting) return;
    const isResend = source === "resend";
    const showError = (message: string) =>
      isResend ? setOtpError(message) : form.setError("newEmail", { message });

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/trainee/me/email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: email }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiErrorBody;

      if (res.status === 429) {
        setCooldown(data.error?.retryAfter ?? 30);
        showError(data.error?.message ?? "Too many requests. Try again shortly.");
        return;
      }
      if (!res.ok) {
        showError(data.error?.message ?? "Couldn't send the code. Try again in a moment.");
        return;
      }

      setPendingEmail(email);
      setStep("otp");
      setOtp("");
      setOtpError("");
      setCooldown(30);
      if (isResend) toast.success("New code sent");
    } catch {
      showError("Couldn't send the code — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /** Step-2 verification: swaps the email server-side, then closes + refreshes. */
  async function verifyOtp(code: string) {
    if (submitting || code.length !== 6) return;
    setSubmitting(true);
    setOtpError("");
    try {
      const res = await fetch("/api/v1/trainee/me/email-change/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiErrorBody;
      if (!res.ok) {
        setOtpError(data.error?.message ?? "That code is invalid or has expired");
        return;
      }
      toast.success("Email updated");
      handleOpenChange(false);
      onCompleted();
    } catch {
      setOtpError("Verification failed — try again in a moment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            {step === "email"
              ? "We'll send a 6-digit code to your new email to verify it."
              : `Enter the code sent to ${pendingEmail}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <ChangeEmailEmailStep
            form={form}
            currentEmail={currentEmail}
            submitting={submitting}
            onSubmit={(email) => void requestCode(email, "submit")}
          />
        ) : (
          <div className="grid gap-4">
            <OtpSlots
              value={otp}
              onValueChange={(next) => {
                setOtp(next);
                if (otpError) setOtpError("");
                // Auto-submit on complete (§4.2 OTP input).
                if (next.length === 6) void verifyOtp(next);
              }}
              invalid={Boolean(otpError)}
              disabled={submitting}
            />
            {otpError ? (
              <p role="alert" className="text-caption text-danger-text">
                {otpError}
              </p>
            ) : null}
            <Button onClick={() => void verifyOtp(otp)} disabled={submitting || otp.length !== 6}>
              {submitting && <Loader2 className="size-4 animate-spin" />} Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void requestCode(pendingEmail, "resend")}
              disabled={submitting || cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
