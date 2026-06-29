import type {
  AgentContextRecord,
  GitSyncRecord,
  SpecCodeCheckRecord,
} from "../../domain/entities/agent";
import type { AgentRepositoryPort } from "../../application/ports/agent-repository.port";

type ModelClient = {
  findMany(args?: unknown): Promise<any[]>;
  findFirst(args?: unknown): Promise<any | null>;
  create(args: unknown): Promise<any>;
};

type PrismaClientShape = {
  specGateAgentContext: ModelClient;
  gitSyncRecord: ModelClient;
  specGateSpecCodeCheck: ModelClient;
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
  private mapAgentContext(row: any): AgentContextRecord {
    return row;
  }
  private mapSpecCodeCheck(row: any): SpecCodeCheckRecord {
    return {
      ...row,
      mismatchFindings: Array.isArray(row.mismatchFindingsJson)
        ? row.mismatchFindingsJson
        : [],
    };
  }
}
