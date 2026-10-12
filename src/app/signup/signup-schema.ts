import { z } from "zod";

/**
 * Trainee signup schema (D-06): name, email, phone, district, gender,
 * consent — exactly what the API stores.
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit Indian mobile number"),
    district: z.string().min(1, "Please select your district"),
    gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "SELF_DESCRIBED", "PREFER_NOT_TO_SAY"]),
    genderSelfDescribed: z.string().optional(),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the terms and consent to data processing",
      }),
    }),
  })
  .superRefine((data, ctx) => {
    // Self-described text is required when the choice is SELF_DESCRIBED.
    if (data.gender === "SELF_DESCRIBED" && !data.genderSelfDescribed?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["genderSelfDescribed"],
        message: "Please describe your gender",
      });
    }
  });

export type SignupValues = z.infer<typeof signupSchema>;
