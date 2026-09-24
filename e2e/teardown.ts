/**
 * Cleanup project (teardown): removes all E2E test data through the app's
 * env-gated test-utils route (same-process writes — no stale-connection
 * surprises). Runs after each suite project; safe to run repeatedly.
 */
import { test as cleanup } from "@playwright/test";
import { sweepTestData } from "./support/helpers";

cleanup("remove e2e test data", async ({ request }) => {
  const swept = await sweepTestData(request);
  console.log(`teardown swept users=${swept.users} urls=${swept.urls}`);
});
