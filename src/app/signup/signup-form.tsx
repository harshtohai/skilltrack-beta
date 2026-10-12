"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { SignupIdentityFields } from "./signup-identity-fields";
import { SignupProfileFields } from "./signup-profile-fields";
import { signupSchema, type SignupValues } from "./signup-schema";

/**
 * Trainee signup form (§9.3 / D-06): collects exactly what the API stores —
 * name, email, phone, district, gender, consent. Trainees have no password
 * (magic-link auth). CL-21: validate on first blur, then on change, full
 * check on submit. Success flips the page to the interstitial via onSuccess;
 * the redirect to /auth/trainee/sent happens here after 2s.
 */
export function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<SignupValues>({
    // CL-21: validate on first blur, then on change, full check on submit.
    mode: "onTouched",
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      district: "",
      gender: "PREFER_NOT_TO_SAY",
      genderSelfDescribed: "",
      consent: false as unknown as true,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/trainees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phoneE164: `+91${data.phone.replace(/\D/g, "")}`,
          district: data.district,
          gender: data.gender,
          genderSelfDescribed: data.genderSelfDescribed ?? null,
          language: "EN",
          consent: true,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as {
          error?: { code?: string; message?: string };
        };
        const code = json.error?.code;
        const message = json.error?.message ?? "Registration failed";
        // Duplicates go inline on their field (page stays); other errors hit
        // the Alert above the form.
        if (code === "EMAIL_EXISTS" || code === "PHONE_EXISTS") {
          form.setError(code === "EMAIL_EXISTS" ? "email" : "phone", {
            type: "duplicate",
            message,
          });
          setLoading(false);
          return;
        }
        throw new Error(message);
      }

      onSuccess();
      setTimeout(
        () => router.push(`/auth/trainee/sent?email=${encodeURIComponent(data.email)}`),
        2000,
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  });

  return (
    <>
      {submitError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <SignupIdentityFields form={form} loading={loading} />
          <SignupProfileFields form={form} loading={loading} />

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
    </>
  );
}
