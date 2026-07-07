import { routeConfig, handleApi } from "@/server/specgateApi";

export const runtime = routeConfig.runtime;
export const dynamic = routeConfig.dynamic;

// GET /api/specgate/workspaces — list workspaces for current tenant
export async function GET(request: Request) {
  return handleApi(request, async ({ ctx, runtime: _runtime }) => {
    const prisma = (await import("@/server/prisma")).getPrisma();
    const workspaces = await (prisma as any).workspace.findMany({
      where: { tenantId: ctx.tenantId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true, tenantId: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
    return { data: workspaces };
  });
}

// POST /api/specgate/workspaces — create a workspace
export async function POST(request: Request) {
  return handleApi(request, async ({ ctx }) => {
    const body = await request.json().catch(() => ({}));
    const name = (body?.name as string)?.trim();
    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }
    const prisma = (await import("@/server/prisma")).getPrisma();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = new Date();
    const workspace = await (prisma as any).workspace.create({
      data: {
        tenantId: ctx.tenantId,
        name,
        slug: `${slug}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      },
      select: { id: true, tenantId: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
    return { data: workspace };
  });
}
