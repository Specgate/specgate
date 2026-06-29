import { MoveRoadmapLaneInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const input = await readJson(request, MoveRoadmapLaneInputSchema);
    return runtime.planning.moveItemBetweenRoadmapLanes(
      ctx,
      input.specId,
      input.roadmapLane,
    );
  });
