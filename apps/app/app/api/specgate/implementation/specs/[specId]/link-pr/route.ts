import { ImplementationPullRequestInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.implementation.linkPullRequest(
      ctx,
      (await context.params).specId,
      (await readJson(request, ImplementationPullRequestInputSchema))
        .pullRequestUrl,
    ),
  );
