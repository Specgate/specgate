import { ProjectInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.getProject(ctx, (await context.params).projectId),
  );
export const PATCH = (
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.updateProjectSettings(
      ctx,
      (await context.params).projectId,
      await readJson(request, ProjectInputSchema.partial()),
    ),
  );
