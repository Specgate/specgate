import { ApplySpecCopilotProposalRequestSchema, SpecCopilotProposalSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) => {
    const body = await request.json().catch(() => ({}));
    const applyRequest = ApplySpecCopilotProposalRequestSchema.omit({ specId: true }).parse(body.request);
    const proposal = SpecCopilotProposalSchema.parse(body.proposal);
    
    await runtime.copilot.applyProposal(
      ctx.tenantId,
      {
        ...applyRequest,
        specId: (await context.params).specId,
      } as any,
      proposal,
      ctx.userId
    );
    return { success: true };
  });

