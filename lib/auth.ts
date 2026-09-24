import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

import { cache } from "react";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});

export type Session = typeof auth.$Infer.Session;

const getSessionCached = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSessionCached();
  return session?.user.id ?? null;
}

export async function getCurrentUser() {
  const session = await getSessionCached();
  return session?.user ?? null;
}

