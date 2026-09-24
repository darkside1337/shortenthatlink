import { NextRequest } from "next/server";
import { notFound, redirect } from "next/navigation";
import { findUrlByAlias } from "@/lib/urls";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ alias: string }> }
): Promise<void> {
  const { alias } = await params;
  if (!alias) {
    notFound();
    return;
  }

  const row = await findUrlByAlias(alias.toLowerCase());
  if (!row) {
    notFound();
    return;
  }

  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
    notFound();
    return;
  }

  redirect(row.originalUrl);
}
