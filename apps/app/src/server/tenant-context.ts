import type { NextRequest } from "next/server";
import { verifyJwt } from "./auth";
import { getPrisma } from "./prisma";
import { getDevAuthBypassConfig, isDevAuthBypassEnabled } from "./dev-auth-bypass";

class TenantContextError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "TenantContextError";
    this.status = status;
  }
}

export async function getTenantContext(request: NextRequest) {
  if (isDevAuthBypassEnabled("corely")) {
    const bypassConfig = getDevAuthBypassConfig("corely");
    const tenantId =
      request.headers.get("x-tenant-id") ?? process.env[bypassConfig.tenantFlag];
    if (tenantId) {
      return {
        tenantId,
        workspaceId:
          request.headers.get("x-workspace-id") ??
          process.env[bypassConfig.workspaceFlag ?? ""] ??
          null,
      };
    }
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    throw new TenantContextError(401, "Authentication is required.");
  }

  const payload = await verifyJwt(authorization.slice("Bearer ".length));
  const userId = typeof payload?.sub === "string" ? payload.sub : null;
  const tenantId =
    typeof payload?.tenantId === "string" && payload.tenantId.length > 0
      ? payload.tenantId
      : null;
  if (!userId) {
    throw new TenantContextError(401, "Authentication is required.");
  }
  if (!tenantId) {
    throw new TenantContextError(403, "No active tenant is available for this session.");
  }

  const membership = await getPrisma().membership.findFirst({
    where: { userId, tenantId },
    select: { id: true },
  });
  if (!membership) {
    throw new TenantContextError(403, "You do not have access to this tenant.");
  }

  const workspace = await getPrisma().workspace.findFirst({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return {
    tenantId,
    workspaceId: workspace?.id ?? null,
  };
}
