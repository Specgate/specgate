import { ZodError } from "zod";
import { TodoNotFoundError } from "@corely/modules-todos";

export function problemFromError(error: unknown): Response {
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

  if (error instanceof TodoNotFoundError) {
    return Response.json(
      {
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: error.message,
      },
      { status: 404 },
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
