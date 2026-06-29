import type { TodoListQuery } from "@corely/contracts";
import { Todo, type TodoPriority, type TodoStatus } from "../domain/todo.entity";
import type { TodoRepositoryPort } from "../application/ports/todo-repository.port";

type TodoPrismaClient = {
  todo: {
    findFirst(args: unknown): Promise<any>;
    upsert(args: unknown): Promise<any>;
    deleteMany(args: unknown): Promise<any>;
    findMany(args: unknown): Promise<any[]>;
    count(args: unknown): Promise<number>;
  };
};

export class PrismaTodoRepository implements TodoRepositoryPort {
  constructor(private readonly prisma: TodoPrismaClient) {}

  async findById(tenantId: string, id: string): Promise<Todo | null> {
    const row = await this.prisma.todo.findFirst({
      where: { id, tenantId },
    });

    return row ? this.mapToEntity(row) : null;
  }

  async save(todo: Todo): Promise<void> {
    await this.prisma.todo.upsert({
      where: { id: todo.id },
      create: {
        id: todo.id,
        tenantId: todo.tenantId,
        workspaceId: todo.workspaceId,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      },
      update: {
        workspaceId: todo.workspaceId,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        dueDate: todo.dueDate,
        updatedAt: todo.updatedAt,
      },
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.todo.deleteMany({
      where: { id, tenantId },
    });
  }

  async list(tenantId: string, query: TodoListQuery): Promise<{ items: Todo[]; total: number }> {
    const { page = 1, pageSize = 50, q, status, priority } = query;
    const skip = (page - 1) * pageSize;

    const where: {
      tenantId: string;
      OR?: Array<{ title?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }>;
      status?: string;
      priority?: string;
    } = { tenantId };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [rows, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.mapToEntity(row)),
      total,
    };
  }

  private mapToEntity(row: {
    id: string;
    tenantId: string;
    workspaceId: string | null;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Todo {
    return new Todo(
      row.id,
      row.tenantId,
      row.workspaceId,
      row.title,
      row.description,
      row.status as TodoStatus,
      row.priority as TodoPriority,
      row.dueDate,
      row.createdAt,
      row.updatedAt
    );
  }
}
