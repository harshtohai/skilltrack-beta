"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { EmployerRegisterValues } from "./register-schema";

/** Optional extras — bg-muted panel (§4.4). */
export function EmployerOptionalFields({
  form,
  loading,
}: {
  form: UseFormReturn<EmployerRegisterValues>;
  loading: boolean;
}) {
  return (
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
  );
}
