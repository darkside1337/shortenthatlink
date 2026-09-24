import { NextRequest } from "next/server";
import { createUrlSchema } from "@/features/shortener/schemas";
import { getCurrentUserId } from "@/lib/auth";
import { createUrl, listUrlsForUser } from "@/lib/urls";
import { generateAlias } from "@/lib/alias";
import { isPgUniqueViolation, jsonError, jsonSuccess } from "@/lib/api";

const MAX_COLLISION_RETRIES = 5;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON format.", "INVALID_FORMAT", 400);
  }

  const parsed = createUrlSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0].message, "INVALID_FORMAT", 400);
  }

  if (parsed.data.expiresAt) {
    const expiresTimestamp = new Date(parsed.data.expiresAt).getTime();
    if (expiresTimestamp <= Date.now()) {
      return jsonError("Expiration date must be in the future.", "INVALID_FORMAT", 400);
    }
  }

  // Anonymous creation is a core product feature (PRD §1 & §6):
  // Anyone can shorten links without logging in (userId = null).
  // If a session exists, the link is linked to the authenticated user.
  const userId = await getCurrentUserId();

  if (parsed.data.customAlias) {
    try {
      const created = await createUrl({
        originalUrl: parsed.data.originalUrl,
        alias: parsed.data.customAlias,
        isCustomAlias: true,
        userId,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      });

      return jsonSuccess(
        {
          id: created.id,
          alias: created.alias,
          originalUrl: created.originalUrl,
          expiresAt: created.expiresAt,
          createdAt: created.createdAt,
        },
        201
      );
    } catch (error: unknown) {
      if (isPgUniqueViolation(error)) {
        return jsonError("Alias already taken.", "ALIAS_TAKEN", 409);
      }
      throw error;
    }
  }

  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    try {
      const alias = generateAlias();
      const created = await createUrl({
        originalUrl: parsed.data.originalUrl,
        alias,
        isCustomAlias: false,
        userId,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      });

      return jsonSuccess(
        {
          id: created.id,
          alias: created.alias,
          originalUrl: created.originalUrl,
          expiresAt: created.expiresAt,
          createdAt: created.createdAt,
        },
        201
      );
    } catch (error: unknown) {
      if (isPgUniqueViolation(error)) {
        continue;
      }
      throw error;
    }
  }

  return jsonError("Failed to generate a unique alias.", "ALIAS_COLLISION", 500);
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return jsonError("Authentication required.", undefined, 401);
  }

  const urls = await listUrlsForUser(userId);
  return jsonSuccess(urls, 200);
}
