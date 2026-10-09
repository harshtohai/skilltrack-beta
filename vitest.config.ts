import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Minimal config so vitest resolves the project's `~/*` → `./src/*` path
// alias (same mapping as tsconfig.json) in tests that import server modules.
export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
});
