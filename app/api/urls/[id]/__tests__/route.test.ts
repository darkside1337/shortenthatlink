import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH, DELETE } from "../route";
import * as auth from "@/lib/auth";
import * as urls from "@/lib/urls";

vi.mock("@/lib/auth", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("@/lib/urls", () => ({
  renameUrlAlias: vi.fn(),
  deleteUrl: vi.fn(),
}));

describe("app/api/urls/[id]/route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PATCH /api/urls/[id]", () => {
    it("returns 401 when getCurrentUserId() is null", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/urls/1", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "valid-alias" }),
      });
      const params = Promise.resolve({ id: "1" });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({
        success: false,
        error: { message: "Authentication required." },
      });
      expect(urls.renameUrlAlias).not.toHaveBeenCalled();
    });

    it("returns 400 for non-integer id param or out-of-range integer", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");

      // Non-integer string
      const req1 = new NextRequest("http://localhost:3000/api/urls/abc", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "valid-alias" }),
      });
      const res1 = await PATCH(req1, {
        params: Promise.resolve({ id: "abc" }),
      });
      const json1 = await res1.json();

      expect(res1.status).toBe(400);
      expect(json1).toEqual({
        success: false,
        error: {
          message: "ID must be a positive integer.",
          code: "INVALID_ID",
        },
      });

      // Out-of-range integer (exceeds MAX_INT32 = 2147483647)
      const req2 = new NextRequest("http://localhost:3000/api/urls/9999999999", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "valid-alias" }),
      });
      const res2 = await PATCH(req2, {
        params: Promise.resolve({ id: "9999999999" }),
      });
      const json2 = await res2.json();

      expect(res2.status).toBe(400);
      expect(json2).toEqual({
        success: false,
        error: {
          message: "ID exceeds maximum integer limit.",
          code: "INVALID_ID",
        },
      });
      expect(urls.renameUrlAlias).not.toHaveBeenCalled();
    });

    it("returns 400 when newAlias fails validation", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");

      // Reserved keyword alias failing validation
      const req = new NextRequest("http://localhost:3000/api/urls/1", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "admin" }),
      });
      const params = Promise.resolve({ id: "1" });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json).toEqual({
        success: false,
        error: {
          message: "This alias is reserved.",
          code: "INVALID_FORMAT",
        },
      });
      expect(urls.renameUrlAlias).not.toHaveBeenCalled();
    });

    it("returns 404 when renameUrlAlias returns null (not found / not owned)", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");
      vi.mocked(urls.renameUrlAlias).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/urls/42", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "valid-alias" }),
      });
      const params = Promise.resolve({ id: "42" });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json).toEqual({
        success: false,
        error: { message: "Link not found or access denied." },
      });
      expect(urls.renameUrlAlias).toHaveBeenCalledWith(42, "user-123", "valid-alias");
    });

    it("returns 409 ALIAS_TAKEN when DB throws 23505", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");
      const dbError: any = new Error("duplicate key value violates unique constraint");
      dbError.code = "23505";
      vi.mocked(urls.renameUrlAlias).mockRejectedValueOnce(dbError);

      const req = new NextRequest("http://localhost:3000/api/urls/42", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "taken-alias" }),
      });
      const params = Promise.resolve({ id: "42" });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json).toEqual({
        success: false,
        error: {
          message: "Alias already taken.",
          code: "ALIAS_TAKEN",
        },
      });
    });

    it("returns 200 with updated row on success", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");
      const mockUpdated = {
        id: 42,
        originalUrl: "https://example.com/target",
        alias: "new-shiny-alias",
        isCustomAlias: true,
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: null,
      };
      vi.mocked(urls.renameUrlAlias).mockResolvedValueOnce(mockUpdated);

      const req = new NextRequest("http://localhost:3000/api/urls/42", {
        method: "PATCH",
        body: JSON.stringify({ newAlias: "NEW-SHINY-ALIAS" }),
      });
      const params = Promise.resolve({ id: "42" });

      const res = await PATCH(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({
        success: true,
        data: {
          ...mockUpdated,
          createdAt: mockUpdated.createdAt.toISOString(),
          updatedAt: mockUpdated.updatedAt.toISOString(),
        },
      });
      expect(urls.renameUrlAlias).toHaveBeenCalledWith(
        42,
        "user-123",
        "new-shiny-alias"
      );
    });
  });

  describe("DELETE /api/urls/[id]", () => {
    it("returns 401 when no session", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/urls/1", {
        method: "DELETE",
      });
      const params = Promise.resolve({ id: "1" });

      const res = await DELETE(req, { params });
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({
        success: false,
        error: { message: "Authentication required." },
      });
      expect(urls.deleteUrl).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid id param", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");

      const req = new NextRequest("http://localhost:3000/api/urls/invalid", {
        method: "DELETE",
      });
      const params = Promise.resolve({ id: "invalid" });

      const res = await DELETE(req, { params });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json).toEqual({
        success: false,
        error: {
          message: "ID must be a positive integer.",
          code: "INVALID_ID",
        },
      });
      expect(urls.deleteUrl).not.toHaveBeenCalled();
    });

    it("returns 200 on success", async () => {
      vi.mocked(auth.getCurrentUserId).mockResolvedValue("user-123");
      vi.mocked(urls.deleteUrl).mockResolvedValueOnce(undefined);

      const req = new NextRequest("http://localhost:3000/api/urls/42", {
        method: "DELETE",
      });
      const params = Promise.resolve({ id: "42" });

      const res = await DELETE(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({
        success: true,
        data: null,
      });
      expect(urls.deleteUrl).toHaveBeenCalledWith(42, "user-123");
    });
  });
});
