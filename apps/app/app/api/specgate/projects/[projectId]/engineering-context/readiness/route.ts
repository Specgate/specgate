import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const url = new URL(request.url);
    const specId = url.searchParams.get("specId");
    let specDetails: any = undefined;
    
    if (specId) {
      specDetails = (await runtime.specs.getSpecDetail(ctx, specId)).data;
    }

    return runtime.engineeringContext.getAgentReadiness.execute(
      ctx.tenantId,
      (await context.params).projectId,
      specId || undefined,
      specDetails
    );
  });
