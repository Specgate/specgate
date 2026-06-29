import { BuildCycleSpecInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (
  request: Request,
  context: { params: Promise<{ buildCycleId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.removeSpecFromBuildCycle(
      ctx,
      (await context.params).buildCycleId,
      (await readJson(request, BuildCycleSpecInputSchema)).specId,
    ),
  );
