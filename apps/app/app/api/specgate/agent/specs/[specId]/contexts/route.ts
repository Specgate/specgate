import { AgentContextInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.agent.listAgentContexts(ctx, (await context.params).specId),
  );
export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.agent.generateAgentContext(
      ctx,
      (await context.params).specId,
      (await readJson(request, AgentContextInputSchema)).targetAgent,
    ),
  );
