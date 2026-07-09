import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string; assetId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId, documentId, assetId } = await params;
    return runtime.documents.deleteDocumentAsset(ctx, projectId, documentId, assetId);
  });
}
