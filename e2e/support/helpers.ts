/**
 * Shared E2E helpers. API setup + UI assertions: specs create their own data
 * via the public API and assert the visible behaviour in the UI.
 *
 * Alias convention: every test-owned alias starts with `tst-` so the sweep
 * action in app/api/test-utils/urls can remove leftovers in one call.
 *
 * NOTE: relative imports only — the Playwright runner does not resolve the
 * `@/` path alias, so nothing in e2e/ may import via `@/...`. All test-only
 * state changes go through the app itself (public API + the env-gated
 * test-utils route), never direct SQL, so specs observe exactly what the
 * server observes.
 */
import path from "node:path";
import { config as loadEnv } from "dotenv";
import type { APIRequestContext } from "@playwright/test";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

export const AUTH_FILE = "e2e/.auth/user.json";

/** Unique, always-valid custom alias (4–52 chars, a-z0-9-, no `--`). */
export function uniqueAlias(prefix = "tst"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${rand}`.toLowerCase();
}

export function uniqueUrl(): string {
  return `https://example.com/e2e/${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export interface CreatedLink {
  id: number;
  alias: string;
  originalUrl: string;
}

/**
 * POST with retries on transient failures ONLY (fetch-level network errors
 * and 5xx, e.g. Neon compute resume after idle). 4xx responses are
 * deterministic application behaviour and return immediately so real app
 * errors surface fast instead of being masked by retries.
 */
async function postWithTransientRetry(
  request: APIRequestContext,
  url: string,
  data: unknown,
) {
  let lastRes: Awaited<ReturnType<APIRequestContext["post"]>> | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    let res;
    try {
      res = await request.post(url, { data });
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((r) => setTimeout(r, 500 * attempt));
      continue;
    }
    if (res.status() < 500) return res;
    lastRes = res;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  if (!lastRes) throw new Error(`${url} gave no response after 3 attempts.`);
  return lastRes;
}

export async function createLinkViaApi(
  request: APIRequestContext,
  input: { originalUrl: string; customAlias?: string; expiresAt?: string },
): Promise<CreatedLink> {
  const res = await postWithTransientRetry(request, "/api/urls", input);
  if (res.status() !== 201) {
    const body = await res.json().catch(() => null);
    throw new Error(
      `createLinkViaApi failed: ${res.status()} ${JSON.stringify(body)} (input=${JSON.stringify(input)})`,
    );
  }
  const { data } = await res.json();
  return { id: data.id, alias: data.alias, originalUrl: data.originalUrl };
}

/** Authenticated API context for the setup user (saved by e2e/auth.setup.ts). */
export async function authedRequest(playwright: {
  request: { newContext(options?: { storageState?: string }): Promise<APIRequestContext> };
}) {
  return playwright.request.newContext({ storageState: AUTH_FILE });
}

async function testUtilsAction(
  request: APIRequestContext,
  action: string,
  alias?: string,
): Promise<Record<string, unknown>> {
  const res = await postWithTransientRetry(request, "/api/test-utils/urls", {
    action,
    alias,
  });
  if (res.status() !== 200) {
    const body = await res.json().catch(() => null);
    throw new Error(
      `test-utils ${action} failed: ${res.status()} ${JSON.stringify(body)} — is E2E_TEST_UTILS=1 set on the dev server?`,
    );
  }
  return (await res.json()).data;
}

/**
 * Backdate a row into the past through the app itself, then poll the public
 * redirect until it 404s — proving the write is visible to the server, not
 * just to our connection.
 *
 * POST /api/urls rejects past expiresAt values (400), so expiry tests create
 * a future-expiring link via the API and then expire it — the equivalent of
 * the manual Neon-console step in ROADMAP 6.9.
 */
export async function expireLinkAndWaitFor404(
  request: APIRequestContext,
  alias: string,
): Promise<void> {
  await testUtilsAction(request, "expire", alias);
  const deadline = Date.now() + 15_000;
  for (;;) {
    const res = await request.get(`/${alias}`, { maxRedirects: 0 });
    if (res.status() === 404) return;
    if (Date.now() > deadline) {
      throw new Error(
        `expireLinkAndWaitFor404: /${alias} still redirects after 15s`,
      );
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

/** Remove one test link (used for explicit per-test cleanup). */
export async function deleteLinkViaTestUtils(
  request: APIRequestContext,
  alias: string,
): Promise<void> {
  await testUtilsAction(request, "delete", alias);
}

/** End-of-run sweep of all E2E data (setup users cascade to their links). */
export async function sweepTestData(
  request: APIRequestContext,
): Promise<{ users: number; urls: number }> {
  const data = await testUtilsAction(request, "sweep");
  return { users: data.users as number, urls: data.urls as number };
}
