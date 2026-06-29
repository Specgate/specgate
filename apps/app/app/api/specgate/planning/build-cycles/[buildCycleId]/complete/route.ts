import { handleApi } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (
  request: Request,
  context: { params: Promise<{ buildCycleId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.completeBuildCycle(
      ctx,
      (await context.params).buildCycleId,
    ),
  );
