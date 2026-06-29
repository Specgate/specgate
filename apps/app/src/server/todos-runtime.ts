import {
  CompleteTodoUseCase,
  CreateTodoUseCase,
  DeleteTodoUseCase,
  GetTodoUseCase,
  ListTodosUseCase,
  PrismaTodoRepository,
  ReopenTodoUseCase,
  UpdateTodoUseCase,
} from "@corely/modules-todos";
import { getPrisma } from "./prisma";

export function createTodoRuntime() {
  const repository = new PrismaTodoRepository(getPrisma());

  return {
    createTodo: new CreateTodoUseCase(repository),
    listTodos: new ListTodosUseCase(repository),
    getTodo: new GetTodoUseCase(repository),
    updateTodo: new UpdateTodoUseCase(repository),
    deleteTodo: new DeleteTodoUseCase(repository),
    completeTodo: new CompleteTodoUseCase(repository),
    reopenTodo: new ReopenTodoUseCase(repository),
  };
}
