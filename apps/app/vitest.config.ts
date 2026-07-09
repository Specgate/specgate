import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@corely/auth-client": path.resolve(__dirname, "../../packages/auth-client/src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "app/**/*.test.ts"],
  },
});
