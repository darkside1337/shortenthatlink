import { NextRequest } from "next/server";
import { urlIdSchema, renameAliasSchema } from "@/features/dashboard/schemas";
import { getCurrentUserId } from "@/lib/auth";
import { renameUrlAlias, deleteUrl } from "@/lib/urls";
import { isPgUniqueViolation, jsonError, jsonSuccess } from "@/lib/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return jsonError("Authentication required.", undefined, 401);
  }

  const { id: rawId } = await params;
  const idResult = urlIdSchema.safeParse(rawId);
  if (!idResult.success) {
    return jsonError(idResult.error.issues[0].message, "INVALID_ID", 400);
  }

  const bodyResult = renameAliasSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!bodyResult.success) {
    return jsonError(bodyResult.error.issues[0].message, "INVALID_FORMAT", 400);
  }

  try {
    const updated = await renameUrlAlias(
      idResult.data,
      userId,
      bodyResult.data.newAlias
    );

    if (!updated) {
      return jsonError("Link not found or access denied.", undefined, 404);
    }

    return jsonSuccess(updated, 200);
  } catch (error: unknown) {
    if (isPgUniqueViolation(error)) {
      return jsonError("Alias already taken.", "ALIAS_TAKEN", 409);
    }
    throw error;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return jsonError("Authentication required.", undefined, 401);
  }

  const { id: rawId } = await params;
  const idResult = urlIdSchema.safeParse(rawId);
  if (!idResult.success) {
    return jsonError(idResult.error.issues[0].message, "INVALID_ID", 400);
  }

  await deleteUrl(idResult.data, userId);

  return jsonSuccess(null, 200);
}
