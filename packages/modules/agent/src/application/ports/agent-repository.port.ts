import type {
  AgentContextRecord,
  GitSyncRecord,
  SpecCodeCheckRecord,
} from "../../domain/entities/agent";

export interface AgentRepositoryPort {
  createAgentContext(context: AgentContextRecord): Promise<void>;
  listAgentContexts(
    tenantId: string,
    specId: string,
  ): Promise<AgentContextRecord[]>;
  latestAgentContext(
    tenantId: string,
    specId: string,
  ): Promise<AgentContextRecord | null>;
  createGitSyncRecord(record: GitSyncRecord): Promise<void>;
  createSpecCodeCheck(check: SpecCodeCheckRecord): Promise<void>;
  latestSpecCodeCheck(
    tenantId: string,
    specId: string,
  ): Promise<SpecCodeCheckRecord | null>;
}
