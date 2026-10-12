import { z } from "zod";

/**
 * Employer registration schema — the API contract requires 5 fields
 * (company, email, password, sector, district); the rest are optional.
 */
export const employerRegisterSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Name must be at least 2 characters")
    .max(120),
  contactEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Enter a valid email")
    .max(254),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(72),
  sector: z
    .string()
    .min(1, "Sector is required")
    .min(2, "Sector must be at least 2 characters")
    .max(80),
  district: z.string().min(1, "Please select your district"),
  registrationNo: z.string().max(40).optional(),
  hiringNeeds: z.string().max(500).optional(),
  employeeCount: z
    .string()
    .refine((v) => v === "" || /^\d+$/.test(v), "Enter a valid number")
    .optional(),
});

export type EmployerRegisterValues = z.infer<typeof employerRegisterSchema>;
