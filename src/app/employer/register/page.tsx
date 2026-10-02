"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DotSparkline } from "~/components/viz/dot-sparkline";
import type { EmployerRegisterResponse } from "~/lib/job-board-contracts";

/**
 * Employer registration per design §9.3 — Shell S5 (split). The API contract
 * requires 5 fields (company, email, password, sector, district); optional
 * extras group in a bg-muted panel (§4.4 panel pattern).
 */

const employerRegisterSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Name must be at least 2 characters")
    .max(120),
  contactEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Enter a valid email")
    .max(254),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(72),
  sector: z
    .string()
    .min(1, "Sector is required")
    .min(2, "Sector must be at least 2 characters")
    .max(80),
  district: z.string().min(1, "Please select your district"),
  registrationNo: z.string().max(40).optional(),
  hiringNeeds: z.string().max(500).optional(),
  employeeCount: z
    .string()
    .refine((v) => v === "" || /^\d+$/.test(v), "Enter a valid number")
    .optional(),
});

type EmployerRegisterValues = z.infer<typeof employerRegisterSchema>;

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const BRAND_SPARK = Array.from({ length: 48 }, (_, i) =>
  Math.round(6 + 30 * (i / 47) + (i % 5 === 0 ? 8 : 0)),
);

export default function EmployerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registered, setRegistered] = useState<EmployerRegisterResponse["employer"] | null>(null);

  const form = useForm<EmployerRegisterValues>({
    resolver: zodResolver(employerRegisterSchema),
    defaultValues: {
      companyName: "",
      contactEmail: "",
      password: "",
      sector: "",
      district: "",
      registrationNo: "",
      hiringNeeds: "",
      employeeCount: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.companyName.trim(),
          contactEmail: data.contactEmail.trim(),
          password: data.password,
          sector: data.sector.trim(),
          district: data.district,
          ...(data.registrationNo?.trim() ? { registrationNo: data.registrationNo.trim() } : {}),
          ...(data.hiringNeeds?.trim() ? { hiringNeeds: data.hiringNeeds.trim() } : {}),
          ...(data.employeeCount?.trim() ? { employeeCount: data.employeeCount.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to register");
      }
      const json = (await res.json()) as EmployerRegisterResponse;
      setRegistered(json.employer);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  });

  if (registered) {
    return (
      <div className="grid min-h-svh place-items-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-success-soft text-success-text [&_svg]:size-5">
            <CheckCircle aria-hidden />
          </span>
          <h2 className="mt-3 text-h2 font-semibold">Registration received</h2>
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
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: form column (§9.3) */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
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
                Register to hire
              </h2>
              <p className="text-body-sm text-muted-foreground">
                Job posting unlocks once an admin verifies your account.
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
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company name <span className="text-danger-text">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. TechCorp Industries"
                        autoComplete="organization"
                        maxLength={120}
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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Work email <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="hr@company.com"
                          autoComplete="email"
                          maxLength={254}
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Min 8 characters"
                          autoComplete="new-password"
                          maxLength={72}
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sector <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Manufacturing"
                          maxLength={80}
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
                            <SelectValue placeholder="Select district" />
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
              </div>

              {/* Optional extras — bg-muted panel (§4.4) */}
              <div className="grid gap-4 rounded-lg bg-muted p-3">
                <p className="text-caption font-medium text-muted-foreground">
                  Optional details
                </p>
                <FormField
                  control={form.control}
                  name="registrationNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration No. (GSTIN/CIN)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 27AAPTU1234A1Z5"
                          maxLength={40}
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hiringNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiring needs</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Roles you plan to hire for, volumes, timelines…"
                          maxLength={500}
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 50"
                          min={1}
                          max={100000}
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-caption text-muted-foreground">
            Already registered?{" "}
            <Link href="/employer/login" className="text-primary-strong hover:underline">
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
            &ldquo;Verification used to take weeks of phone calls — now it is
            one link, one click, done.&rdquo;
          </blockquote>
          <figcaption className="text-caption text-muted-foreground">
            HR Lead · Manufacturing employer · Nashik
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
