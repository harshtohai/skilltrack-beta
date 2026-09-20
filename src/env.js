import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    INTERNAL_API_KEY: z.string().min(32),
    BOT_BASE_URL: z.string().url().optional(),
    BACKEND_BASE_URL: z.string().url().optional(),
    APP_BASE_URL: z.string().url().optional(),
    BOT_MODE: z.enum(["real", "mock"]).default("mock"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    BOT_BASE_URL: process.env.BOT_BASE_URL,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    APP_BASE_URL: process.env.APP_BASE_URL,
    BOT_MODE: process.env.BOT_MODE,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});