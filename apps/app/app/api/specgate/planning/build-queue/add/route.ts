import { BuildQueueAddInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const input = await readJson(request, BuildQueueAddInputSchema);
    return runtime.planning.addApprovedSpecToBuildQueue(
      ctx,
      input.specId,
      input.priorityRank,
    );
  });
