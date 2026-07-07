import { UpsertEngineeringContextRequest } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    return runtime.engineeringContext.getEngineeringContext.execute(
      ctx.tenantId,
      (await context.params).projectId
    );
  });

export const PUT = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const projectId = (await context.params).projectId;
    // Basic validation, trusting the input to match UpsertEngineeringContextRequest
    const req = (await request.json().catch(() => ({}))) as UpsertEngineeringContextRequest;
    req.projectId = projectId; // ensure it matches route
    return runtime.engineeringContext.upsertEngineeringContext.execute(
      ctx.tenantId,
      ctx.userId,
      req
    );
  });
