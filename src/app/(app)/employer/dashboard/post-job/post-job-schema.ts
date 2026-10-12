import { z } from "zod";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  SALARY_BAND_LABELS,
} from "~/lib/job-board-labels";

export const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABELS);
export const WORK_MODES = Object.keys(WORK_MODE_LABELS);
export const SALARY_BANDS = Object.keys(SALARY_BAND_LABELS);

// Client-side form schema — mirrors the raw RHF inputs (openings is a string
// input; skills a comma-separated string). The server validates the submitted
// payload against createJobSchema in ~/lib/job-board-contracts.
export const postJobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters")
    .refine((v) => v.trim().length >= 3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters")
    .refine(
      (v) => v.trim().length >= 10,
      "Description must be at least 10 characters",
    ),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "INTERNSHIP",
    "CONTRACT",
    "FREELANCE",
  ]),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  salaryBand: z.string().optional(),
  district: z.string().min(1, "Please select a district"),
  skills: z
    .string()
    .min(1, "Add at least one skill")
    .refine(
      (v) =>
        v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean).length > 0,
      "Add at least one skill",
    ),
  openings: z
    .string()
    .refine(
      (v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 100,
      "Enter 1–100",
    ),
  applicationDeadline: z.string().optional(),
});

export type PostJobValues = z.infer<typeof postJobSchema>;
