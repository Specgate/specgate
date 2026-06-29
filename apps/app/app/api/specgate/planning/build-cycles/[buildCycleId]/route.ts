import { BuildCycleUpdateSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (
  request: Request,
  context: { params: Promise<{ buildCycleId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.getBuildCycle(ctx, (await context.params).buildCycleId),
  );
export const PATCH = (
  request: Request,
  context: { params: Promise<{ buildCycleId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.updateBuildCycle(
      ctx,
      (await context.params).buildCycleId,
      await readJson(request, BuildCycleUpdateSchema),
    ),
  );
