import type { ImplementationRecord } from "../../domain/entities/implementation";
import type { ImplementationRepositoryPort } from "../../application/ports/implementation-repository.port";

type ModelClient = {
  findFirst(args?: unknown): Promise<Record<string, unknown> | null>;
  create(args: unknown): Promise<Record<string, unknown>>;
  update(args: unknown): Promise<Record<string, unknown>>;
};

export class PrismaImplementationRepository implements ImplementationRepositoryPort {
  constructor(private readonly prisma: { implementationRecord: ModelClient }) {}
  findBySpec(tenantId: string, specId: string) {
    return this.prisma.implementationRecord
      .findFirst({ where: { tenantId, specId } })
      .then((row) => (row ? (row as ImplementationRecord) : null));
  }
  async create(record: ImplementationRecord) {
    await this.prisma.implementationRecord.create({ data: record });
  }
  async updateBySpec(
    tenantId: string,
    specId: string,
    patch: Partial<ImplementationRecord>,
  ) {
    const existing = await this.findBySpec(tenantId, specId);
    if (!existing) return null;
    return this.prisma.implementationRecord
      .update({ where: { id: existing.id }, data: patch })
      .then((row) => row as ImplementationRecord);
  }
}
