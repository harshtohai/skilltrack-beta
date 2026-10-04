"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserRoundPlus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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

/**
 * Add-trainee form (INST-02) per design §4.2/§4.3/§9.6 — two titled sections
 * (5 fields per §6.2), RHF+zod. Posts to /api/v1/trainees WITH a cohortId —
 * the API's institute branch creates the trainee + ACTIVE enrolment and sends
 * the enrollment email (programme info + OTP + link). Duplicates go inline on
 * their field exactly like the signup page; success returns to the scoped
 * trainees list, where the new trainee appears as Active.
 */

const addTraineeSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  programmeId: z.string().min(1, "Please select a programme"),
  cohortId: z.string().min(1, "Please select a cohort"),
});

type AddTraineeValues = z.infer<typeof addTraineeSchema>;

type ProgrammeOption = { id: string; name: string };
type CohortOption = { id: string; name: string; programmeId: string };

export function AddTraineeForm({
  programmes,
  cohorts,
}: {
  programmes: ProgrammeOption[];
  cohorts: CohortOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [added, setAdded] = useState<{
    name: string;
    cohort: string;
    email: string | null;
  } | null>(null);

  const form = useForm<AddTraineeValues>({
    // CL-21: validate on first blur, then on change, full check on submit.
    mode: "onTouched",
    resolver: zodResolver(addTraineeSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      programmeId: "",
      cohortId: "",
    },
  });

  // Cohort options follow the chosen programme (§4.2 dependent Selects).
  const watchProgrammeId = form.watch("programmeId");
  const programmeCohorts = cohorts.filter((c) => c.programmeId === watchProgrammeId);

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/trainees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          // Email optional (INST-02): absent → the trainee gets no portal
          // access until an email exists, so the enrollment email is skipped.
          ...(values.email ? { email: values.email } : {}),
          phoneE164: `+91${values.phone}`,
          cohortId: values.cohortId,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as {
          error?: { code?: string; message?: string };
        };
        const code = json.error?.code;
        const message = json.error?.message ?? "Couldn't add trainee";
        // Duplicates go inline on their field (page stays); other errors hit
        // the Alert above the form.
        if (code === "EMAIL_EXISTS" || code === "PHONE_EXISTS") {
          form.setError(code === "EMAIL_EXISTS" ? "email" : "phone", {
            type: "duplicate",
            message,
          });
          setSubmitting(false);
          return;
        }
        throw new Error(message);
      }

      const trainee = (await res.json()) as { fullName?: string };
      setAdded({
        name: trainee.fullName ?? "Trainee",
        cohort: cohorts.find((c) => c.id === values.cohortId)?.name ?? "",
        email: values.email || null,
      });
      // Let the success state register, then return to the scoped list where
      // the new trainee heads it as Active.
      setTimeout(() => router.push("/trainees"), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't add trainee. Please try again.");
      setSubmitting(false);
    }
  });

  if (added) {
    return (
      <Alert variant="success">
        <AlertTitle>Trainee added</AlertTitle>
        <AlertDescription>
          {added.name} was enrolled in {added.cohort}.{" "}
          {added.email
            ? "The enrollment email with their sign-in link is on its way."
            : "No email on file — they get portal access once an email is added."}{" "}
          Returning to trainees…
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="max-w-2xl space-y-6">
          {submitError ? (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {/* Section: Trainee details */}
          <Card className="p-5">
            <CardHeader className="p-0">
              <CardTitle>Trainee details</CardTitle>
              <CardDescription>Who the trainee is and how they sign in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0 pt-4">
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
                        placeholder="e.g. Priya Sharma"
                        maxLength={100}
                        required
                        disabled={submitting}
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
                        required
                        disabled={submitting}
                        aria-required="true"
                        {...field}
                        // No maxLength: silently truncating a +91-prefixed paste
                        // produced a valid-looking but wrong number. Strip the
                        // country code instead and let the zod regex flag the rest.
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          field.onChange(
                            digits.length === 12 && digits.startsWith("91")
                              ? digits.slice(2)
                              : e.target.value,
                          );
                        }}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="trainee@email.com"
                        autoComplete="email"
                        disabled={submitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional — the enrollment email with their sign-in link
                      goes here.
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
            </CardContent>
          </Card>

          {/* Section: Enrolment */}
          <Card className="p-5">
            <CardHeader className="p-0">
              <CardTitle>Enrolment</CardTitle>
              <CardDescription>The programme and cohort the trainee joins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0 pt-4">
              <FormField
                control={form.control}
                name="programmeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Programme <span className="text-danger-text">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        // A programme switch invalidates the chosen cohort.
                        form.setValue("cohortId", "");
                      }}
                      value={field.value}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select programme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programmes.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
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
                name="cohortId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cohort <span className="text-danger-text">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={submitting || !watchProgrammeId}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select cohort" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programmeCohorts.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No cohorts for this programme
                          </SelectItem>
                        ) : (
                          programmeCohorts.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sticky footer per §9.6: [Cancel] left, PRIMARY right */}
        <div className="sticky bottom-0 -mx-4 mt-6 border-t bg-background/80 p-4 backdrop-blur md:-mx-6 md:px-6">
          <div className="mx-auto flex max-w-2xl justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/trainees">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="animate-spin" /> : <UserRoundPlus />}
              {submitting ? "Adding trainee…" : "Add trainee"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
