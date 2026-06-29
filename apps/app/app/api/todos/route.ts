import { type NextRequest } from "next/server";
import { CreateTodoInputSchema, TodoListQuerySchema } from "@corely/contracts";
import { createTodoRuntime } from "@/server/todos-runtime";
import { getTenantContext } from "@/server/tenant-context";
import { problemFromError } from "@/server/problem-details";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = getTenantContext(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = TodoListQuerySchema.parse(searchParams);
    const runtime = createTodoRuntime();
    const response = await runtime.listTodos.execute(tenantId, query);

    return Response.json(response);
  } catch (error) {
    return problemFromError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, workspaceId } = getTenantContext(request);
    const body = await request.json();
    const input = CreateTodoInputSchema.parse(body);
    const runtime = createTodoRuntime();
    const response = await runtime.createTodo.execute({
      ...input,
      tenantId,
      workspaceId,
    });

    return Response.json(response, { status: 201 });
  } catch (error) {
    return problemFromError(error);
  }
}
