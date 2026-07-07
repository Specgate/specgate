import { SpecCopilotActionRequestSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.copilot.proposeChanges(
      ctx.tenantId,
      {
        ...(await readJson(request, SpecCopilotActionRequestSchema.omit({ specId: true }))),
        specId: (await context.params).specId,
      } as any,
      ctx.userId
    ),
  );

