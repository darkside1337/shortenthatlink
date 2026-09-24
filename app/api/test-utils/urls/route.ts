import { NextRequest } from "next/server";
import { eq, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { url, user } from "@/lib/db/schema";
import { jsonError, jsonSuccess } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Test-only helpers for the Playwright E2E suite (e2e/).
 *
 * Gated behind `E2E_TEST_UTILS=1`, which is set exclusively by the
 * `webServer` block in playwright.config.ts. Production builds never set it,
 * so every action below returns 404 there. Actions:
 * - `expire` — backdate a row's expiresAt (POST /api/urls rejects past dates,
 *   so tests cannot produce expired rows otherwise).
 * - `delete` / `sweep` — remove test data (`tst-*` aliases, `e2e-*` users).
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" || process.env.E2E_TEST_UTILS !== "1") {
    return jsonError("Not found.", "NOT_FOUND", 404);
  }

  const body: unknown = await request.json().catch(() => null);
  const action =
    typeof body === "object" && body !== null && "action" in body
      ? (body as { action: unknown }).action
      : null;
  const rawAlias =
    typeof body === "object" && body !== null && "alias" in body
      ? (body as { alias: unknown }).alias
      : null;
  const alias =
    typeof rawAlias === "string" && rawAlias.trim() !== ""
      ? rawAlias.toLowerCase()
      : null;

  if (action === "expire") {
    if (!alias) return jsonError("alias is required.", "INVALID_FORMAT", 400);
    const [row] = await db
      .update(url)
      .set({ expiresAt: new Date(Date.now() - 120_000) })
      .where(eq(url.alias, alias))
      .returning({ alias: url.alias, expiresAt: url.expiresAt });
    if (!row) return jsonError("Link not found.", "NOT_FOUND", 404);
    return jsonSuccess(row, 200);
  }

  if (action === "delete") {
    if (!alias) return jsonError("alias is required.", "INVALID_FORMAT", 400);
    const deleted = await db
      .delete(url)
      .where(eq(url.alias, alias))
      .returning({ id: url.id });
    return jsonSuccess({ deleted: deleted.length }, 200);
  }

  if (action === "sweep") {
    const deletedUsers = await db
      .delete(user)
      .where(like(user.email, "e2e-%@example.com"))
      .returning({ id: user.id });
    const deletedUrls = await db
      .delete(url)
      .where(like(url.alias, "tst-%"))
      .returning({ id: url.id });
    return jsonSuccess(
      { users: deletedUsers.length, urls: deletedUrls.length },
      200,
    );
  }

  return jsonError("Unknown action.", "INVALID_FORMAT", 400);
}
