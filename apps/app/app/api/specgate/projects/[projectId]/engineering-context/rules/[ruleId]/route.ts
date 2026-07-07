import { UpdateProjectContextRuleRequest } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = (
  request: Request,
  context: { params: Promise<{ projectId: string, ruleId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const params = await context.params;
    const req = (await request.json().catch(() => ({}))) as UpdateProjectContextRuleRequest;
    req.projectId = params.projectId;
    req.ruleId = params.ruleId;
    return runtime.engineeringContext.updateContextRule.execute(
      ctx.tenantId,
      params.projectId,
      ctx.userId,
      req
    );
  });

export const DELETE = (
  request: Request,
  context: { params: Promise<{ projectId: string, ruleId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const params = await context.params;
    await runtime.engineeringContext.deleteContextRule.execute(
      ctx.tenantId,
      params.projectId,
      params.ruleId,
      ctx.userId
    );
    return { success: true };
  });
