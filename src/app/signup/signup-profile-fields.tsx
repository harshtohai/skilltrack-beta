"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MAHARASHTRA_DISTRICTS } from "~/lib/districts";
import type { SignupValues } from "./signup-schema";

/**
 * Demographics + consent half of the trainee signup form: district, gender
 * (with conditional self-describe input) and the consent checkbox.
 */
export function SignupProfileFields({
  form,
  loading,
}: {
  form: UseFormReturn<SignupValues>;
  loading: boolean;
}) {
  const watchGender = form.watch("gender");

  return (
    <>
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
                  // No native `required`: it preempts the zod superRefine
                  // with the browser tooltip instead of the styled error.
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
                . I consent to SkillsTrack processing my personal data
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
    </>
  );
}
