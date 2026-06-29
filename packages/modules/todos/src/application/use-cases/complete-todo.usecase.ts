import type { TodoDto } from "@corely/contracts";
import type { TodoRepositoryPort } from "../ports/todo-repository.port";
import { TodoNotFoundError } from "../errors";
import { mapTodoToDto } from "../mappers/todo-dto";

export class CompleteTodoUseCase {
  constructor(private readonly repository: TodoRepositoryPort) {}

  async execute(tenantId: string, id: string): Promise<TodoDto> {
    const todo = await this.repository.findById(tenantId, id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }

    todo.complete();
    await this.repository.save(todo);

    return mapTodoToDto(todo);
  }
}
