import { CreateProjectContextRuleRequest } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const projectId = (await context.params).projectId;
    const req = (await request.json().catch(() => ({}))) as CreateProjectContextRuleRequest;
    req.projectId = projectId;
    return runtime.engineeringContext.createContextRule.execute(
      ctx.tenantId,
      projectId,
      ctx.userId,
      req
    );
  });
