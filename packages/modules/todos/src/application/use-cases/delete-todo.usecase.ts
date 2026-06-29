import type { TodoRepositoryPort } from "../ports/todo-repository.port";
import { TodoNotFoundError } from "../errors";

export class DeleteTodoUseCase {
  constructor(private readonly repository: TodoRepositoryPort) {}

  async execute(tenantId: string, id: string): Promise<void> {
    const todo = await this.repository.findById(tenantId, id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }

    await this.repository.delete(tenantId, id);
  }
}
