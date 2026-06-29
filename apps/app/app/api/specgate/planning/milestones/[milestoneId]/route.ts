import { MilestoneUpdateSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (
  request: Request,
  context: { params: Promise<{ milestoneId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.getMilestone(ctx, (await context.params).milestoneId),
  );
export const PATCH = (
  request: Request,
  context: { params: Promise<{ milestoneId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.planning.updateMilestone(
      ctx,
      (await context.params).milestoneId,
      await readJson(request, MilestoneUpdateSchema),
    ),
  );
