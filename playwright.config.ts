import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// E2E workers and the dev-server under test need the same secrets as local
// dev (DATABASE_URL for test-only auth/DB helpers, CRON_SECRET for the cron
// spec). Next.js loads .env.local itself; Playwright does not, so load it
// here (inherited by workers) and defensively in e2e/support/*.ts.
loadEnv({ path: ".env.local" });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // 1 local retry: link creation/redirect hits Neon over the network and the
  // free-tier compute can cold-start mid-suite (observed as transient 500s).
  // Unit/integration suites remain the deterministic logic gate.
  retries: process.env.CI ? 2 : 1,
  // Capped at 2: the Neon serverless DB cold-starts after idle and a wide
  // parallel burst turns resume latency into transport failures. Fewer
  // workers keep the suite fast enough while taming the connection storm.
  workers: 2,
  use: {
    baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Enables the env-gated test helpers in app/api/test-utils/*.
    // Never set in production builds, where those routes return 404.
    env: { ...process.env, E2E_TEST_UTILS: "1" },
  },
  projects: [
    // Creates the test-only user via better-auth testUtils and saves the
    // signed-in browser state to e2e/.auth/user.json (see e2e/auth.setup.ts).
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      teardown: "cleanup",
      testMatch: /(home|redirect|dashboard)\.spec\.ts/,
    },
    {
      name: "api",
      dependencies: ["setup"],
      teardown: "cleanup",
      testMatch: /api-.*\.spec\.ts/,
    },
    // Deletes the setup user (cascades to its Url rows) and sweeps any
    // leftover tst-* aliases. Idempotent — safe to run after both suites.
    { name: "cleanup", testMatch: /teardown\.ts/ },
  ],
});
