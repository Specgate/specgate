import { BuildCycleInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) =>
    runtime.planning.listBuildCycles(
      ctx,
      new URL(request.url).searchParams.get("projectId") || undefined,
    ),
  );
export const POST = (request: Request) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.createBuildCycle(
      ctx,
      await readJson(request, BuildCycleInputSchema),
    ),
  );
