import type {
  BuildCycleRecord,
  BuildQueueItemRecord,
  MilestoneRecord,
} from "../../domain/entities/planning";

export interface PlanningRepositoryPort {
  listMilestones(
    tenantId: string,
    projectId?: string,
  ): Promise<MilestoneRecord[]>;
  findMilestone(
    tenantId: string,
    milestoneId: string,
  ): Promise<MilestoneRecord | null>;
  createMilestone(milestone: MilestoneRecord): Promise<void>;
  updateMilestone(
    tenantId: string,
    milestoneId: string,
    patch: Partial<MilestoneRecord>,
  ): Promise<MilestoneRecord | null>;

  listBuildCycles(
    tenantId: string,
    projectId?: string,
  ): Promise<BuildCycleRecord[]>;
  findBuildCycle(
    tenantId: string,
    buildCycleId: string,
  ): Promise<BuildCycleRecord | null>;
  createBuildCycle(cycle: BuildCycleRecord): Promise<void>;
  updateBuildCycle(
    tenantId: string,
    buildCycleId: string,
    patch: Partial<BuildCycleRecord>,
  ): Promise<BuildCycleRecord | null>;

  listBuildQueue(
    tenantId: string,
    projectId?: string,
  ): Promise<BuildQueueItemRecord[]>;
  findBuildQueueItem(
    tenantId: string,
    itemId: string,
  ): Promise<BuildQueueItemRecord | null>;
  findBuildQueueItemBySpec(
    tenantId: string,
    specId: string,
  ): Promise<BuildQueueItemRecord | null>;
  createBuildQueueItem(item: BuildQueueItemRecord): Promise<void>;
  updateBuildQueueItem(
    tenantId: string,
    itemId: string,
    patch: Partial<BuildQueueItemRecord>,
  ): Promise<BuildQueueItemRecord | null>;
  updateBuildQueueItemBySpec(
    tenantId: string,
    specId: string,
    patch: Partial<BuildQueueItemRecord>,
  ): Promise<BuildQueueItemRecord | null>;
}
