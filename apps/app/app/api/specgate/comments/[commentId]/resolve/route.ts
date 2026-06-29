import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (
  request: Request,
  context: { params: Promise<{ commentId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.resolveComment(ctx, (await context.params).commentId),
  );
