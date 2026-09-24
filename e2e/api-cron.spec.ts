/**
 * ROADMAP 6.10–6.11 — cron cleanup authorisation and behaviour.
 * An expired row is created via the API, expired through the env-gated
 * test-utils route, then purged through the cron endpoint.
 */
import { test, expect } from "@playwright/test";
import {
  uniqueAlias,
  uniqueUrl,
  createLinkViaApi,
  expireLinkAndWaitFor404,
} from "./support/helpers";

function cronSecret(): string {
  const secret = process.env.CRON_SECRET;
  test.skip(!secret, "CRON_SECRET is not set — skipping cron specs.");
  return secret as string;
}

test("DELETE without the cron secret returns 401", async ({ request }) => {
  cronSecret();
  expect((await request.delete("/api/cron/cleanup")).status()).toBe(401);
});

test("DELETE with a wrong secret returns 401", async ({ request }) => {
  cronSecret();
  expect(
    (
      await request.delete("/api/cron/cleanup", {
        headers: { authorization: "Bearer wrong-secret" },
      })
    ).status(),
  ).toBe(401);
});

test("DELETE with the secret purges expired rows and reports the count", async ({
  page,
  request,
}) => {
  const secret = cronSecret();
  const alias = uniqueAlias();

  await createLinkViaApi(request, {
    originalUrl: uniqueUrl(),
    customAlias: alias,
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  });
  await expireLinkAndWaitFor404(request, alias);

  const res = await request.delete("/api/cron/cleanup", {
    headers: { authorization: `Bearer ${secret}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data.deleted).toBeGreaterThanOrEqual(1);

  // Physically deleted: the alias now 404s.
  const goneResponse = await page.goto(`/${alias}`);
  expect(goneResponse).not.toBeNull();
  expect(goneResponse?.status()).toBe(404);
});
