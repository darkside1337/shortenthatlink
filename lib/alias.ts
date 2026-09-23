import { customAlphabet } from "nanoid";
import { RESERVED_ALIASES } from "@/lib/reserved-aliases";

const ALIAS_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const ALIAS_LENGTH = 9;

const nanoid = customAlphabet(ALIAS_ALPHABET, ALIAS_LENGTH);

/**
 * Generates an unambiguous 9-character alias.
 * Excludes visually ambiguous characters (0/O, 1/l/I) and uppercase letters.
 */
export function generateAlias(): string {
  return nanoid();
}

/**
 * Validates a custom alias according to the 5-step rule hierarchy.
 * Returns an error string if invalid, or null if valid.
 */
export function validateCustomAlias(alias: string): string | null {
  const normalized = alias.toLowerCase();

  // 1. Length not between 4 and 52
  if (normalized.length < 4 || normalized.length > 52) {
    return "Alias must be 4–52 characters.";
  }

  // 2. Contains characters other than a-z, 0-9, -
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return "Only letters, numbers, and hyphens allowed.";
  }

  // 3. Starts or ends with -
  if (normalized.startsWith("-") || normalized.endsWith("-")) {
    return "Alias cannot start or end with a hyphen.";
  }

  // 4. Contains consecutive hyphens (--)
  if (normalized.includes("--")) {
    return "Alias cannot contain consecutive hyphens.";
  }

  // 5. Is in RESERVED_ALIASES
  if (RESERVED_ALIASES.has(normalized)) {
    return "This alias is reserved.";
  }

  return null;
}
