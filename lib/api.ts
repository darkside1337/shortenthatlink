import { NextResponse } from "next/server";

/**
 * Type guard for PostgreSQL unique constraint violation (error code 23505).
 */
export function isPgUniqueViolation(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "23505"
  );
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

