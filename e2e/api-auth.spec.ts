/**
 * Deterministic regression coverage for ROADMAP 6.12 (+ parts of 6.3/6.4):
 * unauthenticated writes are rejected, and ownership mismatches are 404s
 * (never 403 — existence must not leak).
 *
 * NOTE: DELETE on a missing/foreign row returns 404 in the current
 * implementation (see app/api/urls/[id]/route.ts), not the idempotent 200
 * the roadmap text anticipated. The specs below lock the actual behaviour.
 */
import { test, expect } from "@playwright/test";
import {
  uniqueAlias,
  uniqueUrl,
  authedRequest,
  createLinkViaApi,
} from "./support/helpers";
import { testAuth } from "./support/auth-test";

test.describe("unauthenticated", () => {
  test("GET /api/urls returns 401", async ({ request }) => {
    const res = await request.get("/api/urls");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/urls/[id] without a session returns 401", async ({
    request,
  }) => {
    const res = await request.patch("/api/urls/1", {
      data: { newAlias: uniqueAlias() },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/urls/[id] without a session returns 401", async ({
    request,
  }) => {
    const res = await request.delete("/api/urls/1");
    expect(res.status()).toBe(401);
  });
});

test.describe("authenticated", () => {
  test("PATCH/DELETE validation and ownership rules", async ({
    playwright,
  }) => {
    const authed = await authedRequest(playwright);

    const aliasA = uniqueAlias();
    const aliasB = uniqueAlias();
    const linkA = await createLinkViaApi(authed, {
      originalUrl: uniqueUrl(),
      customAlias: aliasA,
    });
    const linkB = await createLinkViaApi(authed, {
      originalUrl: uniqueUrl(),
      customAlias: aliasB,
    });

    // Non-integer id → 400.
    expect(
      (await authed.patch("/api/urls/abc", { data: { newAlias: uniqueAlias() } })).status(),
    ).toBe(400);

    // Invalid alias format → 400.
    expect(
      (await authed.patch(`/api/urls/${linkA.id}`, { data: { newAlias: "ab" } })).status(),
    ).toBe(400);

    // Collision with another owned alias → 409.
    const collision = await authed.patch(`/api/urls/${linkA.id}`, {
      data: { newAlias: aliasB },
    });
    expect(collision.status()).toBe(409);

    // Non-existent id → 404 (not 403, not 200).
    expect(
      (
        await authed.patch("/api/urls/2147483647", {
          data: { newAlias: uniqueAlias() },
        })
      ).status(),
    ).toBe(404);
    expect((await authed.delete("/api/urls/2147483647")).status()).toBe(404);

    // Happy-path rename → 200 with the updated row.
    const renamedTo = uniqueAlias();
    const renamed = await authed.patch(`/api/urls/${linkA.id}`, {
      data: { newAlias: renamedTo },
    });
    expect(renamed.status()).toBe(200);
    expect((await renamed.json()).data.alias).toBe(renamedTo);

    // List-my-links contains what we created.
    const list = await authed.get("/api/urls");
    expect(list.status()).toBe(200);
    const listedAliases: string[] = (await list.json()).data.map(
      (row: { alias: string }) => row.alias,
    );
    expect(listedAliases).toContain(renamedTo);
    expect(listedAliases).toContain(aliasB);

    // Delete own link → 200; deleting again → 404.
    expect((await authed.delete(`/api/urls/${linkA.id}`)).status()).toBe(200);
    expect((await authed.delete(`/api/urls/${linkA.id}`)).status()).toBe(404);
    expect((await authed.delete(`/api/urls/${linkB.id}`)).status()).toBe(200);

    await authed.dispose();
  });

  test("rows owned by another user are invisible (404, not 403)", async ({
    playwright,
  }) => {
    const ctx = await testAuth.$context;
    const t = ctx.test;
    if (!t) throw new Error("testUtils helpers missing.");

    // Second user + a link created under *their* session.
    const other = t.createUser({ email: `e2e-${Date.now()}@example.com` });
    await t.saveUser(other);
    const login = await t.login({ userId: other.id });
    const otherHeaders = Object.fromEntries(login.headers.entries());
    const otherCtx = await playwright.request.newContext({ extraHTTPHeaders: otherHeaders });
    const foreign = await createLinkViaApi(otherCtx, {
      originalUrl: uniqueUrl(),
      customAlias: uniqueAlias(),
    });
    await otherCtx.dispose();

    const authed = await authedRequest(playwright);
    expect(
      (
        await authed.patch(`/api/urls/${foreign.id}`, {
          data: { newAlias: uniqueAlias() },
        })
      ).status(),
    ).toBe(404);
    expect((await authed.delete(`/api/urls/${foreign.id}`)).status()).toBe(404);
    await authed.dispose();

    // Cascade removes the foreign link with its owner.
    await t.deleteUser(other.id);
  });
});
