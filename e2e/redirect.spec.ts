/**
 * ROADMAP 6.0.2 — redirect and expiry (plus the 6.9 logical-expiry check).
 * Links are created via the public API; the UI assertions cover the redirect
 * behaviour and the 404/expired page.
 */
import { test, expect } from "@playwright/test";
import {
  uniqueAlias,
  uniqueUrl,
  createLinkViaApi,
  expireLinkAndWaitFor404,
} from "./support/helpers";

test("navigating to a valid short URL redirects to the original destination", async ({
  page,
  request,
}) => {
  const created = await createLinkViaApi(request, {
    originalUrl: uniqueUrl(),
    customAlias: uniqueAlias(),
  });

  await page.goto(`/${created.alias}`);
  // page.goto follows the server redirect; we land on the destination.
  await expect.poll(async () => page.url(), { timeout: 15_000 }).toBe(
    created.originalUrl,
  );
});

test("navigating to an unknown alias renders the 404/expired page", async ({
  page,
}) => {
  const response = await page.goto(`/${uniqueAlias("tst-missing")}`);
  // Unknown alias → HTTP 404 (Route Handler serves status only, no UI).
  expect(response).not.toBeNull();
  expect(response?.status()).toBe(404);
});

test("expired link stops redirecting even though the row still exists", async ({
  page,
  request,
}) => {
  const created = await createLinkViaApi(request, {
    originalUrl: uniqueUrl(),
    customAlias: uniqueAlias(),
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  });

  // POST /api/urls rejects past expiresAt (400), so expire the row through
  // the env-gated test-utils route — the equivalent of the manual
  // Neon-console step in ROADMAP 6.9. The helper polls the public redirect
  // until the expiry is visible to the server.
  await expireLinkAndWaitFor404(request, created.alias);

  const response = await page.goto(`/${created.alias}`);
  // Expired alias → HTTP 404, indistinguishable from unknown.
  expect(response).not.toBeNull();
  expect(response?.status()).toBe(404);
});
