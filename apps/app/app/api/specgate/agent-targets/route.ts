import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
) =>
  handleApi(request, async ({ runtime }) => {
    const data = await runtime.engineeringContext.listAgentTargets.execute();
    return { data };
  });
