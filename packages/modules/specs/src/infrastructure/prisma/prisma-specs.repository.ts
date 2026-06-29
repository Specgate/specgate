import type { RoadmapLane, SpecListQuery } from "@corely/contracts/specgate";
import type {
  CommentRecord,
  DecisionRecord,
  ProjectRecord,
  SpecRecord,
  SpecVersionRecord,
} from "../../domain/entities/spec";
import type {
  ProjectPatch,
  SpecsRepositoryPort,
} from "../../application/ports/specs-repository.port";

type ModelClient = {
  findMany(args?: unknown): Promise<any[]>;
  findFirst(args?: unknown): Promise<any | null>;
  create(args: unknown): Promise<any>;
  update(args: unknown): Promise<any>;
  count(args?: unknown): Promise<number>;
};

type PrismaClientShape = {
  specGateProject: ModelClient;
  specGateSpec: ModelClient;
  specGateSpecVersion: ModelClient;
  specGateComment: ModelClient;
  specGateDecision: ModelClient;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export class PrismaSpecsRepository implements SpecsRepositoryPort {
  constructor(private readonly prisma: PrismaClientShape) {}

  listProjects(tenantId: string): Promise<ProjectRecord[]> {
    return this.prisma.specGateProject
      .findMany({ where: { tenantId }, orderBy: { createdAt: "asc" } })
      .then((rows) => rows.map(this.mapProject));
  }

  findProject(
    tenantId: string,
    projectId: string,
  ): Promise<ProjectRecord | null> {
    return this.prisma.specGateProject
      .findFirst({ where: { id: projectId, tenantId } })
      .then((row) => (row ? this.mapProject(row) : null));
  }

  findProjectBySlug(
    tenantId: string,
    slug: string,
  ): Promise<ProjectRecord | null> {
    return this.prisma.specGateProject
      .findFirst({ where: { tenantId, slug } })
      .then((row) => (row ? this.mapProject(row) : null));
  }

  async createProject(project: ProjectRecord): Promise<void> {
    await this.prisma.specGateProject.create({ data: project });
  }

  async updateProject(
    tenantId: string,
    projectId: string,
    patch: ProjectPatch,
  ): Promise<ProjectRecord | null> {
    const existing = await this.findProject(tenantId, projectId);
    if (!existing) return null;
    const row = await this.prisma.specGateProject.update({
      where: { id: projectId },
      data: { ...patch, updatedAt: new Date() },
    });
    return this.mapProject(row);
  }

  async listSpecs(
    tenantId: string,
    query: SpecListQuery,
  ): Promise<SpecRecord[]> {
    const where: Record<string, unknown> = { tenantId };
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.roadmapLane) where.roadmapLane = query.roadmapLane;
    if (query.priority) where.priority = query.priority;
    if (query.buildCycleId) where.buildCycleId = query.buildCycleId;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { summary: { contains: query.q, mode: "insensitive" } },
        { specNumber: { contains: query.q, mode: "insensitive" } },
      ];
    }
    const args: Record<string, unknown> = {
      where,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    };
    if (query.cursor) {
      args.cursor = { id: query.cursor };
      args.skip = 1;
    }
    return this.prisma.specGateSpec
      .findMany(args)
      .then((rows) => rows.map(this.mapSpec));
  }

  findSpec(tenantId: string, specId: string): Promise<SpecRecord | null> {
    return this.prisma.specGateSpec
      .findFirst({ where: { id: specId, tenantId } })
      .then((row) => (row ? this.mapSpec(row) : null));
  }

  findSpecByNumber(
    tenantId: string,
    projectId: string,
    specNumber: string,
  ): Promise<SpecRecord | null> {
    return this.prisma.specGateSpec
      .findFirst({ where: { tenantId, projectId, specNumber } })
      .then((row) => (row ? this.mapSpec(row) : null));
  }

  async createSpec(spec: SpecRecord): Promise<void> {
    await this.prisma.specGateSpec.create({ data: this.toSpecData(spec) });
  }

  async updateSpec(
    tenantId: string,
    specId: string,
    patch: Partial<SpecRecord>,
  ): Promise<SpecRecord | null> {
    const existing = await this.findSpec(tenantId, specId);
    if (!existing) return null;
    const data: Record<string, unknown> = { ...patch };
    if ("acceptanceCriteria" in patch) {
      data.acceptanceCriteriaJson = patch.acceptanceCriteria;
      delete data.acceptanceCriteria;
    }
    if ("outOfScope" in patch) {
      data.outOfScopeJson = patch.outOfScope;
      delete data.outOfScope;
    }
    if ("relatedFiles" in patch) {
      data.relatedFilesJson = patch.relatedFiles;
      delete data.relatedFiles;
    }
    const row = await this.prisma.specGateSpec.update({
      where: { id: specId },
      data,
    });
    return this.mapSpec(row);
  }

  async nextSpecNumber(tenantId: string, projectId: string): Promise<string> {
    const count = await this.prisma.specGateSpec.count({
      where: { tenantId, projectId },
    });
    return `REQ-${String(count + 1).padStart(3, "0")}`;
  }

  async listSpecsByLane(
    tenantId: string,
    projectId?: string,
  ): Promise<Record<RoadmapLane, SpecRecord[]>> {
    const rows = await this.prisma.specGateSpec.findMany({
      where: { tenantId, ...(projectId ? { projectId } : {}) },
      orderBy: [{ roadmapLane: "asc" }, { createdAt: "asc" }],
    });
    const lanes: Record<RoadmapLane, SpecRecord[]> = {
      now: [],
      next: [],
      later: [],
      icebox: [],
    };
    for (const row of rows.map(this.mapSpec)) lanes[row.roadmapLane].push(row);
    return lanes;
  }

  async createVersion(version: SpecVersionRecord): Promise<void> {
    await this.prisma.specGateSpecVersion.create({ data: version });
  }

  countVersions(tenantId: string, specId: string): Promise<number> {
    return this.prisma.specGateSpecVersion.count({
      where: { tenantId, specId },
    });
  }

  listComments(tenantId: string, specId: string): Promise<CommentRecord[]> {
    return this.prisma.specGateComment
      .findMany({ where: { tenantId, specId }, orderBy: { createdAt: "asc" } })
      .then((rows) => rows.map(this.mapComment));
  }

  findComment(
    tenantId: string,
    commentId: string,
  ): Promise<CommentRecord | null> {
    return this.prisma.specGateComment
      .findFirst({ where: { tenantId, id: commentId } })
      .then((row) => (row ? this.mapComment(row) : null));
  }

  async createComment(comment: CommentRecord): Promise<void> {
    await this.prisma.specGateComment.create({ data: comment });
  }

  async updateComment(
    tenantId: string,
    commentId: string,
    patch: Partial<CommentRecord>,
  ): Promise<CommentRecord | null> {
    const existing = await this.findComment(tenantId, commentId);
    if (!existing) return null;
    const row = await this.prisma.specGateComment.update({
      where: { id: commentId },
      data: patch,
    });
    return this.mapComment(row);
  }

  listDecisions(tenantId: string, specId: string): Promise<DecisionRecord[]> {
    return this.prisma.specGateDecision
      .findMany({ where: { tenantId, specId }, orderBy: { createdAt: "asc" } })
      .then((rows) => rows.map(this.mapDecision));
  }

  async createDecision(decision: DecisionRecord): Promise<void> {
    await this.prisma.specGateDecision.create({ data: decision });
  }

  private toSpecData(spec: SpecRecord) {
    const { acceptanceCriteria, outOfScope, relatedFiles, ...rest } = spec;
    return {
      ...rest,
      acceptanceCriteriaJson: acceptanceCriteria,
      outOfScopeJson: outOfScope,
      relatedFilesJson: relatedFiles,
    };
  }

  private mapProject(row: any): ProjectRecord {
    return row;
  }

  private mapSpec(row: any): SpecRecord {
    return {
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      specNumber: row.specNumber,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      description: row.description,
      status: row.status,
      priority: row.priority,
      roadmapLane: row.roadmapLane,
      targetMilestoneId: row.targetMilestoneId,
      buildCycleId: row.buildCycleId,
      ownerId: row.ownerId,
      assigneeId: row.assigneeId,
      approvedVersionId: row.approvedVersionId,
      approvedBy: row.approvedBy,
      approvedAt: row.approvedAt,
      acceptedBy: row.acceptedBy,
      acceptedAt: row.acceptedAt,
      doneAt: row.doneAt,
      acceptanceCriteria: asStringArray(row.acceptanceCriteriaJson),
      outOfScope: asStringArray(row.outOfScopeJson),
      relatedFiles: asStringArray(row.relatedFilesJson),
      technicalNotes: row.technicalNotes,
      uiNotes: row.uiNotes,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapComment(row: any): CommentRecord {
    return row;
  }

  private mapDecision(row: any): DecisionRecord {
    return row;
  }
}
