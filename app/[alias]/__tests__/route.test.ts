import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";
import { findUrlByAlias } from "@/lib/urls";
import { notFound, redirect } from "next/navigation";

vi.mock("@/lib/urls", () => ({
  findUrlByAlias: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

describe("GET /[alias]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to row.originalUrl for valid unexpired alias", async () => {
    vi.mocked(findUrlByAlias).mockResolvedValueOnce({
      id: 1,
      originalUrl: "https://example.com/destination",
      alias: "testlink",
      isCustomAlias: false,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: null,
    });

    const request = new NextRequest("http://localhost:3000/testlink");
    await GET(request, { params: Promise.resolve({ alias: "testlink" }) });

    expect(findUrlByAlias).toHaveBeenCalledWith("testlink");
    expect(redirect).toHaveBeenCalledWith("https://example.com/destination");
    expect(notFound).not.toHaveBeenCalled();
  });

  it("calls notFound() when alias is not found", async () => {
    vi.mocked(findUrlByAlias).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/unknown");
    await GET(request, { params: Promise.resolve({ alias: "unknown" }) });

    expect(findUrlByAlias).toHaveBeenCalledWith("unknown");
    expect(notFound).toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("calls notFound() when alias exists but expiresAt is in the past", async () => {
    vi.mocked(findUrlByAlias).mockResolvedValueOnce({
      id: 2,
      originalUrl: "https://example.com/expired",
      alias: "expiredlink",
      isCustomAlias: false,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() - 10000),
    });

    const request = new NextRequest("http://localhost:3000/expiredlink");
    await GET(request, { params: Promise.resolve({ alias: "expiredlink" }) });

    expect(findUrlByAlias).toHaveBeenCalledWith("expiredlink");
    expect(notFound).toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
