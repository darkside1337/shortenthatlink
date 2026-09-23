import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./lib/__tests__/setup.ts"],
    // Per-file DOM override: add `// @vitest-environment jsdom` at the top of
    // any test file that needs browser globals (e.g. future component tests).
  },
});
