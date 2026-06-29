import type { TodoListQuery } from "@corely/contracts";
import type { Todo } from "../../domain/todo.entity";

export interface TodoRepositoryPort {
  findById(tenantId: string, id: string): Promise<Todo | null>;
  save(todo: Todo): Promise<void>;
  delete(tenantId: string, id: string): Promise<void>;
  list(tenantId: string, query: TodoListQuery): Promise<{ items: Todo[]; total: number }>;
}
