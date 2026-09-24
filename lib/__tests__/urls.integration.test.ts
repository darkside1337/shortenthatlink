import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { db } from "@/lib/db";
import { url, user } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import {
  createUrl,
  findUrlByAlias,
  renameUrlAlias,
  deleteUrl,
  listUrlsForUser,
  deleteExpiredUrls,
} from "@/lib/urls";

describe("lib/urls.ts Database Integration Tests", () => {
  const testUserId1 = `test-user-${Date.now()}-1`;
  const testUserId2 = `test-user-${Date.now()}-2`;
  const createdUrlIds: number[] = [];

  beforeAll(async () => {
    // Insert test users
    await db.insert(user).values([
      {
        id: testUserId1,
        name: "Test User 1",
        email: `${testUserId1}@example.com`,
      },
      {
        id: testUserId2,
        name: "Test User 2",
        email: `${testUserId2}@example.com`,
      },
    ]);
  });

  afterAll(async () => {
    // Clean up test urls if any remain
    if (createdUrlIds.length > 0) {
      await db.delete(url).where(inArray(url.id, createdUrlIds));
    }
    // Clean up test users
    await db.delete(user).where(inArray(user.id, [testUserId1, testUserId2]));
  });

  it("createUrl creates anonymous and user-owned URLs with lowercase alias", async () => {
    const alias1 = `test-anon-${Date.now()}`.slice(0, 50);
    const created1 = await createUrl({
      originalUrl: "https://example.com/anon",
      alias: alias1.toUpperCase(),
      isCustomAlias: false,
      userId: null,
      expiresAt: null,
    });

    createdUrlIds.push(created1.id);
    expect(created1.id).toBeDefined();
    expect(created1.alias).toBe(alias1.toLowerCase());
    expect(created1.originalUrl).toBe("https://example.com/anon");
    expect(created1.isCustomAlias).toBe(false);
    expect(created1.userId).toBeNull();
    expect(created1.expiresAt).toBeNull();

    const alias2 = `test-user-${Date.now()}`.slice(0, 50);
    const created2 = await createUrl({
      originalUrl: "https://example.com/user",
      alias: alias2,
      isCustomAlias: true,
      userId: testUserId1,
      expiresAt: new Date(Date.now() + 86400000),
    });

    createdUrlIds.push(created2.id);
    expect(created2.userId).toBe(testUserId1);
    expect(created2.isCustomAlias).toBe(true);
    expect(created2.expiresAt).toBeInstanceOf(Date);
  });

  it("findUrlByAlias retrieves URLs case-insensitively", async () => {
    const alias = `test-find-${Date.now()}`.slice(0, 50);
    const created = await createUrl({
      originalUrl: "https://example.com/find",
      alias: alias,
      isCustomAlias: false,
      userId: null,
      expiresAt: null,
    });
    createdUrlIds.push(created.id);

    // Exact lowercase
    const foundExact = await findUrlByAlias(alias.toLowerCase());
    expect(foundExact).not.toBeNull();
    expect(foundExact?.id).toBe(created.id);

    // Uppercase lookup
    const foundUpper = await findUrlByAlias(alias.toUpperCase());
    expect(foundUpper).not.toBeNull();
    expect(foundUpper?.id).toBe(created.id);

    // Non-existent
    const notFound = await findUrlByAlias("non-existent-alias-999");
    expect(notFound).toBeNull();
  });

  it("renameUrlAlias updates alias and sets isCustomAlias: true only for owner", async () => {
    const initialAlias = `test-rename-init-${Date.now()}`.slice(0, 50);
    const created = await createUrl({
      originalUrl: "https://example.com/rename",
      alias: initialAlias,
      isCustomAlias: false,
      userId: testUserId1,
      expiresAt: null,
    });
    createdUrlIds.push(created.id);

    const newAlias = `test-rename-new-${Date.now()}`.slice(0, 50);

    // Mismatched user cannot rename (returns null - 404 behavior)
    const unauthorizedRename = await renameUrlAlias(created.id, testUserId2, newAlias);
    expect(unauthorizedRename).toBeNull();

    // Owner can rename
    const authorizedRename = await renameUrlAlias(created.id, testUserId1, newAlias.toUpperCase());
    expect(authorizedRename).not.toBeNull();
    expect(authorizedRename?.alias).toBe(newAlias.toLowerCase());
    expect(authorizedRename?.isCustomAlias).toBe(true);

    // Verify DB state
    const fetched = await findUrlByAlias(newAlias);
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.isCustomAlias).toBe(true);
  });

  it("listUrlsForUser returns only the user's URLs ordered newest first", async () => {
    const u1Alias1 = `u1-a-${Date.now()}`.slice(0, 50);
    const u1Alias2 = `u1-b-${Date.now()}`.slice(0, 50);
    const u2Alias = `u2-a-${Date.now()}`.slice(0, 50);

    const link1 = await createUrl({
      originalUrl: "https://example.com/1",
      alias: u1Alias1,
      isCustomAlias: false,
      userId: testUserId1,
      expiresAt: null,
    });
    createdUrlIds.push(link1.id);

    const link2 = await createUrl({
      originalUrl: "https://example.com/2",
      alias: u1Alias2,
      isCustomAlias: false,
      userId: testUserId1,
      expiresAt: null,
    });
    createdUrlIds.push(link2.id);

    const link3 = await createUrl({
      originalUrl: "https://example.com/3",
      alias: u2Alias,
      isCustomAlias: false,
      userId: testUserId2,
      expiresAt: null,
    });
    createdUrlIds.push(link3.id);

    const user1Links = await listUrlsForUser(testUserId1);
    expect(user1Links.length).toBeGreaterThanOrEqual(2);
    expect(user1Links.every((l) => l.userId === testUserId1)).toBe(true);

    // Link 2 was created after Link 1, so should appear first
    const l1Idx = user1Links.findIndex((l) => l.id === link1.id);
    const l2Idx = user1Links.findIndex((l) => l.id === link2.id);
    expect(l2Idx).toBeLessThan(l1Idx);
  });

  it("deleteUrl deletes only when owner matches", async () => {
    const alias = `test-delete-${Date.now()}`.slice(0, 50);
    const created = await createUrl({
      originalUrl: "https://example.com/delete",
      alias,
      isCustomAlias: false,
      userId: testUserId1,
      expiresAt: null,
    });
    createdUrlIds.push(created.id);

    // Attempt delete by non-owner: should not delete
    await deleteUrl(created.id, testUserId2);
    const stillThere = await findUrlByAlias(alias);
    expect(stillThere).not.toBeNull();

    // Delete by owner: succeeds
    await deleteUrl(created.id, testUserId1);
    const nowDeleted = await findUrlByAlias(alias);
    expect(nowDeleted).toBeNull();
  });

  it("deleteExpiredUrls cleans up only expired rows", async () => {
    const expiredAlias = `exp-past-${Date.now()}`.slice(0, 50);
    const futureAlias = `exp-future-${Date.now()}`.slice(0, 50);

    const expiredLink = await createUrl({
      originalUrl: "https://example.com/past",
      alias: expiredAlias,
      isCustomAlias: false,
      userId: null,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
    });
    createdUrlIds.push(expiredLink.id);

    const futureLink = await createUrl({
      originalUrl: "https://example.com/future",
      alias: futureAlias,
      isCustomAlias: false,
      userId: null,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour in future
    });
    createdUrlIds.push(futureLink.id);

    const deletedCount = await deleteExpiredUrls();
    expect(deletedCount).toBeGreaterThanOrEqual(1);

    // Expired link is physically deleted
    const checkExpired = await findUrlByAlias(expiredAlias);
    expect(checkExpired).toBeNull();

    // Future link still exists
    const checkFuture = await findUrlByAlias(futureAlias);
    expect(checkFuture).not.toBeNull();
    expect(checkFuture?.id).toBe(futureLink.id);
  });
});
