"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import {
  LocationCompensationSection,
  RoleDetailsSection,
  ScreeningLogisticsSection,
} from "./form-sections";
import { postJobSchema, type PostJobValues } from "./post-job-schema";

/**
 * Post Job form (F25) per design §9.6 — RHF+zod with sections in cards and a
 * sticky Cancel/Save footer (CL-20/21). Calls `onPosted` once the posting was
 * created; the page owns the success state and redirect.
 */
export function PostJobForm({ onPosted }: { onPosted: () => void }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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

  // Leave guard per §9.6/§10: warn before leaving with unsaved form edits.
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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
          skillsRequired: values.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          openings: values.openings,
          ...(values.applicationDeadline
            ? {
                applicationDeadline: new Date(
                  values.applicationDeadline,
                ).toISOString(),
              }
            : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to create job posting");
      }
      onPosted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create job posting",
      );
    } finally {
      setCreating(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="max-w-2xl space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <RoleDetailsSection form={form} disabled={creating} />
          <LocationCompensationSection form={form} disabled={creating} />
          <ScreeningLogisticsSection form={form} disabled={creating} />
        </div>

        {/* Sticky footer per §9.6: [Cancel] left, PRIMARY right */}
        <div className="bg-background/80 sticky bottom-0 -mx-4 mt-6 border-t p-4 backdrop-blur md:-mx-6 md:px-6">
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
  );
}
