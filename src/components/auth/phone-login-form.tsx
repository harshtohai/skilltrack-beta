"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { OtpSlots } from "~/components/auth/otp-slots";
import type { TraineeProfile } from "~/app/auth/trainee/[[...token]]/profile-types";

/**
 * WhatsApp OTP login (T7, spec #102) — the trainee card's "use phone
 * instead" path, an inline two-step in the login card: phone → 6-digit code.
 * Mirrors the email magic-link flow's client contracts: generic send success
 * (the server never reveals whether the number is registered), the
 * needsVerification banner for unverified enrollments, friendly destructive
 * banners for errors, and the verify response carries the full trainee
 * profile (the API sets the session cookie; onVerified hands it upward).
 */
export function PhoneLoginForm({
  onVerified,
}: {
  onVerified: (trainee: TraineeProfile) => void;
}) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** Matches the server-side 30s token cooldown in the phone-otp route. */
  const RESEND_COOLDOWN_S = 30;
  const [cooldown, setCooldown] = useState(0);
  const cooldownActive = cooldown > 0;

  // Live countdown; interval only runs while cooling down, cleanup on unmount.
  useEffect(() => {
    if (!cooldownActive) return;
    const timer = setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownActive]);

  /** Shared by the first send and the resend (same endpoint, cooldown-aware). */
  async function postPhoneOtp(): Promise<{ needsVerification?: boolean }> {
    const res = await fetch("/api/v1/auth/trainee/phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim() }),
    });
    const json = (await res.json()) as {
      needsVerification?: boolean;
      error?: { message?: string; retryAfter?: number };
    };
    if (res.status === 429 && typeof json.error?.retryAfter === "number") {
      setCooldown(json.error.retryAfter);
    }
    if (!res.ok) {
      throw new Error(json.error?.message ?? "Failed to send the code");
    }
    return json;
  }

  async function sendCode() {
    // Paste-friendly: no maxLength — thin client check only, the server
    // normalizes and strips 91/+91 prefixes authoritatively.
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setError("");
    setNeedsVerification(false);
    setSubmitting(true);
    try {
      const json = await postPhoneOtp();
      if (json.needsVerification) {
        setNeedsVerification(true);
        return;
      }
      setOtp("");
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setCooldown(RESEND_COOLDOWN_S);
    setSubmitting(true);
    try {
      await postPhoneOtp();
      toast.success("Code resent", {
        description: "Check WhatsApp — it can take a minute to arrive.",
      });
    } catch (err) {
      toast.error("Could not resend", {
        description: err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(code: string) {
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/trainee/phone-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: code }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        setError(json.error?.message ?? "That code is invalid or has expired");
        return;
      }
      const json = (await res.json()) as { trainee: TraineeProfile };
      onVerified(json.trainee);
    } catch {
      setError("Verification failed — try again in a moment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      {needsVerification ? (
        <Alert>
          <AlertDescription>
            Verify your enrollment first — use the link or code from your
            enrollment email. Contact your institute to resend the enrollment
            email.
          </AlertDescription>
        </Alert>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendCode();
          }}
          className="grid gap-4"
        >
          <div className="grid gap-1.5">
            <label htmlFor="phone-login" className="text-body-sm font-medium">
              Phone number <span className="text-danger-text">*</span>
            </label>
            {/* Paste-friendly (Bug Bag #7): no maxLength truncation; the
                server strips 0/91/+91 prefixes via E.164 normalization. */}
            <Input
              id="phone-login"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className="h-11"
              required
              disabled={submitting}
              aria-required="true"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError("");
              }}
            />
            <p className="text-caption text-muted-foreground">
              We’ll WhatsApp you a 6-digit code — no password needed.
            </p>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send code"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verifyOtp(otp);
          }}
          className="grid gap-4"
        >
          <div className="grid gap-1.5">
            <p className="text-body-sm font-medium">
              Enter the code sent to{" "}
              <span className="font-mono">{phone.trim()}</span>
            </p>
            <OtpSlots
              value={otp}
              onValueChange={(next) => {
                setOtp(next);
                if (error) setError("");
                // Auto-submit on complete (§4.2 OTP input).
                if (next.length === 6) void verifyOtp(next);
              }}
              invalid={Boolean(error)}
              disabled={submitting}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => void resend()}
            disabled={submitting || cooldownActive}
          >
            <RefreshCw className={submitting ? "animate-spin" : undefined} aria-hidden />
            {cooldownActive ? `Resend code in ${cooldown}s` : "Resend code"}
          </Button>
          <button
            type="button"
            className="text-caption text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => {
              setStep("phone");
              setError("");
            }}
          >
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}
