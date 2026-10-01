"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Skeleton } from "~/components/patterns/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { PageHeader } from "~/components/patterns/page-header";
import type { EmployerJobsResponse, EmployerVerificationStatus } from "~/lib/job-board-contracts";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const SALARY_BAND_LABELS: Record<string, string> = {
  LT_10K: "< ₹10K",
  B_10_20K: "₹10-20K",
  B_20_35K: "₹20-35K",
  B_35_50K: "₹35-50K",
  GT_50K: "> ₹50K",
};

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABELS);
const WORK_MODES = Object.keys(WORK_MODE_LABELS);
const SALARY_BANDS = Object.keys(SALARY_BAND_LABELS);

const postJobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters")
    .refine((v) => v.trim().length >= 3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters")
    .refine((v) => v.trim().length >= 10, "Description must be at least 10 characters"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"]),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  salaryBand: z.string().optional(),
  district: z.string().min(1, "Please select a district"),
  skills: z
    .string()
    .min(1, "Add at least one skill")
    .refine(
      (v) => v.split(",").map((s) => s.trim()).filter(Boolean).length > 0,
      "Add at least one skill"
    ),
  openings: z
    .string()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 100, "Enter 1–100"),
  applicationDeadline: z.string().optional(),
});

type PostJobValues = z.infer<typeof postJobSchema>;

/**
 * Post Job (F25) per design §9.6 — Shell S1 page, `max-w-2xl`, RHF+zod with
 * sections in cards and a sticky Cancel/Save footer (CL-20/21). The dashboard
 * keeps a single "Post Job" button that navigates here. Same verification
 * gate as the dashboard: PENDING/SUSPENDED/REJECTED employers see the banner
 * only. On success it returns to the dashboard, where the new posting
 * appears in the list.
 */
export default function PostJobPage() {
  const router = useRouter();
  const [status, setStatus] = useState<EmployerVerificationStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [gateError, setGateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(false);

  const form = useForm<PostJobValues>({
    resolver: zodResolver(postJobSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      employmentType: "FULL_TIME",
      workMode: "ONSITE",
      salaryBand: "",
      district: "",
      skills: "",
      openings: "1",
      applicationDeadline: "",
    },
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/employer/jobs");
        if (!active) return;
        if (res.status === 401) {
          router.push("/employer/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load employer profile");
        const json = (await res.json()) as EmployerJobsResponse;
        setStatus(json.employer.verificationStatus);
      } catch (err) {
        console.error("Post-job gate error:", err);
        if (active) setGateError("Failed to load employer profile");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/v1/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          employmentType: values.employmentType,
          workMode: values.workMode,
          ...(values.salaryBand ? { salaryBand: values.salaryBand } : {}),
          district: values.district,
          skillsRequired: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
          openings: values.openings,
          ...(values.applicationDeadline
            ? { applicationDeadline: new Date(values.applicationDeadline).toISOString() }
            : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to create job posting");
      }
      setPosted(true);
      // Let the success state register, then return to the dashboard where
      // the new posting heads the list.
      setTimeout(() => router.push("/employer/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job posting");
    } finally {
      setCreating(false);
    }
  });

  if (checking) {
    return (
      <div>
        <Skeleton className="mb-6 h-14 w-72" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (gateError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{gateError}</AlertDescription>
      </Alert>
    );
  }

  // Same verification gate as the dashboard: banner only for non-verified.
  if (status === "PENDING") {
    return (
      <Alert variant="warning">
        <AlertTitle>Verification pending</AlertTitle>
        <AlertDescription>
          Your registration is under review. You can log in, and will be able to post jobs once an
          admin verifies your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Account suspended</AlertTitle>
        <AlertDescription>
          Job posting is disabled. Contact the skill mission team to reinstate your account.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "REJECTED") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Registration rejected</AlertTitle>
        <AlertDescription>
          Your employer registration was not approved. Contact the skill mission team for details.
        </AlertDescription>
      </Alert>
    );
  }

  if (posted) {
    return (
      <Alert variant="success">
        <AlertTitle>Job posted</AlertTitle>
        <AlertDescription>
          Your posting is live on the trainee job board. Returning to the dashboard…
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title="Post a job"
        caption="Describe the role — it goes live on the trainee job board once posted."
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div className="max-w-2xl space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Section: Role details */}
            <Card className="p-5">
              <CardHeader className="p-0">
                <CardTitle>Role details</CardTitle>
                <CardDescription>What the trainee will do and how.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Job title <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. CNC Machine Operator"
                          maxLength={120}
                          disabled={creating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Role, responsibilities, requirements…"
                          maxLength={5000}
                          disabled={creating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full" disabled={creating}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMPLOYMENT_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t] ?? t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work mode</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full" disabled={creating}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORK_MODES.map((m) => (
                              <SelectItem key={m} value={m}>{WORK_MODE_LABELS[m] ?? m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section: Location & compensation */}
            <Card className="p-5">
              <CardHeader className="p-0">
                <CardTitle>Location & compensation</CardTitle>
                <CardDescription>Where the role is based and how it pays.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        District <span className="text-danger-text">*</span>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full" disabled={creating}>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICTS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryBand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary band</FormLabel>
                      <Select
                        value={field.value === "" ? "none" : field.value}
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="w-full" disabled={creating}>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          {SALARY_BANDS.map((b) => (
                            <SelectItem key={b} value={b}>{SALARY_BAND_LABELS[b] ?? b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section: Screening & logistics */}
            <Card className="p-5">
              <CardHeader className="p-0">
                <CardTitle>Screening & logistics</CardTitle>
                <CardDescription>Skills you look for, openings and the deadline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-4">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Skills required <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Welding, CNC, Safety"
                          disabled={creating}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Comma-separated.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="openings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Openings</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            disabled={creating}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application deadline</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            disabled={creating}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky footer per §9.6: [Cancel] left, PRIMARY right */}
          <div className="sticky bottom-0 -mx-4 mt-6 border-t bg-background/80 p-4 backdrop-blur md:-mx-6 md:px-6">
            <div className="mx-auto flex max-w-2xl justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/employer/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating ? <Loader2 className="animate-spin" /> : <Plus />}
                {creating ? "Posting…" : "Post Job"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
