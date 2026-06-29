import { randomUUID } from "node:crypto";
import type { CreateTodoInput, TodoDto } from "@corely/contracts";
import { Todo } from "../../domain/todo.entity";
import type { TodoRepositoryPort } from "../ports/todo-repository.port";
import { mapTodoToDto } from "../mappers/todo-dto";

export type CreateTodoParams = CreateTodoInput & {
  tenantId: string;
  workspaceId?: string;
};

export class CreateTodoUseCase {
  constructor(private readonly repository: TodoRepositoryPort) {}

  async execute(params: CreateTodoParams): Promise<TodoDto> {
    const now = new Date();
    const todo = new Todo(
      randomUUID(),
      params.tenantId,
      params.workspaceId || null,
      params.title,
      params.description || null,
      "open",
      params.priority || "medium",
      params.dueDate ? new Date(params.dueDate) : null,
      now,
      now
    );

    await this.repository.save(todo);

    return mapTodoToDto(todo);
  }
}
