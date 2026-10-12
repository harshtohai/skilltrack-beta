"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { AuthBrandPanel } from "~/components/auth/auth-brand-panel";
import { AuthLogo } from "~/components/auth/auth-logo";
import { AuthSuccessCard } from "~/components/auth/auth-success-card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import type { EmployerRegisterResponse } from "~/lib/job-board-contracts";
import { EmployerRegisterForm } from "./employer-register-form";

/**
 * Employer registration per design §9.3 — Shell S5 (split). Success shows
 * the verification-pending interstitial linking to the employer login.
 */
export default function EmployerRegisterPage() {
  const [registered, setRegistered] = useState<EmployerRegisterResponse["employer"] | null>(null);

  if (registered) {
    return (
      <AuthSuccessCard title="Registration received">
        <p className="mt-1 text-body-sm text-muted-foreground">
          {registered.companyName} is registered with{" "}
          <span className="font-mono">{registered.contactEmail}</span>.
        </p>
        <Alert className="mt-4 text-left">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Verification pending — you can log in now, and will be able to
            post jobs once an admin verifies your account.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4 w-full" size="lg">
          <Link href="/employer/login">Go to Employer Login</Link>
        </Button>
      </AuthSuccessCard>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: form column (§9.3) */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <AuthLogo />
            <div className="mt-6 space-y-1">
              <h2 className="text-h1 font-medium tracking-tight">
                Register to hire
              </h2>
              <p className="text-body-sm text-muted-foreground">
                Job posting unlocks once an admin verifies your account.
              </p>
            </div>
          </div>

          <EmployerRegisterForm onRegistered={setRegistered} />

          <p className="mt-6 text-center text-caption text-muted-foreground">
            Already registered?{" "}
            <Link href="/employer/login" className="text-primary-strong hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel with dot-matrix art + testimonial (§9.3) */}
      <AuthBrandPanel
        quote="Verification used to take weeks of phone calls — now it is one link, one click, done."
        attribution="HR Lead · Manufacturing employer · Nashik"
      />
    </div>
  );
}
