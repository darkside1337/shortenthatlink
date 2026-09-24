import { and, desc, eq, isNotNull, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { url, type Url } from "@/lib/db/schema";

export interface CreateUrlInput {
  originalUrl: string;
  alias: string;
  isCustomAlias: boolean;
  userId: string | null;
  expiresAt: Date | null;
}

/**
 * Finds a URL row by alias (case-insensitive lookup via lowercase).
 * Returns the matching row or null.
 */
export async function findUrlByAlias(alias: string): Promise<Url | null> {
  const [row] = await db
    .select()
    .from(url)
    .where(eq(url.alias, alias.toLowerCase()))
    .limit(1);

  return row ?? null;
}

/**
 * Inserts a new URL record into the database.
 * Does not catch DB errors — unique constraint violations (e.g. 23505) bubble to caller.
 */
export async function createUrl(input: CreateUrlInput): Promise<Url> {
  const [row] = await db
    .insert(url)
    .values({
      originalUrl: input.originalUrl,
      alias: input.alias.toLowerCase(),
      isCustomAlias: input.isCustomAlias,
      userId: input.userId,
      expiresAt: input.expiresAt,
    })
    .returning();

  return row;
}

/**
 * Renames a URL alias for a specific owner.
 * Enforces ownership inside the WHERE clause (`id = id AND userId = userId`).
 * Sets `isCustomAlias: true` on rename.
 * Returns the updated row or null if not found/unauthorized.
 */
export async function renameUrlAlias(
  id: number,
  userId: string,
  newAlias: string
): Promise<Url | null> {
  const [row] = await db
    .update(url)
    .set({
      alias: newAlias.toLowerCase(),
      isCustomAlias: true,
    })
    .where(and(eq(url.id, id), eq(url.userId, userId)))
    .returning();

  return row ?? null;
}

/**
 * Deletes a URL record for a specific owner.
 * Enforces ownership inside the WHERE clause (`id = id AND userId = userId`).
 * Returns true if a row was deleted, false if not found or unauthorized.
 */
export async function deleteUrl(id: number, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(url)
    .where(and(eq(url.id, id), eq(url.userId, userId)))
    .returning({ id: url.id });

  return deleted.length > 0;
}

/**
 * Lists all URLs belonging to a specific user, ordered newest first.
 */
export async function listUrlsForUser(userId: string): Promise<Url[]> {
  return db
    .select()
    .from(url)
    .where(eq(url.userId, userId))
    .orderBy(desc(url.createdAt));
}

/**
 * Permanently deletes all URLs whose expiration timestamp is in the past.
 * Returns the count of deleted rows.
 */
export async function deleteExpiredUrls(): Promise<number> {
  const deleted = await db
    .delete(url)
    .where(and(isNotNull(url.expiresAt), lt(url.expiresAt, sql`NOW()`)))
    .returning({ id: url.id });

  return deleted.length;
}
