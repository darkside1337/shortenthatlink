import { z } from "zod";
import { validateCustomAlias } from "@/lib/alias";

const MAX_INT32 = 2147483647;

export const urlIdSchema = z
  .string({ message: "ID is required." })
  .regex(/^[1-9]\d*$/, "ID must be a positive integer.")
  .transform((val) => Number(val))
  .refine((val) => val <= MAX_INT32, "ID exceeds maximum integer limit.");

export const renameAliasSchema = z.object({
  newAlias: z
    .string({ message: "New alias is required." })
    .trim()
    .min(1, "New alias is required.")
    .transform((val) => val.toLowerCase())
    .superRefine((val, ctx) => {
      const error = validateCustomAlias(val);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
        });
      }
    }),
});

export type RenameAliasInput = z.infer<typeof renameAliasSchema>;
