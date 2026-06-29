import { ValidationError } from "@corely/modules-specs";
import { createRuntime, getDemoRequestContext } from "@/server/specgate";
import { problemFromError } from "@/server/problem-details";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) => {
  try {
    const ctx = getDemoRequestContext(request);
    const runtime = createRuntime();
    return Response.json(
      await runtime.specs.listSpecAssets(ctx, (await context.params).specId),
    );
  } catch (error) {
    return problemFromError(error);
  }
};

export const POST = async (
  request: Request,
  context: { params: Promise<{ specId: string }> },
) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ValidationError("Image file is required.");
    }

    const ctx = getDemoRequestContext(request);
    const runtime = createRuntime();
    return Response.json(
      await runtime.specs.uploadSpecImage(ctx, (await context.params).specId, {
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        bytes: Buffer.from(await file.arrayBuffer()),
        altText: String(formData.get("altText") || "").trim() || null,
        caption: String(formData.get("caption") || "").trim() || null,
      }),
    );
  } catch (error) {
    return problemFromError(error);
  }
};
