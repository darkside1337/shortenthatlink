import { describe, it, expect } from "vitest";
import { isPgUniqueViolation } from "@/lib/api";

describe("isPgUniqueViolation", () => {
  it("matches a flat { code: 23505 } error (unit-test mock shape)", () => {
    const err: unknown = Object.assign(new Error("duplicate key"), {
      code: "23505",
    });
    expect(isPgUniqueViolation(err)).toBe(true);
  });

  it("matches a Drizzle-wrapped error with the PG error under cause (real driver shape)", () => {
    const pgError: unknown = Object.assign(
      new Error('duplicate key value violates unique constraint "url_alias_unique"'),
      { code: "23505" },
    );
    const wrapped = new Error(
      'Failed query: insert into "url" ("alias") values ($1)',
      { cause: pgError },
    );
    expect(isPgUniqueViolation(wrapped)).toBe(true);
  });

  it("rejects non-violation codes, including nested ones", () => {
    expect(
      isPgUniqueViolation(Object.assign(new Error("x"), { code: "23503" })),
    ).toBe(false);
    const wrapped = new Error("Failed query", {
      cause: Object.assign(new Error("foreign key"), { code: "23503" }),
    });
    expect(isPgUniqueViolation(wrapped)).toBe(false);
  });

  it("rejects non-objects and code-less errors", () => {
    expect(isPgUniqueViolation(null)).toBe(false);
    expect(isPgUniqueViolation(undefined)).toBe(false);
    expect(isPgUniqueViolation("23505")).toBe(false);
    expect(isPgUniqueViolation(new Error("plain"))).toBe(false);
    expect(isPgUniqueViolation(new Error("wrapped", { cause: new Error("plain") }))).toBe(
      false,
    );
  });
});
