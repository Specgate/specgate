import { handleApi, readJson } from "@/server/specgateApi";
import { LinkSpecGateDocumentToSpecRequestSchema } from "@corely/contracts/specgate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ specId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { specId } = await params;
    const spec = await runtime.specs.getSpecDetail(ctx, specId);
    return runtime.documents.listSpecRelatedDocuments(ctx, spec.data.projectId, specId);
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ specId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { specId } = await params;
    const spec = await runtime.specs.getSpecDetail(ctx, specId);
    const input = await readJson(request, LinkSpecGateDocumentToSpecRequestSchema);
    return runtime.documents.linkDocumentToSpec(ctx, spec.data.projectId, specId, input);
  });
}
