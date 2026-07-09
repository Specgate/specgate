import type {
  BuildCycleRecord,
  BuildQueueItemRecord,
  MilestoneRecord,
} from "../../domain/entities/planning";
import type { PlanningRepositoryPort } from "../../application/ports/planning-repository.port";

type ModelClient = {
  findMany(args?: unknown): Promise<Record<string, unknown>[]>;
  findFirst(args?: unknown): Promise<Record<string, unknown> | null>;
  create(args: unknown): Promise<Record<string, unknown>>;
  update(args: unknown): Promise<Record<string, unknown>>;
};

type PrismaClientShape = {
  specGateMilestone: ModelClient;
  specGateBuildCycle: ModelClient;
  specGateBuildQueueItem: ModelClient;
};

export class PrismaPlanningRepository implements PlanningRepositoryPort {
  constructor(private readonly prisma: PrismaClientShape) {}

  listMilestones(tenantId: string, projectId?: string) {
    return this.prisma.specGateMilestone
      .findMany({
        where: { tenantId, ...(projectId ? { projectId } : {}) },
        orderBy: { targetDate: "asc" },
      })
      .then((rows) => rows.map(this.mapMilestone));
  }
  findMilestone(tenantId: string, milestoneId: string) {
    return this.prisma.specGateMilestone
      .findFirst({ where: { tenantId, id: milestoneId } })
      .then((row) => (row ? this.mapMilestone(row) : null));
  }
  async createMilestone(milestone: MilestoneRecord) {
    await this.prisma.specGateMilestone.create({ data: milestone });
  }
  async updateMilestone(
    tenantId: string,
    milestoneId: string,
    patch: Partial<MilestoneRecord>,
  ) {
    if (!(await this.findMilestone(tenantId, milestoneId))) return null;
    return this.prisma.specGateMilestone
      .update({ where: { id: milestoneId }, data: patch })
      .then(this.mapMilestone);
  }

  listBuildCycles(tenantId: string, projectId?: string) {
    return this.prisma.specGateBuildCycle
      .findMany({
        where: { tenantId, ...(projectId ? { projectId } : {}) },
        orderBy: { startDate: "asc" },
      })
      .then((rows) => rows.map(this.mapBuildCycle));
  }
  findBuildCycle(tenantId: string, buildCycleId: string) {
    return this.prisma.specGateBuildCycle
      .findFirst({ where: { tenantId, id: buildCycleId } })
      .then((row) => (row ? this.mapBuildCycle(row) : null));
  }
  async createBuildCycle(cycle: BuildCycleRecord) {
    await this.prisma.specGateBuildCycle.create({ data: cycle });
  }
  async updateBuildCycle(
    tenantId: string,
    buildCycleId: string,
    patch: Partial<BuildCycleRecord>,
  ) {
    if (!(await this.findBuildCycle(tenantId, buildCycleId))) return null;
    return this.prisma.specGateBuildCycle
      .update({ where: { id: buildCycleId }, data: patch })
      .then(this.mapBuildCycle);
  }

  listBuildQueue(tenantId: string, projectId?: string) {
    return this.prisma.specGateBuildQueueItem
      .findMany({
        where: { tenantId, ...(projectId ? { projectId } : {}) },
        orderBy: { priorityRank: "asc" },
      })
      .then((rows) => rows.map(this.mapBuildQueueItem));
  }
  findBuildQueueItem(tenantId: string, itemId: string) {
    return this.prisma.specGateBuildQueueItem
      .findFirst({ where: { tenantId, id: itemId } })
      .then((row) => (row ? this.mapBuildQueueItem(row) : null));
  }
  findBuildQueueItemBySpec(tenantId: string, specId: string) {
    return this.prisma.specGateBuildQueueItem
      .findFirst({ where: { tenantId, specId } })
      .then((row) => (row ? this.mapBuildQueueItem(row) : null));
  }
  async createBuildQueueItem(item: BuildQueueItemRecord) {
    await this.prisma.specGateBuildQueueItem.create({ data: item });
  }
  async updateBuildQueueItem(
    tenantId: string,
    itemId: string,
    patch: Partial<BuildQueueItemRecord>,
  ) {
    if (!(await this.findBuildQueueItem(tenantId, itemId))) return null;
    return this.prisma.specGateBuildQueueItem
      .update({ where: { id: itemId }, data: patch })
      .then(this.mapBuildQueueItem);
  }
  async updateBuildQueueItemBySpec(
    tenantId: string,
    specId: string,
    patch: Partial<BuildQueueItemRecord>,
  ) {
    const item = await this.findBuildQueueItemBySpec(tenantId, specId);
    return item ? this.updateBuildQueueItem(tenantId, item.id, patch) : null;
  }

  private mapMilestone(row: Record<string, unknown>): MilestoneRecord {
    return row as unknown as MilestoneRecord;
  }
  private mapBuildCycle(row: Record<string, unknown>): BuildCycleRecord {
    return row as unknown as BuildCycleRecord;
  }
  private mapBuildQueueItem(row: Record<string, unknown>): BuildQueueItemRecord {
    return row as unknown as BuildQueueItemRecord;
  }
}
