import { handleApi } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) =>
    runtime.planning.listBuildQueue(
      ctx,
      new URL(request.url).searchParams.get("projectId") || undefined,
    ),
  );
