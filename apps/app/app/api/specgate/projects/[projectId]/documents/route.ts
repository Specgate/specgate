import { handleApi, readJson } from "@/server/specgateApi";
import { CreateSpecGateDocumentRequestSchema } from "@corely/contracts/specgate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId } = await params;
    const url = new URL(request.url);
    return runtime.documents.listDocuments(ctx, projectId, {
      type: (url.searchParams.get("type") as any) || undefined,
      status: (url.searchParams.get("status") as any) || undefined,
      tag: url.searchParams.get("tag") || undefined,
      query: url.searchParams.get("query") || undefined,
    });
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId } = await params;
    const input = await readJson(request, CreateSpecGateDocumentRequestSchema);
    return runtime.documents.createDocument(ctx, projectId, input);
  });
}
