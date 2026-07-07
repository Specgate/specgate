import { SpecListQuerySchema } from "@corely/contracts/specgate";
import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) =>
    runtime.specs.listSpecSummaries(
      ctx,
      SpecListQuerySchema.parse(
        Object.fromEntries(new URL(request.url).searchParams.entries()),
      ),
    ),
  );
