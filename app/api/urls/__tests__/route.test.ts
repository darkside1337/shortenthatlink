import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "../route";
import * as authModule from "@/lib/auth";
import * as urlsModule from "@/lib/urls";
import * as aliasModule from "@/lib/alias";

vi.mock("@/lib/auth", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("@/lib/urls", () => ({
  createUrl: vi.fn(),
  listUrlsForUser: vi.fn(),
}));

vi.mock("@/lib/alias", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/alias")>();
  return {
    ...actual,
    generateAlias: vi.fn(actual.generateAlias),
  };
});

describe("/api/urls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST", () => {
    it("1. returns 400 if originalUrl missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({
        success: false,
        error: {
          message: "URL is required.",
          code: "INVALID_FORMAT",
        },
      });
    });

    it("2. returns 400 if originalUrl is not a parseable or valid http/https URL", async () => {
      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({ originalUrl: "not-a-valid-url" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({
        success: false,
        error: {
          message: "Only HTTP and HTTPS URLs are allowed.",
          code: "INVALID_FORMAT",
        },
      });
    });

    it("3. returns 400 if expiresAt is in the past", async () => {
      const pastDate = new Date(Date.now() - 60000).toISOString();
      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({
          originalUrl: "https://example.com",
          expiresAt: pastDate,
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({
        success: false,
        error: {
          message: "Expiration date must be in the future.",
          code: "INVALID_FORMAT",
        },
      });
    });

    it("4. with valid URL and no custom alias calls generateAlias + createUrl and returns 201", async () => {
      vi.mocked(authModule.getCurrentUserId).mockResolvedValue("user-123");
      vi.mocked(aliasModule.generateAlias).mockReturnValue("auto12345");
      const mockCreated = {
        id: 1,
        alias: "auto12345",
        originalUrl: "https://example.com",
        isCustomAlias: false,
        userId: "user-123",
        expiresAt: null,
        createdAt: new Date("2026-09-24T12:00:00.000Z"),
        updatedAt: new Date("2026-09-24T12:00:00.000Z"),
      };
      vi.mocked(urlsModule.createUrl).mockResolvedValue(mockCreated);

      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({ originalUrl: "https://example.com" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(aliasModule.generateAlias).toHaveBeenCalled();
      expect(urlsModule.createUrl).toHaveBeenCalledWith({
        originalUrl: "https://example.com",
        alias: "auto12345",
        isCustomAlias: false,
        userId: "user-123",
        expiresAt: null,
      });
      expect(json).toEqual({
        success: true,
        data: {
          id: 1,
          alias: "auto12345",
          originalUrl: "https://example.com",
          isCustomAlias: false,
          expiresAt: null,
          createdAt: mockCreated.createdAt.toISOString(),
          updatedAt: mockCreated.updatedAt.toISOString(),
        },
      });
    });

    it("5. with valid custom alias calls createUrl and returns 201", async () => {
      vi.mocked(authModule.getCurrentUserId).mockResolvedValue("user-456");
      const mockCreated = {
        id: 2,
        alias: "my-custom-alias",
        originalUrl: "https://example.com",
        isCustomAlias: true,
        userId: "user-456",
        expiresAt: null,
        createdAt: new Date("2026-09-24T12:00:00.000Z"),
        updatedAt: new Date("2026-09-24T12:00:00.000Z"),
      };
      vi.mocked(urlsModule.createUrl).mockResolvedValue(mockCreated);

      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({
          originalUrl: "https://example.com",
          customAlias: "my-custom-alias",
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(urlsModule.createUrl).toHaveBeenCalledWith({
        originalUrl: "https://example.com",
        alias: "my-custom-alias",
        isCustomAlias: true,
        userId: "user-456",
        expiresAt: null,
      });
      expect(json).toEqual({
        success: true,
        data: {
          id: 2,
          alias: "my-custom-alias",
          originalUrl: "https://example.com",
          isCustomAlias: true,
          expiresAt: null,
          createdAt: mockCreated.createdAt.toISOString(),
          updatedAt: mockCreated.updatedAt.toISOString(),
        },
      });
    });

    it("6. with custom alias failing validation returns 400 INVALID_FORMAT", async () => {
      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({
          originalUrl: "https://example.com",
          customAlias: "bad", // length < 4
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({
        success: false,
        error: {
          message: "Alias must be 4–52 characters.",
          code: "INVALID_FORMAT",
        },
      });
      expect(urlsModule.createUrl).not.toHaveBeenCalled();
    });

    it("7. with custom alias that collides in DB returns 409 ALIAS_TAKEN", async () => {
      vi.mocked(authModule.getCurrentUserId).mockResolvedValue(null);
      const dbError: any = new Error("Unique constraint violation");
      dbError.code = "23505";
      vi.mocked(urlsModule.createUrl).mockRejectedValue(dbError);

      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({
          originalUrl: "https://example.com",
          customAlias: "taken-alias",
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json).toEqual({
        success: false,
        error: {
          message: "Alias already taken.",
          code: "ALIAS_TAKEN",
        },
      });
    });

    it("8. retries up to 5 times on generated-alias collision, then returns 500 ALIAS_COLLISION", async () => {
      vi.mocked(authModule.getCurrentUserId).mockResolvedValue(null);
      const dbError: any = new Error("Unique constraint violation");
      dbError.code = "23505";
      vi.mocked(urlsModule.createUrl).mockRejectedValue(dbError);

      const request = new NextRequest("http://localhost:3000/api/urls", {
        method: "POST",
        body: JSON.stringify({ originalUrl: "https://example.com" }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(aliasModule.generateAlias).toHaveBeenCalledTimes(5);
      expect(urlsModule.createUrl).toHaveBeenCalledTimes(5);
      expect(json).toEqual({
        success: false,
        error: {
          message: "Failed to generate a unique alias.",
          code: "ALIAS_COLLISION",
        },
      });
    });
  });

  describe("GET", () => {
    it("9. returns 401 when getCurrentUserId() returns null; returns 200 with user links on success", async () => {
      // Part A: Unauthenticated -> 401
      vi.mocked(authModule.getCurrentUserId).mockResolvedValueOnce(null);

      const unauthResponse = await GET();
      const unauthJson = await unauthResponse.json();

      expect(unauthResponse.status).toBe(401);
      expect(unauthJson).toEqual({
        success: false,
        error: {
          message: "Authentication required.",
          code: "UNAUTHORIZED",
        },
      });
      expect(urlsModule.listUrlsForUser).not.toHaveBeenCalled();

      // Part B: Authenticated -> 200 with user links
      const mockUrls = [
        {
          id: 1,
          alias: "link-one",
          originalUrl: "https://one.example.com",
          isCustomAlias: true,
          userId: "user-123",
          expiresAt: null,
          createdAt: new Date("2026-09-24T10:00:00.000Z"),
          updatedAt: new Date("2026-09-24T10:00:00.000Z"),
        },
      ];
      vi.mocked(authModule.getCurrentUserId).mockResolvedValueOnce("user-123");
      vi.mocked(urlsModule.listUrlsForUser).mockResolvedValueOnce(mockUrls);

      const authResponse = await GET();
      const authJson = await authResponse.json();

      expect(authResponse.status).toBe(200);
      expect(urlsModule.listUrlsForUser).toHaveBeenCalledWith("user-123");
      expect(authJson).toEqual({
        success: true,
        data: [
          {
            id: 1,
            alias: "link-one",
            originalUrl: "https://one.example.com",
            isCustomAlias: true,
            userId: "user-123",
            expiresAt: null,
            createdAt: mockUrls[0].createdAt.toISOString(),
            updatedAt: mockUrls[0].updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
