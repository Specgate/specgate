import { BuildQueueAssignInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.assignBuildQueueItem(
      ctx,
      (await context.params).itemId,
      (await readJson(request, BuildQueueAssignInputSchema)).assignedTo,
    ),
  );
