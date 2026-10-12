"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { SignupValues } from "./signup-schema";

/**
 * Identity half of the trainee signup form: name, email, phone. API
 * duplicate errors (EMAIL_EXISTS/PHONE_EXISTS) land inline on their field
 * with a "Sign in instead" hand-off.
 */
export function SignupIdentityFields({
  form,
  loading,
}: {
  form: UseFormReturn<SignupValues>;
  loading: boolean;
}) {
  return (
    <>
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
                required
                disabled={loading}
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
    </>
  );
}
