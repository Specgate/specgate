import type { ImplementationRecord } from "../../domain/entities/implementation";

export interface ImplementationRepositoryPort {
  findBySpec(
    tenantId: string,
    specId: string,
  ): Promise<ImplementationRecord | null>;
  create(record: ImplementationRecord): Promise<void>;
  updateBySpec(
    tenantId: string,
    specId: string,
    patch: Partial<ImplementationRecord>,
  ): Promise<ImplementationRecord | null>;
}
