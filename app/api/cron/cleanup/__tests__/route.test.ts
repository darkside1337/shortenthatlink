import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { DELETE } from "../route";
import { deleteExpiredUrls } from "@/lib/urls";

vi.mock("@/lib/urls", () => ({
  deleteExpiredUrls: vi.fn(),
}));

describe("DELETE /api/cron/cleanup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: "test-secret" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 when Authorization header is absent", async () => {
    const request = new NextRequest("http://localhost:3000/api/cron/cleanup", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: { message: "Unauthorized." },
    });
    expect(deleteExpiredUrls).not.toHaveBeenCalled();
  });

  it("returns 401 when bearer token does not match process.env.CRON_SECRET", async () => {
    const request = new NextRequest("http://localhost:3000/api/cron/cleanup", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer wrong-secret",
      },
    });

    const response = await DELETE(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: { message: "Unauthorized." },
    });
    expect(deleteExpiredUrls).not.toHaveBeenCalled();
  });

  it("returns 200 with { deleted: count } when token matches", async () => {
    vi.mocked(deleteExpiredUrls).mockResolvedValueOnce(7);

    const request = new NextRequest("http://localhost:3000/api/cron/cleanup", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer test-secret",
      },
    });

    const response = await DELETE(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: { deleted: 7 },
    });
    expect(deleteExpiredUrls).toHaveBeenCalledTimes(1);
  });
});
