// Settings for the automated tests (npm test). They test the business logic
// (pure functions), so they need neither a browser nor a database.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // The same "@/..." imports as in the app.
      "@": path("./"),
      // `import "server-only"` stops server code from reaching the browser.
      // Tests run on the server side anyway, so it's swapped for an empty file.
      "server-only": path("./tests/server-only.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});