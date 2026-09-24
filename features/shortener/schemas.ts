import { z } from "zod";
import { validateCustomAlias } from "@/lib/alias";

const MAX_URL_LENGTH = 2048;

export const createUrlSchema = z.object({
  originalUrl: z
    .string({ message: "URL is required." })
    .trim()
    .min(1, "URL is required.")
    .max(MAX_URL_LENGTH, `URL must be ${MAX_URL_LENGTH} characters or less.`)
    .refine((val) => !/[\r\n\t]/.test(val), "URL cannot contain control characters.")
    .refine((val) => {
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "Only HTTP and HTTPS URLs are allowed."),

  customAlias: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val ? val.toLowerCase() : undefined))
    .superRefine((val, ctx) => {
      if (!val) return;
      const error = validateCustomAlias(val);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
        });
      }
    }),

  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format." })
    .optional()
    .nullable(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
