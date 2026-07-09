import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ specId: string; documentId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { specId, documentId } = await params;
    const spec = await runtime.specs.getSpecDetail(ctx, specId);
    return runtime.documents.unlinkDocumentFromSpec(ctx, spec.data.projectId, specId, documentId);
  });
}
