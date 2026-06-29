import { PreviewUrlInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const input = await readJson(request, PreviewUrlInputSchema);
    return runtime.preview.addPreviewUrl(
      ctx,
      (await context.params).specId,
      input.previewUrl,
      input.environment,
    );
  });
