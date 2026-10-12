"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { OtpSlots } from "~/components/auth/otp-slots";
import { maskPhoneE164 } from "~/lib/utils";

/**
 * "Change phone" (T6, spec #102) — self-contained dialog so VerifiedInfoCard
 * only renders a trigger (the email side evolves that card in parallel).
 * Step 1 collects the new number (paste friendly per Bug Bag #7), step 2
 * auto-submits the 6-digit WhatsApp OTP (§4.2); the 30s resend cooldown
 * follows the server's retryAfter.
 */

const RESEND_COOLDOWN_S = 30;
const SEND_FAIL_MSG = "Couldn't send the code. Try again in a moment.";

type ApiErrorJson = { error?: { message?: string; retryAfter?: number } };

/** POST JSON; network failures fold into a generic { ok: false }. */
async function postJson(url: string, body: object): Promise<{ ok: boolean; json: ApiErrorJson }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, json: (await res.json().catch(() => ({}))) as ApiErrorJson };
  } catch {
    return { ok: false, json: {} };
  }
}

export function ChangePhoneDialog({
  currentPhoneE164,
  onChanged,
}: {
  currentPhoneE164: string;
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Tick the resend cooldown down once per second while it runs.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const digits = phone.replace(/\D/g, "");
  const phoneValid = /^\d{10}$/.test(digits);

  /** Fresh state every time the dialog opens. */
  function reset() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError("");
    setCooldown(0);
  }

  /** Step-1 request and step-2 resend share one call. Returns success. */
  async function requestOtp() {
    setError("");
    setSubmitting(true);
    const { ok, json } = await postJson("/api/v1/trainee/me/phone-change", { newPhone: digits });
    setSubmitting(false);
    if (ok) {
      setCooldown(RESEND_COOLDOWN_S);
      return true;
    }
    if (typeof json.error?.retryAfter === "number") setCooldown(json.error.retryAfter);
    setError(json.error?.message ?? SEND_FAIL_MSG);
    return false;
  }

  async function submitPhone() {
    if (!phoneValid) return setError("Enter a valid 10-digit Indian mobile number");
    if (`+91${digits}` === currentPhoneE164) {
      return setError("That is already your current number");
    }
    if (await requestOtp()) {
      setStep("otp");
      setOtp("");
    }
  }

  async function verifyCode(code: string) {
    if (code.length !== 6) return setError("Enter the 6-digit code");
    setError("");
    setSubmitting(true);
    const { ok, json } = await postJson("/api/v1/trainee/me/phone-change/verify", { otp: code });
    setSubmitting(false);
    if (ok) {
      toast.success("Phone number updated");
      setOpen(false);
      onChanged?.();
      return;
    }
    setError(json.error?.message ?? "That code is invalid or has expired");
    setOtp("");
  }

  const errorLine = error ? (
    <p role="alert" className="text-caption text-danger-text">
      {error}
    </p>
  ) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-caption">Change</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change phone number</DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "We'll send a 6-digit code to your new number on WhatsApp to verify it."
              : `Enter the code sent to ${maskPhoneE164(`+91${digits}`)}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <form onSubmit={(e) => { e.preventDefault(); void submitPhone(); }} className="grid gap-4">
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
                // No maxLength (Bug Bag #7): strip the +91 country code off a
                // paste instead of truncating it into a wrong-looking number.
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setPhone(raw.length === 12 && raw.startsWith("91") ? raw.slice(2) : e.target.value);
                  if (error) setError("");
                }}
              />
              {errorLine}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting || !phoneValid}>
                {submitting ? "Sending code..." : "Send code"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4">
            <OtpSlots
              value={otp}
              onValueChange={(next) => {
                setOtp(next);
                if (error) setError("");
                // Auto-submit on complete (§4.2 OTP input).
                if (next.length === 6) void verifyCode(next);
              }}
              invalid={Boolean(error)}
              disabled={submitting}
            />
            {errorLine}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void requestOtp()}
                disabled={submitting || cooldown > 0}
              >
                {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
