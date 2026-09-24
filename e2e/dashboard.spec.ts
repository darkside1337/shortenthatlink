/**
 * ROADMAP 6.0.3 — authenticated dashboard CRUD, signed in via the
 * testUtils-generated storage state (see e2e/auth.setup.ts).
 *
 * Row assertions are scoped to `table tbody`: the mobile card stream stays in
 * the DOM (hidden via CSS), so unscoped text queries would match twice.
 * Aliases from uniqueAlias() share a prefix but always have equal length, so
 * neither is a substring of the other and hasText filters stay exact.
 */
import { test, expect, type Page } from "@playwright/test";
import { AUTH_FILE, uniqueAlias, uniqueUrl } from "./support/helpers";

test.use({ storageState: AUTH_FILE });

function tableBody(page: Page) {
  return page.locator("table tbody");
}

// The empty-state panel renders its own "New Link" button below the header
// one when the user has no links yet — .first() always picks the header.
function newLinkButton(page: Page) {
  return page.getByRole("button", { name: "New Link" }).first();
}

test("dashboard loads and shows the user's links", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "My Links" })).toBeVisible();
  await expect(page.getByText("active links").first()).toBeVisible();
});

test("creating a link via the New Link dialog adds it to the table", async ({
  page,
}) => {
  const alias = uniqueAlias();

  await page.goto("/dashboard");
  await newLinkButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Create New Short Link" }),
  ).toBeVisible();

  await page.getByLabel("Destination URL").fill(uniqueUrl());
  await page.getByLabel("Custom alias (optional)").fill(alias);
  await page.getByRole("button", { name: "Shorten Link" }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(tableBody(page).filter({ hasText: alias })).toHaveCount(1);
});

test("renaming an alias reflects in the row; old alias 404s, new one redirects", async ({
  page,
  request,
}) => {
  const oldAlias = uniqueAlias();
  const newAlias = uniqueAlias();
  const destination = uniqueUrl();

  await page.goto("/dashboard");
  await newLinkButton(page).click();
  await page.getByLabel("Destination URL").fill(destination);
  await page.getByLabel("Custom alias (optional)").fill(oldAlias);
  await page.getByRole("button", { name: "Shorten Link" }).click();
  await expect(tableBody(page).filter({ hasText: oldAlias })).toHaveCount(1);

  await page.getByRole("button", { name: `Manage link ${oldAlias}` }).click();
  await expect(page.getByText("Manage Link —")).toBeVisible();
  await page.getByLabel("Custom alias").fill(newAlias);
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(tableBody(page).filter({ hasText: newAlias })).toHaveCount(1);
  await expect(tableBody(page).filter({ hasText: oldAlias })).toHaveCount(0);

  // ROADMAP 6.7: old alias stops resolving immediately (no redirect chain).
  // Missing and expired aliases are indistinguishable: HTTP 404, no UI.
  const oldResponse = await page.goto(`/${oldAlias}`);
  expect(oldResponse).not.toBeNull();
  expect(oldResponse?.status()).toBe(404);

  const redirected = await request.get(`/${newAlias}`, { maxRedirects: 0 });
  expect([307, 308]).toContain(redirected.status());
  expect(redirected.headers()["location"]).toBe(destination);
});

test("deleting a link removes it from the table and it stops resolving", async ({
  page,
}) => {
  const alias = uniqueAlias();

  await page.goto("/dashboard");
  await newLinkButton(page).click();
  await page.getByLabel("Destination URL").fill(uniqueUrl());
  await page.getByLabel("Custom alias (optional)").fill(alias);
  await page.getByRole("button", { name: "Shorten Link" }).click();
  await expect(tableBody(page).filter({ hasText: alias })).toHaveCount(1);

  await page.getByRole("button", { name: `Delete link ${alias}` }).click();
  await expect(page.getByText("Are you sure?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm Delete" }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(tableBody(page).filter({ hasText: alias })).toHaveCount(0);

  const goneResponse = await page.goto(`/${alias}`);
  expect(goneResponse).not.toBeNull();
  expect(goneResponse?.status()).toBe(404);
});

test.describe("unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("visiting /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Sign in to continue")).toBeVisible();
  });

  test("GET /api/urls without a session returns 401", async ({ request }) => {
    const res = await request.get("/api/urls");
    expect(res.status()).toBe(401);
  });
});
