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

/**
 * Standard JSON error response helper.
 */
export function jsonError(message: string, code?: string, status = 400) {
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
