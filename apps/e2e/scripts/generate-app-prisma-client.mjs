import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../../..");
const sourceSchemaDir = resolve(repoRoot, "packages/data/prisma/schema");
const appSchemaDir = resolve(repoRoot, "apps/app/.prisma-schema");

rmSync(appSchemaDir, { recursive: true, force: true });
mkdirSync(appSchemaDir, { recursive: true });
cpSync(sourceSchemaDir, appSchemaDir, { recursive: true });
