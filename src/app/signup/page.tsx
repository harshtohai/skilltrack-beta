"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DotSparkline } from "~/components/viz/dot-sparkline";

/**
 * Signup per design §9.3 — Shell S5 (split): left form column max-w-sm,
 * right bg-muted brand panel with dot-matrix art + one testimonial.
 * Trainees have no password (magic-link auth) — the form collects exactly
 * what the API stores: name, email, phone, district, gender, consent
 * (5 fields per D-06 — owner override of §9.3's 4-field signup rule).
 * Success → /auth/trainee/sent, the check-your-inbox page.
 */

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit Indian mobile number"),
    district: z.string().min(1, "Please select your district"),
    gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "SELF_DESCRIBED", "PREFER_NOT_TO_SAY"]),
    genderSelfDescribed: z.string().optional(),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the terms and consent to data processing",
      }),
    }),
  })
  .superRefine((data, ctx) => {
    // Self-described text is required when the choice is SELF_DESCRIBED.
    if (data.gender === "SELF_DESCRIBED" && !data.genderSelfDescribed?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["genderSelfDescribed"],
        message: "Please describe your gender",
      });
    }
  });

type SignupValues = z.infer<typeof signupSchema>;

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const BRAND_SPARK = Array.from({ length: 48 }, (_, i) =>
  Math.round(6 + 30 * (i / 47) + (i % 5 === 0 ? 8 : 0)),
);

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

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

  const watchGender = form.watch("gender");

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

      setSuccess(true);
      setTimeout(
        () => router.push(`/auth/trainee/sent?email=${encodeURIComponent(data.email)}`),
        2000,
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  });

  if (success) {
    return (
      <div className="grid min-h-svh place-items-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-success-soft text-success-text [&_svg]:size-5">
            <CheckCircle aria-hidden />
          </span>
          <h2 className="mt-3 text-h2 font-semibold">Account created</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Redirecting to check your inbox...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: form column (§9.3) — vertical padding trimmed to §3.5's 24px so the form fits 100svh with 5 fields */}
      <div className="flex items-center justify-center p-6 md:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
                  <path d="M22 10L12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
                </svg>
              </span>
              <span className="text-title font-semibold text-foreground">
                OutcomeTrack
              </span>
            </Link>
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

          {submitError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full name <span className="text-danger-text">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        disabled={loading}
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-danger-text">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        required
                        disabled={loading}
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      We’ll send a magic link to this email.
                    </FormDescription>
                    <FormMessage />
                    {form.formState.errors.email?.type === "duplicate" ? (
                      <p className="text-caption">
                        <Link href="/login" className="text-primary-strong hover:underline">
                          Sign in instead
                        </Link>
                      </p>
                    ) : null}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Mobile number <span className="text-danger-text">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="9876543210"
                        autoComplete="tel-national"
                        maxLength={10}
                        required
                        disabled={loading}
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error ? null : (
                      <FormDescription>
                        10-digit Indian mobile number (without +91)
                      </FormDescription>
                    )}
                    <FormMessage />
                    {form.formState.errors.phone?.type === "duplicate" ? (
                      <p className="text-caption">
                        <Link href="/login" className="text-primary-strong hover:underline">
                          Sign in instead
                        </Link>
                      </p>
                    ) : null}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      District <span className="text-danger-text">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISTRICTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                        <SelectItem value="SELF_DESCRIBED">Prefer to self-describe</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchGender === "SELF_DESCRIBED" ? (
                <FormField
                  control={form.control}
                  name="genderSelfDescribed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Describe your gender <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your gender identity"
                          maxLength={100}
                          required
                          disabled={loading}
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary-strong hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary-strong hover:underline">
                          Privacy Policy
                        </Link>
                        . I consent to OutcomeTrack processing my personal data
                        for employment outcome tracking as described in the{" "}
                        <Link href="/consent" className="text-primary-strong hover:underline">
                          Consent Policy
                        </Link>
                        .
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-caption text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-strong hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel with dot-matrix art + testimonial (§9.3) */}
      <div className="hidden lg:flex flex-col justify-center gap-10 bg-muted p-10">
        <div className="flex items-center justify-center">
          <DotSparkline
            data={BRAND_SPARK}
            color="var(--chart-1)"
            ariaLabel="Decorative placement trend"
          />
        </div>
        <figure className="mx-auto max-w-sm space-y-3">
          <blockquote className="text-h2 font-semibold tracking-tight text-foreground">
            &ldquo;OutcomeTrack showed me exactly which skills get placed — I
            went from a six-month job hunt to an offer in three weeks.&rdquo;
          </blockquote>
          <figcaption className="text-caption text-muted-foreground">
            Priya Sharma · PMKVY trainee · Pune
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
