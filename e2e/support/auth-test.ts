/**
 * Test-only Better Auth instance for E2E (uses the `testUtils` plugin).
 *
 * Mirrors the production config in lib/auth.ts (same Drizzle adapter, same
 * Postgres database) but lives in a separate file so privileged `ctx.test`
 * helpers never ship in the production auth context. See:
 * https://better-auth.com/docs/plugins/test-utils
 *
 * NOTE: relative imports only — the Playwright runner does not resolve the
 * `@/` path alias, so nothing in e2e/ may import via `@/...`.
 */
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { testUtils } from "better-auth/plugins";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../../lib/db/schema";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  throw new Error("e2e/support/auth-test: DATABASE_URL is not set (check .env.local).");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

export const testAuth = betterAuth({
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
  plugins: [testUtils()],
});
