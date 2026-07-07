import { GenerateSpecAgentContextRequest } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const specId = (await context.params).specId;
    const req = (await request.json().catch(() => ({}))) as GenerateSpecAgentContextRequest;

    const specDetails = (await runtime.specs.getSpecDetail(ctx, specId)).data;
    if (!specDetails) {
      throw new Error("Spec not found");
    }

    return runtime.engineeringContext.generateSpecAgentContext.execute(
      ctx.tenantId,
      ctx.userId,
      specDetails.projectId,
      specId,
      req.targetAgentId,
      specDetails
    );
  });
