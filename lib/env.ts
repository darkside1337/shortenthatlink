import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";

const envSchema = z.object({
  DATABASE_URL: isTest
    ? z.string().default("postgresql://mock:mock@localhost:5432/mock")
    : z.string().min(1, "DATABASE_URL must be a valid PostgreSQL connection string"),
  BETTER_AUTH_SECRET: isTest
    ? z.string().default("test-secret-mock-32-chars-long-12345")
    : z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  CRON_SECRET: isTest
    ? z.string().default("test-cron-secret")
    : z.string().min(1, "CRON_SECRET is required for cron authentication"),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
