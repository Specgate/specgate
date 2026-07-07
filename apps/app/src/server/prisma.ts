import { PrismaService } from "@corely/data";

declare global {
  var __corelyPrisma: PrismaService | undefined;
}

export function getPrisma() {
  if (!globalThis.__corelyPrisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL must be set before using the SpecGate API");
    }

    globalThis.__corelyPrisma = new PrismaService();
  }

  return globalThis.__corelyPrisma;
}
