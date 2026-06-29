import { defineConfig } from "@playwright/test";

const apiURL = process.env.API_URL || "http://127.0.0.1:3000";
const databaseURL =
  process.env.DATABASE_URL ||
  "postgresql://corelybase:corelybase@localhost:5434/corelybase";

export default defineConfig({
  testDir: "./tests",
  testMatch: "api.spec.ts",
  fullyParallel: false,
  reporter: [
    ["html", { outputFolder: "playwright-report/api" }],
    ["json", { outputFile: "test-results/api-results.json" }],
    ["junit", { outputFile: "test-results/api-junit.xml" }],
  ],
  use: {
    baseURL: apiURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --dir ../app dev --hostname 127.0.0.1 --port 3000",
    url: `${apiURL}/api/specgate/projects`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: databaseURL,
      DIRECT_DATABASE_URL: databaseURL,
      SPECGATE_DEMO_MODE: "true",
    },
  },
  timeout: 60_000,
});
