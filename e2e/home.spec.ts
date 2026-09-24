/**
 * ROADMAP 6.0.1 — anonymous shortener flow on `/`.
 * Runs without authentication (no storageState).
 *
 * The error box is scoped to the form: Next's `#__next-route-announcer__`
 * also carries role="alert", so unscoped alert queries are ambiguous.
 */
import { test, expect } from "@playwright/test";
import { uniqueAlias, uniqueUrl, createLinkViaApi } from "./support/helpers";

test("anonymous user can shorten a URL and sees the result card", async ({
  page,
}) => {
  await page.goto("/");

  const responsePromise = page.waitForResponse(
    (r) => r.url().endsWith("/api/urls") && r.request().method() === "POST",
  );
  await page.getByLabel("URL to shorten").fill(uniqueUrl());
  await page.getByRole("button", { name: "Shorten", exact: true }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const { data } = await response.json();

  await expect(page.getByText("Link Created Successfully")).toBeVisible();
  // Result card shows the short link including the alias and offers
  // Copy + Shorten another.
  await expect(page.getByText(data.alias).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy", exact: true })).toBeVisible();
});

test("invalid custom alias format shows an inline validation error", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("URL to shorten").fill(uniqueUrl());
  await page.getByRole("button", { name: "Advanced options" }).click();
  await page.getByLabel("Custom alias (optional)").fill("ab");
  await page.getByRole("button", { name: "Shorten", exact: true }).click();

  const alert = page.locator("form").getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("4–52");
  // No result card on validation failure.
  await expect(page.getByText("Link Created Successfully")).toBeHidden();
});

test("reusing a custom alias shows an inline ALIAS_TAKEN error", async ({
  page,
  request,
}) => {
  const alias = uniqueAlias();
  await createLinkViaApi(request, {
    originalUrl: uniqueUrl(),
    customAlias: alias,
  });

  await page.goto("/");
  await page.getByLabel("URL to shorten").fill(uniqueUrl());
  await page.getByRole("button", { name: "Advanced options" }).click();
  await page.getByLabel("Custom alias (optional)").fill(alias);
  await page.getByRole("button", { name: "Shorten", exact: true }).click();

  const alert = page.locator("form").getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("already taken");
});
