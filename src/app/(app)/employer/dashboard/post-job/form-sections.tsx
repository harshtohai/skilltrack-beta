"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
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
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  SALARY_BAND_LABELS,
} from "~/lib/job-board-labels";
import { MAHARASHTRA_DISTRICTS } from "~/lib/districts";
import {
  EMPLOYMENT_TYPES,
  WORK_MODES,
  SALARY_BANDS,
  type PostJobValues,
} from "./post-job-schema";

type SectionProps = {
  form: UseFormReturn<PostJobValues>;
  disabled: boolean;
};

export function RoleDetailsSection({ form, disabled }: SectionProps) {
  return (
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
                  disabled={disabled}
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
                  disabled={disabled}
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
                  <SelectTrigger className="w-full" disabled={disabled}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {EMPLOYMENT_TYPE_LABELS[t] ?? t}
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
            name="workMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work mode</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" disabled={disabled}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {WORK_MODE_LABELS[m] ?? m}
                      </SelectItem>
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
  );
}

export function LocationCompensationSection({ form, disabled }: SectionProps) {
  return (
    <Card className="p-5">
      <CardHeader className="p-0">
        <CardTitle>Location & compensation</CardTitle>
        <CardDescription>
          Where the role is based and how it pays.
        </CardDescription>
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
                <SelectTrigger className="w-full" disabled={disabled}>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {MAHARASHTRA_DISTRICTS.map((d) => (
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
          name="salaryBand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary band</FormLabel>
              <Select
                value={field.value === "" ? "none" : field.value}
                onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full" disabled={disabled}>
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {SALARY_BANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {SALARY_BAND_LABELS[b] ?? b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function ScreeningLogisticsSection({ form, disabled }: SectionProps) {
  return (
    <Card className="p-5">
      <CardHeader className="p-0">
        <CardTitle>Screening & logistics</CardTitle>
        <CardDescription>
          Skills you look for, openings and the deadline.
        </CardDescription>
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
                  disabled={disabled}
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
                    disabled={disabled}
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
                  <Input type="date" disabled={disabled} {...field} />
                </FormControl>
                <FormDescription>Optional.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
