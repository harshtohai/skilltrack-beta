import { z } from "zod";

/**
 * Email-change values (T5 step 1): just the new address — the OTP entry is
 * slot state, not form state, and the server re-validates everything.
 */
export const changeEmailSchema = z.object({
  newEmail: z.string().min(1, "Enter the new email").email("Enter a valid email").max(200),
});

export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
