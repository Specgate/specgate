import { handleApi } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) =>
    runtime.planning.suggestRoadmapPlan(
      ctx,
      new URL(request.url).searchParams.get("projectId") || undefined,
    ),
  );
