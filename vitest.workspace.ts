import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/app/vitest.config.ts",
  "packages/auth-client/vitest.config.ts",
  "packages/api-client/vitest.config.ts",
  "packages/contracts/vitest.config.ts",
  "packages/domain/vitest.config.ts",
  "packages/email-templates/vitest.config.ts",
  "packages/kernel/vitest.config.ts",
  "packages/prompts/vitest.config.ts",
]);
