import type { TodoDto, UpdateTodoInput } from "@corely/contracts";
import type { TodoRepositoryPort } from "../ports/todo-repository.port";
import { TodoNotFoundError } from "../errors";
import { mapTodoToDto } from "../mappers/todo-dto";
import type { Todo } from "../../domain/todo.entity";

export class UpdateTodoUseCase {
  constructor(private readonly repository: TodoRepositoryPort) {}

  async execute(tenantId: string, id: string, input: UpdateTodoInput): Promise<TodoDto> {
    const todo = await this.repository.findById(tenantId, id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }

    const updateParams: Parameters<Todo["update"]>[0] = {};

    if (input.title !== undefined) {
      updateParams.title = input.title;
    }
    if (input.description !== undefined) {
      updateParams.description = input.description;
    }
    if (input.priority !== undefined) {
      updateParams.priority = input.priority;
    }
    if (input.status !== undefined) {
      updateParams.status = input.status;
    }
    if (input.dueDate !== undefined) {
      updateParams.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    todo.update(updateParams);

    await this.repository.save(todo);

    return mapTodoToDto(todo);
  }
}
