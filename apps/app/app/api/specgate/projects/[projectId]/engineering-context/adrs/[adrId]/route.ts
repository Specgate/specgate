import { UpdateProjectAdrRequest } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = (
  request: Request,
  context: { params: Promise<{ projectId: string, adrId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const params = await context.params;
    const req = (await request.json().catch(() => ({}))) as UpdateProjectAdrRequest;
    req.projectId = params.projectId;
    req.adrId = params.adrId;
    return runtime.engineeringContext.updateAdr.execute(
      ctx.tenantId,
      params.projectId,
      ctx.userId,
      req
    );
  });
