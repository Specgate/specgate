import { CommentInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.listComments(ctx, (await context.params).specId),
  );
export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const input = (await readJson(request, CommentInputSchema)) as {
      body: string;
      sectionReference?: string | null;
    };
    return runtime.specs.addComment(ctx, (await context.params).specId, input);
  });
