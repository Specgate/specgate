import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const specId = (await context.params).specId;
    const specDetails = (await runtime.specs.getSpecDetail(ctx, specId)).data;
    if (!specDetails) {
      throw new Error("Spec not found");
    }
    return runtime.engineeringContext.getAgentReadiness.execute(
      ctx.tenantId, 
      specDetails.projectId, 
      specId, 
      specDetails
    );
  });
