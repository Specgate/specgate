import { ProjectInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) => {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || undefined;
    return runtime.specs.listProjects(ctx, workspaceId);
  });

export const POST = (request: Request) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const input = await readJson(request, ProjectInputSchema);
    if (!input.workspaceId) {
      return Response.json({ error: "workspaceId is required" }, { status: 400 });
    }
    return runtime.specs.createProject(ctx, input);
  });
