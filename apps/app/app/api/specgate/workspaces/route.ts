import { handleApi } from "@/server/specgateApi";
import { getPrisma } from "@/server/prisma";
import { PrismaWorkspaceRepository } from "@/server/workspaces.repository";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
});

// GET /api/specgate/workspaces — list workspaces for current tenant
export async function GET(request: Request) {
  return handleApi(request, async ({ ctx }) => {
    const repository = new PrismaWorkspaceRepository(getPrisma());
    return { data: await repository.listForTenant(ctx.tenantId) };
  });
}

// POST /api/specgate/workspaces — create a workspace
export async function POST(request: Request) {
  return handleApi(request, async ({ ctx }) => {
    const input = CreateWorkspaceSchema.parse(await request.json().catch(() => ({})));
    const repository = new PrismaWorkspaceRepository(getPrisma());
    return { data: await repository.createForTenant(ctx.tenantId, input.name) };
  });
}
