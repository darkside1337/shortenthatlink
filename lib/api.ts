import { NextResponse } from "next/server";

/**
 * Type guard for PostgreSQL unique constraint violation (error code 23505).
 *
 * Drizzle wraps driver errors (`Failed query: ...`), nesting the original PG
 * error — which carries `.code` — under `.cause`. Unit-test mocks tend to use
 * a flat `{ code: "23505" }` shape, so both are accepted (cause is followed
 * recursively, since wrappers can nest).
 */
export function isPgUniqueViolation(err: unknown): err is { code: string } {
  if (typeof err !== "object" || err === null) return false;
  if ("code" in err && (err as { code: unknown }).code === "23505") return true;
  if ("cause" in err) {
    return isPgUniqueViolation((err as { cause: unknown }).cause);
  }
  return false;
}

export type ApiErrorCode =
  | "INVALID_FORMAT"
  | "INVALID_ID"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "ALIAS_TAKEN"
  | "ALIAS_COLLISION"
  | "INTERNAL_ERROR";

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: ApiErrorCode } };

/**
 * Standard JSON error response helper.
 */
export function jsonError(message: string, code?: ApiErrorCode, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(code ? { code } : {}),
      },
    },
    { status }
  );
}

/**
 * Standard JSON success response helper.
 */
export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

