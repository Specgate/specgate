import { handleApi } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.activity.listSpecActivity(
      ctx.tenantId,
      (await context.params).specId,
    ),
  );
