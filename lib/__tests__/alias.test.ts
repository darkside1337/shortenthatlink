import { describe, it, expect } from "vitest";
import { RESERVED_ALIASES } from "@/lib/reserved-aliases";
import { generateAlias, validateCustomAlias } from "@/lib/alias";

const ALIAS_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

describe("RESERVED_ALIASES", () => {
  it("contains all required system and top-level route keywords", () => {
    const required = [
      "admin",
      "api",
      "assets",
      "auth",
      "cron",
      "dashboard",
      "favicon",
      "login",
      "robots",
      "sitemap",
      "static",
    ];

    for (const word of required) {
      expect(RESERVED_ALIASES.has(word)).toBe(true);
    }
  });

  it("stores all reserved aliases in lowercase", () => {
    for (const word of RESERVED_ALIASES) {
      expect(word).toBe(word.toLowerCase());
    }
  });
});

describe("generateAlias", () => {
  it("generates a 9-character string using only the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const alias = generateAlias();
      expect(alias).toHaveLength(9);
      for (const char of alias) {
        expect(ALIAS_ALPHABET).toContain(char);
      }
    }
  });

  it("never contains ambiguous characters or uppercase letters", () => {
    const ambiguous = ["0", "O", "1", "l", "I"];
    for (let i = 0; i < 200; i++) {
      const alias = generateAlias();
      for (const char of ambiguous) {
        expect(alias).not.toContain(char);
      }
      expect(alias).toBe(alias.toLowerCase());
    }
  });
});

describe("validateCustomAlias", () => {
  describe("Ordered validation hierarchy", () => {
    it("enforces rule 1: length must be 4–52 characters", () => {
      expect(validateCustomAlias("")).toBe("Alias must be 4–52 characters.");
      expect(validateCustomAlias("a")).toBe("Alias must be 4–52 characters.");
      expect(validateCustomAlias("abc")).toBe("Alias must be 4–52 characters.");
      expect(validateCustomAlias("a".repeat(53))).toBe("Alias must be 4–52 characters.");
    });

    it("enforces rule 2: only letters, numbers, and hyphens", () => {
      expect(validateCustomAlias("test_alias")).toBe("Only letters, numbers, and hyphens allowed.");
      expect(validateCustomAlias("test.alias")).toBe("Only letters, numbers, and hyphens allowed.");
      expect(validateCustomAlias("test@alias")).toBe("Only letters, numbers, and hyphens allowed.");
      expect(validateCustomAlias("test/alias")).toBe("Only letters, numbers, and hyphens allowed.");
      expect(validateCustomAlias("test alias")).toBe("Only letters, numbers, and hyphens allowed.");
      expect(validateCustomAlias("test!alias")).toBe("Only letters, numbers, and hyphens allowed.");
    });

    it("enforces rule 3: cannot start or end with a hyphen", () => {
      expect(validateCustomAlias("-myalias")).toBe("Alias cannot start or end with a hyphen.");
      expect(validateCustomAlias("myalias-")).toBe("Alias cannot start or end with a hyphen.");
      expect(validateCustomAlias("-myalias-")).toBe("Alias cannot start or end with a hyphen.");
    });

    it("enforces rule 4: cannot contain consecutive hyphens", () => {
      expect(validateCustomAlias("my--alias")).toBe("Alias cannot contain consecutive hyphens.");
      expect(validateCustomAlias("my---alias")).toBe("Alias cannot contain consecutive hyphens.");
    });

    it("enforces rule 5: cannot be in RESERVED_ALIASES", () => {
      expect(validateCustomAlias("dashboard")).toBe("This alias is reserved.");
      expect(validateCustomAlias("DASHBOARD")).toBe("This alias is reserved.");
      expect(validateCustomAlias("admin")).toBe("This alias is reserved.");
      expect(validateCustomAlias("auth")).toBe("This alias is reserved.");
      expect(validateCustomAlias("login")).toBe("This alias is reserved.");
      expect(validateCustomAlias("cron")).toBe("This alias is reserved.");
      expect(validateCustomAlias("static")).toBe("This alias is reserved.");
      expect(validateCustomAlias("assets")).toBe("This alias is reserved.");
    });

    it("evaluates rules in exact precedence order", () => {
      // Short + invalid char: fails on length first
      expect(validateCustomAlias("a_")).toBe("Alias must be 4–52 characters.");

      // Invalid char + hyphen start: fails on invalid char first
      expect(validateCustomAlias("-test_alias")).toBe("Only letters, numbers, and hyphens allowed.");

      // Consecutive hyphens + start with hyphen: fails on hyphen start first
      expect(validateCustomAlias("--alias")).toBe("Alias cannot start or end with a hyphen.");

      // Reserved word but too short (e.g. if a 3-letter word were reserved): length takes precedence
      expect(validateCustomAlias("api")).toBe("Alias must be 4–52 characters.");
    });
  });

  describe("Valid custom aliases", () => {
    it("returns null for valid aliases", () => {
      expect(validateCustomAlias("custom-link")).toBeNull();
      expect(validateCustomAlias("Custom-Link")).toBeNull();
      expect(validateCustomAlias("my-link-123")).toBeNull();
      expect(validateCustomAlias("four")).toBeNull();
      expect(validateCustomAlias("a".repeat(52))).toBeNull();
      expect(validateCustomAlias("link-with-single-hyphens-allowed")).toBeNull();
    });
  });
});
