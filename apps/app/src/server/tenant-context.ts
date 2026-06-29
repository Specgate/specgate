import type { NextRequest } from "next/server";

const FALLBACK_TENANT_ID = process.env.CORELY_DEV_TENANT_ID || "dev-tenant";
const FALLBACK_WORKSPACE_ID = process.env.CORELY_DEV_WORKSPACE_ID || null;

export function getTenantContext(request: NextRequest) {
  return {
    tenantId: request.headers.get("x-tenant-id") || FALLBACK_TENANT_ID,
    workspaceId: request.headers.get("x-workspace-id") || FALLBACK_WORKSPACE_ID,
  };
}
