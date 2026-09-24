import { describe, it, expect } from "vitest";
import { computeExpirationDate } from "../expiration";

describe("lib/expiration", () => {
  const baseTime = 1700000000000; // Fixed timestamp for testing

  it("returns undefined for 'never'", () => {
    expect(computeExpirationDate("never", baseTime)).toBeUndefined();
  });

  it("computes 1h expiration correctly", () => {
    const result = computeExpirationDate("1h", baseTime);
    expect(result).toBe(new Date(baseTime + 3600 * 1000).toISOString());
  });

  it("computes 24h expiration correctly", () => {
    const result = computeExpirationDate("24h", baseTime);
    expect(result).toBe(new Date(baseTime + 24 * 3600 * 1000).toISOString());
  });

  it("computes 7d expiration correctly", () => {
    const result = computeExpirationDate("7d", baseTime);
    expect(result).toBe(new Date(baseTime + 7 * 24 * 3600 * 1000).toISOString());
  });

  it("computes 30d expiration correctly", () => {
    const result = computeExpirationDate("30d", baseTime);
    expect(result).toBe(new Date(baseTime + 30 * 24 * 3600 * 1000).toISOString());
  });
});
