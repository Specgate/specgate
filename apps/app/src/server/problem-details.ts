import { ZodError } from "zod";

export function problemFromError(error: unknown): Response {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    const status = (error as { status: number }).status;
    return Response.json(
      {
        error: {
          type: status === 401 ? "unauthorized" : status === 403 ? "forbidden" : "application",
          code: (error as { code?: string }).code,
          message:
            (error as { publicMessage?: string }).publicMessage ??
            error.message,
        },
      },
      { status },
    );
  }

  if (error instanceof Error && "type" in error) {
    const type = String((error as { type?: string }).type || "internal");
    const statusByType: Record<string, number> = {
      validation: 400,
      unauthorized: 401,
      forbidden: 403,
      not_found: 404,
      conflict: 409,
      user_friendly: 400,
      internal: 500,
    };
    const status = statusByType[type] || 500;
    return Response.json(
      {
        error: {
          type,
          message: error.message,
          details: (error as { details?: unknown }).details,
        },
      },
      { status },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        type: "about:blank",
        title: "Validation failed",
        status: 400,
        detail: error.issues.map((issue) => issue.message).join(", "),
        errors: error.flatten(),
      },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error";

  return Response.json(
    {
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail: message,
    },
    { status: 500 },
  );
}
