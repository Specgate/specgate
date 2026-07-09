import type {
  AgentContextRecord,
  GitSyncRecord,
  SpecCodeCheckRecord,
} from "../../domain/entities/agent";
import type { AgentRepositoryPort } from "../../application/ports/agent-repository.port";

type ModelClient<T = Record<string, unknown>> = {
  findMany(args?: unknown): Promise<T[]>;
  findFirst(args?: unknown): Promise<T | null>;
  create(args: unknown): Promise<T>;
};

type PrismaClientShape = {
  specGateAgentContext: ModelClient<AgentContextRecord>;
  gitSyncRecord: ModelClient<GitSyncRecord>;
  specGateSpecCodeCheck: ModelClient<SpecCodeCheckRecord & { mismatchFindingsJson: unknown }>;
};

export class PrismaAgentRepository implements AgentRepositoryPort {
  constructor(private readonly prisma: PrismaClientShape) {}

  async createAgentContext(context: AgentContextRecord) {
    await this.prisma.specGateAgentContext.create({ data: context });
  }
  listAgentContexts(tenantId: string, specId: string) {
    return this.prisma.specGateAgentContext
      .findMany({ where: { tenantId, specId }, orderBy: { createdAt: "desc" } })
      .then((rows) => rows.map(this.mapAgentContext));
  }
  latestAgentContext(tenantId: string, specId: string) {
    return this.prisma.specGateAgentContext
      .findFirst({
        where: { tenantId, specId },
        orderBy: { createdAt: "desc" },
      })
      .then((row) => (row ? this.mapAgentContext(row) : null));
  }
  async createGitSyncRecord(record: GitSyncRecord) {
    await this.prisma.gitSyncRecord.create({ data: record });
  }
  async createSpecCodeCheck(check: SpecCodeCheckRecord) {
    const { mismatchFindings, ...data } = check;
    await this.prisma.specGateSpecCodeCheck.create({
      data: { ...data, mismatchFindingsJson: mismatchFindings },
    });
  }
  latestSpecCodeCheck(tenantId: string, specId: string) {
    return this.prisma.specGateSpecCodeCheck
      .findFirst({
        where: { tenantId, specId },
        orderBy: { createdAt: "desc" },
      })
      .then((row) => (row ? this.mapSpecCodeCheck(row) : null));
  }
  private mapAgentContext(row: AgentContextRecord): AgentContextRecord {
    return row;
  }
  private mapSpecCodeCheck(row: SpecCodeCheckRecord & { mismatchFindingsJson: unknown }): SpecCodeCheckRecord {
    return {
      ...row,
      mismatchFindings: Array.isArray(row.mismatchFindingsJson)
        ? row.mismatchFindingsJson
        : [],
    };
  }
}
