import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@corely/api-client",
    "@corely/contracts",
    "@corely/modules-activity",
    "@corely/modules-agent",
    "@corely/modules-implementation",
    "@corely/modules-planning",
    "@corely/modules-preview",
    "@corely/modules-specs",
  ],
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
};

export default nextConfig;
