import { handleApi, readJson } from "@/server/specgateApi";
import { UpdateSpecGateDocumentRequestSchema } from "@corely/contracts/specgate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId, documentId } = await params;
    return runtime.documents.getDocument(ctx, projectId, documentId);
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId, documentId } = await params;
    const input = await readJson(request, UpdateSpecGateDocumentRequestSchema);
    return runtime.documents.updateDocument(ctx, projectId, documentId, input);
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId, documentId } = await params;
    return runtime.documents.deleteDocument(ctx, projectId, documentId);
  });
}
