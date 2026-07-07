import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    return runtime.engineeringContext.approveEngineeringContext.execute(
      ctx.tenantId,
      (await context.params).projectId,
      ctx.userId
    );
  });
