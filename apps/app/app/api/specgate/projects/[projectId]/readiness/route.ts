import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const projectId = (await context.params).projectId;
    return runtime.engineeringContext.getAgentReadiness.execute(ctx.tenantId, projectId);
  });
