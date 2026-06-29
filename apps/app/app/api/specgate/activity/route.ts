import { ActivityTypeSchema } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) => {
    const params = new URL(request.url).searchParams;
    const type = params.get("type");
    return runtime.activity.listActivity(ctx.tenantId, {
      projectId: params.get("projectId") || undefined,
      specId: params.get("specId") || undefined,
      type: type ? ActivityTypeSchema.parse(type) : undefined,
    });
  });
