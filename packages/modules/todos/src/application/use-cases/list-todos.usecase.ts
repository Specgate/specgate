import type { TodoListQuery, TodoListResponse } from "@corely/contracts";
import type { TodoRepositoryPort } from "../ports/todo-repository.port";
import { mapTodoToDto } from "../mappers/todo-dto";

export class ListTodosUseCase {
  constructor(private readonly repository: TodoRepositoryPort) {}

  async execute(tenantId: string, query: TodoListQuery): Promise<TodoListResponse> {
    const { items, total } = await this.repository.list(tenantId, query);
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;

    return {
      items: items.map(mapTodoToDto),
      pageInfo: {
        page,
        pageSize,
        total,
        hasNextPage: page * pageSize < total,
      },
    };
  }
}
