import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  transpilePackages: [
    "@corely/api-client",
    "@corely/auth-client",
    "@corely/contracts",
    "@corely/data",
    "@corely/modules-activity",
    "@corely/modules-agent",
    "@corely/modules-implementation",
    "@corely/modules-planning",
    "@corely/modules-preview",
    "@corely/modules-specs",
    "@corely/ui",
  ],
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  async rewrites() {
    // The auth client uses apiUrl="" so it calls /auth/* (no /api prefix).
    // Forward those to the actual Next.js route handlers at /api/auth/*.
    return [
      { source: "/auth/:path*", destination: "/api/auth/:path*" },
    ];
  },
};

export default nextConfig;
