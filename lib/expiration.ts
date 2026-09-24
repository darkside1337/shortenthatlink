import type { ExpirationOption } from "@/features/shortener/types";

const EXPIRATION_MS: Record<Exclude<ExpirationOption, "never">, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/**
 * Computes an ISO 8601 string for a given expiration option.
 * Returns undefined for "never".
 */
export function computeExpirationDate(
  option: ExpirationOption,
  fromTimestamp = Date.now()
): string | undefined {
  if (option === "never") return undefined;
  const ms = EXPIRATION_MS[option];
  if (!ms) return undefined;
  return new Date(fromTimestamp + ms).toISOString();
}
