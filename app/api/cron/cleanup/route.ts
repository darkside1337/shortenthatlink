import { NextRequest } from "next/server";
import { deleteExpiredUrls } from "@/lib/urls";
import { jsonError, jsonSuccess } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return jsonError("Unauthorized.", undefined, 401);
  }

  const count = await deleteExpiredUrls();

  return jsonSuccess({ deleted: count }, 200);
}
