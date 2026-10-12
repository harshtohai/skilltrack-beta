"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthBrandPanel } from "~/components/auth/auth-brand-panel";
import { branding } from "~/lib/branding";
import { AuthLogo } from "~/components/auth/auth-logo";
import { AuthSuccessCard } from "~/components/auth/auth-success-card";
import { SignupForm } from "./signup-form";

/**
 * Signup per design §9.3 — Shell S5 (split): left form column max-w-sm,
 * right bg-muted brand panel with dot-matrix art + one testimonial.
 * Success → /auth/trainee/sent, the check-your-inbox page.
 */
export default function SignupPage() {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <AuthSuccessCard title="Account created">
        <p className="mt-1 text-body-sm text-muted-foreground">
          Redirecting to check your inbox...
        </p>
      </AuthSuccessCard>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: form column (§9.3) — vertical padding trimmed to §3.5's 24px so the form fits 100svh with 5 fields */}
      <div className="flex items-center justify-center p-6 md:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <AuthLogo />
            <div className="mt-6 space-y-1">
              <h2 className="text-h1 font-medium tracking-tight">
                Create your account
              </h2>
              <p className="text-body-sm text-muted-foreground">
                Track your employment outcomes with a consent-based trainee
                record — no password needed.
              </p>
            </div>
          </div>

          <SignupForm onSuccess={() => setSuccess(true)} />

          <p className="mt-6 text-center text-caption text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-strong hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel with dot-matrix art + testimonial (§9.3) */}
      <AuthBrandPanel
        quote="SkillsTrack showed me exactly which skills get placed — I went from a six-month job hunt to an offer in three weeks."
        attribution={branding.signupAttribution}
      />
    </div>
  );
}
