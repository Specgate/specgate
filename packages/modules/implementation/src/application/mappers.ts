import type { ImplementationRecordDto } from "@corely/contracts/specgate";
import type { ImplementationRecord } from "../domain/entities/implementation";

export const mapImplementation = (
  row: ImplementationRecord,
): ImplementationRecordDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
