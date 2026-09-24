import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("proxy.ts Route Protection", () => {
  it("redirects unauthenticated requests to /login", () => {
    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows requests with standard better-auth session cookie", () => {
    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "better-auth.session_token=test-session-token-123",
      },
    });
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("allows requests with __Secure- session cookie (production HTTPS)", () => {
    const request = new NextRequest("http://localhost:3000/dashboard/settings", {
      headers: {
        cookie: "__Secure-better-auth.session_token=test-secure-token-456",
      },
    });
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
  });
});
