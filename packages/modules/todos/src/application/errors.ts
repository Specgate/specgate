export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with ID ${id} not found`);
    this.name = "TodoNotFoundError";
  }
}
