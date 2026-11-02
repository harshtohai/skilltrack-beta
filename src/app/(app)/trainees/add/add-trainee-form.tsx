"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import { EDUCATION_LEVELS, isPlausibleDateOfBirth } from "~/lib/utils";
import { EnrollmentSelect } from "./enrollment-select";

/**
 * Manual add-trainee (INST-02 v2) — two steps so the wider required set
 * stays scannable: Step 1 personal details (the record), Step 2 enrolment
 * (shared EnrollmentSelect — the same picker the SkillID path uses). RHF+zod.
 * Posts to /api/v1/trainees WITH a cohortId — the API's institute branch
 * creates the trainee + ACTIVE enrolment and sends the enrollment email.
 * Duplicates go inline on their field exactly like the signup page; success
 * returns to the scoped trainees list.
 */

const addTraineeSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((v) => isPlausibleDateOfBirth(new Date(v)), "Enter a realistic date of birth"),
    gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "SELF_DESCRIBED", "PREFER_NOT_TO_SAY"]),
    genderSelfDescribed: z.string().optional(),
    language: z.enum(["EN", "HI"]),
    district: z.string().min(1, "District is required"),
    address: z.string().min(1, "Address is required").max(500),
    educationLevel: z.string().min(1, "Please select the highest qualification"),
    programmeId: z.string().min(1, "Please select a programme"),
    cohortId: z.string().min(1, "Please select a cohort"),
  })
  .superRefine((data, ctx) => {
    if (data.gender === "SELF_DESCRIBED" && !data.genderSelfDescribed?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["genderSelfDescribed"], message: "Please describe your gender" });
    }
  });

type AddTraineeValues = z.infer<typeof addTraineeSchema>;

export type ProgrammeOption = { id: string; name: string };
export type CohortOption = { id: string; name: string; programmeId: string };

const PERSONAL_FIELDS: (keyof AddTraineeValues)[] = [
  "fullName",
  "phone",
  "email",
  "dateOfBirth",
  "gender",
  "genderSelfDescribed",
  "language",
  "district",
  "address",
  "educationLevel",
];

export function AddTraineeForm({
  programmes,
  cohorts,
}: {
  programmes: ProgrammeOption[];
  cohorts: CohortOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<"personal" | "enrolment">("personal");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [added, setAdded] = useState<{
    name: string;
    cohort: string;
    email: string;
  } | null>(null);

  const form = useForm<AddTraineeValues>({
    // CL-21: validate on first blur, then on change, full check on submit.
    mode: "onTouched",
    resolver: zodResolver(addTraineeSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: "PREFER_NOT_TO_SAY",
      genderSelfDescribed: "",
      language: "EN",
      district: "",
      address: "",
      educationLevel: "",
      programmeId: "",
      cohortId: "",
    },
  });

  const submittingState = submitting;
  const watchGender = form.watch("gender");
  const watchProgrammeId = form.watch("programmeId");

  async function goPersonalToEnrolment() {
    const ok = await form.trigger(PERSONAL_FIELDS);
    if (ok) setStep("enrolment");
  }

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
          email: values.email,
          phoneE164: `+91${values.phone}`,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          genderSelfDescribed:
            values.gender === "SELF_DESCRIBED" ? values.genderSelfDescribed?.trim() : undefined,
          language: values.language,
          address: values.address,
          educationLevel: values.educationLevel,
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
          setStep("personal");
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
        email: values.email,
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
          {added.name} was enrolled in {added.cohort}. The enrollment email with their sign-in link is
          on its way to {added.email}. Returning to trainees…
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          {submitError ? (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {step === "personal" ? (
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
                          disabled={submittingState}
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
                          disabled={submittingState}
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
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="trainee@email.com"
                          autoComplete="email"
                          required
                          disabled={submittingState}
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      {fieldState.error ? null : (
                        <FormDescription>
                          The enrollment email with their sign-in link goes here.
                        </FormDescription>
                      )}
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
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date of birth <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" required disabled={submittingState} aria-required="true" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Gender <span className="text-danger-text">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={submittingState}>
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

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Language <span className="text-danger-text">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={submittingState}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EN">English</SelectItem>
                            <SelectItem value="HI">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          <Input maxLength={100} required disabled={submittingState} aria-required="true" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          District <span className="text-danger-text">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Pune"
                            maxLength={100}
                            required
                            disabled={submittingState}
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
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Education <span className="text-danger-text">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={submittingState}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Highest qualification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EDUCATION_LEVELS.map((e) => (
                              <SelectItem key={e.value} value={e.value}>
                                {e.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          maxLength={500}
                          required
                          disabled={submittingState}
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => void goPersonalToEnrolment()} disabled={submittingState}>
                    Continue to enrollment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-5">
              <CardHeader className="p-0">
                <CardTitle>Enrolment</CardTitle>
                <CardDescription>The programme and cohort the trainee joins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-4">
                <EnrollmentSelect
                  programmes={programmes}
                  cohorts={cohorts}
                  programmeId={watchProgrammeId}
                  cohortId={form.watch("cohortId")}
                  onProgrammeChange={(id) => {
                    form.setValue("programmeId", id, { shouldValidate: form.formState.isSubmitted });
                    form.setValue("cohortId", "");
                  }}
                  onCohortChange={(id) => form.setValue("cohortId", id, { shouldValidate: form.formState.isSubmitted })}
                  disabled={submittingState}
                  errors={{
                    programmeId: form.formState.errors.programmeId?.message,
                    cohortId: form.formState.errors.cohortId?.message,
                  }}
                />

                <div className="flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("personal")}
                    disabled={submittingState}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={submittingState}>
                    {submittingState ? <Loader2 className="size-4 animate-spin" /> : null} Add trainee
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </Form>
  );
}
