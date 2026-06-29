import { ProjectInputSchema } from "@corely/contracts/specgate";
import { handleApi, readJson } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (request: Request) =>
  handleApi(request, ({ ctx, runtime }) => runtime.specs.listProjects(ctx));
export const POST = (request: Request) =>
  handleApi(request, async ({ ctx, runtime }) =>
    runtime.specs.createProject(
      ctx,
      await readJson(request, ProjectInputSchema),
    ),
  );
