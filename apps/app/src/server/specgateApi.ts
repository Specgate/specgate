import { ZodError, type z } from "zod";
import { createRuntime, getRequestContext } from "./specgate";
import { problemFromError } from "./problem-details";

export const routeConfig = {
  runtime: "nodejs",
  dynamic: "force-dynamic",
} as const;

export async function readJson<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  const body = await request.json().catch(() => ({}));
  return schema.parse(body);
}

export async function handleApi(
  request: Request,
  handler: (args: {
    ctx: Awaited<ReturnType<typeof getRequestContext>>;
    runtime: ReturnType<typeof createRuntime>;
  }) => Promise<unknown>,
) {
  try {
    const ctx = await getRequestContext(request);
    const runtime = createRuntime();
    return Response.json(await handler({ ctx, runtime }));
  } catch (error) {
    return problemFromError(error instanceof ZodError ? error : error);
  }
}
