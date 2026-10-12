"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { OtpSlots } from "~/components/auth/otp-slots";
import type { TraineeProfile } from "./profile-types";

/**
 * OTP recovery form (§9.10 email verification): the 6-digit code from the
 * enrollment email re-verifies a trainee whose magic link is missing,
 * invalid, expired or already used. Owns the email/OTP field state; hands
 * the verified profile to the page via onVerified (which also clears the
 * page-level link-verify error).
 */
export function VerifyCodeForm({
  error,
  onVerified,
}: {
  error: string;
  onVerified: (trainee: TraineeProfile) => void;
}) {
  // OTP recovery form state (§9.10 email verification).
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill the recovery email from ?email= (sent-page hand-off) once.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("email");
    if (fromUrl) setEmail((prev) => prev || fromUrl);
  }, []);

  async function submitOtp(code: string) {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError("Enter your email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setEmailError("Enter a valid email");
      return;
    }
    if (code.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    setEmailError("");
    setOtpError("");
    try {
      const res = await fetch(`/api/v1/auth/trainee/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: code }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        setOtpError(data.error?.message ?? "That code is invalid or has expired");
        return;
      }
      const data = (await res.json()) as { trainee: TraineeProfile };
      onVerified(data.trainee);
    } catch {
      setOtpError("Verification failed — try again in a moment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardContent className="py-8">
          <div className="mb-6 space-y-1 text-center">
            <span className="mx-auto mb-3 grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong [&_svg]:size-5">
              <MailCheck aria-hidden />
            </span>
            <h1 className="text-h2 font-semibold">Enter your verification code</h1>
            <p className="text-caption text-muted-foreground">
              Enter the 6-digit code from your enrollment email to continue.
            </p>
            {error ? (
              <p role="alert" className="text-caption text-danger-text">
                {error}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitOtp(otp);
            }}
            className="grid gap-4"
          >
            <div className="grid gap-1.5">
              <label htmlFor="otp-email" className="text-body-sm font-medium">
                Email <span className="text-danger-text">*</span>
              </label>
              <Input
                id="otp-email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                className="h-11"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                aria-invalid={emailError ? true : undefined}
                aria-required="true"
                required
                disabled={submitting}
              />
              {emailError ? (
                <p role="alert" className="text-caption text-danger-text">
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <label className="text-body-sm font-medium">
                Verification code <span className="text-danger-text">*</span>
              </label>
              <OtpSlots
                value={otp}
                onValueChange={(next) => {
                  setOtp(next);
                  if (otpError) setOtpError("");
                  // Auto-submit on complete (§4.2 OTP input).
                  if (next.length === 6) void submitOtp(next);
                }}
                invalid={Boolean(otpError)}
                disabled={submitting}
              />
              {otpError ? (
                <p role="alert" className="text-caption text-danger-text">
                  {otpError}
                </p>
              ) : null}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="text-body-sm text-muted-foreground underline hover:text-foreground"
            >
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
