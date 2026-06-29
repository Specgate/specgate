import type { TodoDto } from "@corely/contracts";
import type { Todo } from "../../domain/todo.entity";

export function mapTodoToDto(todo: Todo): TodoDto {
  return {
    id: todo.id,
    tenantId: todo.tenantId,
    workspaceId: todo.workspaceId || undefined,
    title: todo.title,
    description: todo.description,
    status: todo.status,
    priority: todo.priority,
    dueDate: todo.dueDate?.toISOString() || null,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}
