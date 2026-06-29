import type {
  AgentContextDto,
  GitSyncRecordDto,
  SpecCodeCheckDto,
} from "@corely/contracts/specgate";
import type {
  AgentContextRecord,
  GitSyncRecord,
  SpecCodeCheckRecord,
} from "../domain/entities/agent";

export const mapAgentContext = (row: AgentContextRecord): AgentContextDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

export const mapGitSyncRecord = (row: GitSyncRecord): GitSyncRecordDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

export const mapSpecCodeCheck = (
  row: SpecCodeCheckRecord,
): SpecCodeCheckDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});
