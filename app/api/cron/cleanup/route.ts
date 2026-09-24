import { NextRequest } from "next/server";
import { deleteExpiredUrls } from "@/lib/urls";
import { jsonError, jsonSuccess } from "@/lib/api";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const actual = Buffer.from(authHeader);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function handleCleanup(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized.", undefined, 401);
  }

  try {
    const count = await deleteExpiredUrls();
    return jsonSuccess({ deleted: count }, 200);
  } catch (error) {
    console.error("[CRON_CLEANUP_ERROR]", error);
    return jsonError("Cleanup job failed.", undefined, 500);
  }
}

export const GET = handleCleanup;
export const DELETE = handleCleanup;

