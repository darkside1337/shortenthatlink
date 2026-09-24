/**
 * Setup project: creates the E2E user via better-auth testUtils, injects the
 * session cookies into the browser, smoke-checks /dashboard, and saves the
 * signed-in storage state for the UI/API suites.
 *
 * No OAuth clicking, no manual codegen — see
 * https://better-auth.com/docs/plugins/test-utils
 */
import { test as setup, expect } from "@playwright/test";
import { testAuth } from "./support/auth-test";
import { AUTH_FILE, sweepTestData } from "./support/helpers";

setup("authenticate via testUtils", async ({ page, context, request }) => {
  // Clean slate in case a previous run was interrupted mid-suite.
  await sweepTestData(request);

  const ctx = await testAuth.$context;
  const t = ctx.test;
  if (!t) throw new Error("testUtils helpers missing — is testUtils() in plugins?");

  const email = `e2e-${Date.now()}@example.com`;
  const user = t.createUser({ email, name: "E2E User" });
  await t.saveUser(user);

  const cookies = await t.getCookies({ userId: user.id, domain: "localhost" });
  await context.addCookies(cookies);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "My Links" })).toBeVisible();

  await context.storageState({ path: AUTH_FILE });
});
