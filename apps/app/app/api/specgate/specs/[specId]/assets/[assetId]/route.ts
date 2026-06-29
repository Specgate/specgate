import { SpecAssetMetadataInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = (
  request: Request,
  context: { params: Promise<{ specId: string; assetId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.updateSpecAssetMetadata(
      ctx,
      (await context.params).assetId,
      await readJson(request, SpecAssetMetadataInputSchema),
    ),
  );

export const DELETE = (
  request: Request,
  context: { params: Promise<{ specId: string; assetId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.deleteSpecAsset(ctx, (await context.params).assetId),
  );
