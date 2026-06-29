import { DecisionInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.listDecisions(ctx, (await context.params).specId),
  );
export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const input = (await readJson(request, DecisionInputSchema)) as {
      question: string;
      decision: string;
    };
    return runtime.specs.addDecision(ctx, (await context.params).specId, input);
  });
