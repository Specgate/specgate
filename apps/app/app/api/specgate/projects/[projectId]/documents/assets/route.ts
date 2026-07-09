import { handleApi } from "@/server/specgateApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return handleApi(request, async ({ ctx, runtime }) => {
    const { projectId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentId = formData.get("documentId") as string | null;
    const altText = formData.get("altText") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      throw new Error("No file provided");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    return runtime.documents.uploadDocumentAsset(
      ctx,
      projectId,
      documentId || null,
      {
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        bytes: buffer,
        altText,
        caption,
      }
    );
  });
}
