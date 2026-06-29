import { SpecUpdateSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.getSpecDetail(ctx, (await context.params).specId),
  );
export const PATCH = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.updateSpec(
      ctx,
      (await context.params).specId,
      await readJson(request, SpecUpdateSchema),
    ),
  );
