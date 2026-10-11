"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MAHARASHTRA_DISTRICTS } from "~/lib/districts";
import type { EmployerRegisterValues } from "./register-schema";

/**
 * Required half of the employer registration form: company identity
 * (name), credentials (work email + password) and hiring basics
 * (sector + district).
 */
export function EmployerRequiredFields({
  form,
  loading,
}: {
  form: UseFormReturn<EmployerRegisterValues>;
  loading: boolean;
}) {
  return (
    <>
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
      </div>
    </>
  );
}
