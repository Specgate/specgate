import { randomUUID } from "node:crypto";
import type {
  RoadmapLane,
  BuildCycleInputSchema,
  BuildCycleUpdateSchema,
  MilestoneInputSchema,
  MilestoneUpdateSchema,
} from "@corely/contracts/specgate";
import type { z } from "zod";
import type { RequestContext, SpecsUseCases } from "@corely/modules-specs";
import { ConflictError, NotFoundError } from "@corely/modules-specs";
import type { PlanningRepositoryPort } from "../ports/planning-repository.port";
import { mapBuildCycle, mapBuildQueueItem, mapMilestone } from "../mappers";

type MilestoneInput = z.infer<typeof MilestoneInputSchema>;
type MilestoneUpdate = z.infer<typeof MilestoneUpdateSchema>;
type BuildCycleInput = z.infer<typeof BuildCycleInputSchema>;
type BuildCycleUpdate = z.infer<typeof BuildCycleUpdateSchema>;

export class PlanningUseCases {
  constructor(
    private readonly repository: PlanningRepositoryPort,
    private readonly specs: SpecsUseCases,
  ) {}

  listRoadmap(ctx: RequestContext, projectId?: string) {
    return this.specs.listRoadmap(ctx, projectId);
  }

  async moveItemBetweenRoadmapLanes(
    ctx: RequestContext,
    specId: string,
    roadmapLane: RoadmapLane,
  ) {
    return this.specs.moveRoadmapLane(ctx, specId, roadmapLane);
  }

  async suggestRoadmapPlan(ctx: RequestContext, projectId?: string) {
    const roadmap = await this.specs.listRoadmap(ctx, projectId);
    return {
      data: {
        summary:
          "Mock AI plan: keep approved high-priority specs in Now, move lower confidence requests to Later or Icebox.",
        lanes: roadmap.data,
      },
    };
  }

  async listMilestones(ctx: RequestContext, projectId?: string) {
    return {
      data: (await this.repository.listMilestones(ctx.tenantId, projectId)).map(
        mapMilestone,
      ),
    };
  }

  async getMilestone(ctx: RequestContext, milestoneId: string) {
    const milestone = await this.repository.findMilestone(
      ctx.tenantId,
      milestoneId,
    );
    if (!milestone)
      throw new NotFoundError(`Milestone ${milestoneId} not found.`);
    return { data: mapMilestone(milestone) };
  }

  async createMilestone(ctx: RequestContext, input: MilestoneInput) {
    const now = new Date();
    const milestone = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: input.projectId,
      name: input.name,
      description: input.description || null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      status: input.status || "planned",
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.createMilestone(milestone);
    return { data: mapMilestone(milestone) };
  }

  async updateMilestone(
    ctx: RequestContext,
    milestoneId: string,
    input: MilestoneUpdate,
  ) {
    const updated = await this.repository.updateMilestone(
      ctx.tenantId,
      milestoneId,
      {
        ...input,
        targetDate: input.targetDate
          ? new Date(input.targetDate)
          : input.targetDate === null
            ? null
            : undefined,
        updatedAt: new Date(),
      },
    );
    if (!updated)
      throw new NotFoundError(`Milestone ${milestoneId} not found.`);
    return { data: mapMilestone(updated) };
  }

  async listBuildCycles(ctx: RequestContext, projectId?: string) {
    return {
      data: (
        await this.repository.listBuildCycles(ctx.tenantId, projectId)
      ).map(mapBuildCycle),
    };
  }

  async getBuildCycle(ctx: RequestContext, buildCycleId: string) {
    const cycle = await this.repository.findBuildCycle(
      ctx.tenantId,
      buildCycleId,
    );
    if (!cycle)
      throw new NotFoundError(`Build cycle ${buildCycleId} not found.`);
    return { data: mapBuildCycle(cycle) };
  }

  async createBuildCycle(ctx: RequestContext, input: BuildCycleInput) {
    const now = new Date();
    const cycle = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: input.projectId,
      name: input.name,
      goal: input.goal || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      status: input.status || "planned",
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.createBuildCycle(cycle);
    return { data: mapBuildCycle(cycle) };
  }

  async updateBuildCycle(
    ctx: RequestContext,
    buildCycleId: string,
    input: BuildCycleUpdate,
  ) {
    const updated = await this.repository.updateBuildCycle(
      ctx.tenantId,
      buildCycleId,
      {
        ...input,
        startDate: input.startDate
          ? new Date(input.startDate)
          : input.startDate === null
            ? null
            : undefined,
        endDate: input.endDate
          ? new Date(input.endDate)
          : input.endDate === null
            ? null
            : undefined,
        updatedAt: new Date(),
      },
    );
    if (!updated)
      throw new NotFoundError(`Build cycle ${buildCycleId} not found.`);
    return { data: mapBuildCycle(updated) };
  }

  async addApprovedSpecToBuildQueue(
    ctx: RequestContext,
    specId: string,
    priorityRank = 0,
  ) {
    const snapshot = await this.specs.getApprovedSpecSnapshot(ctx, specId);
    const existing = await this.repository.findBuildQueueItemBySpec(
      ctx.tenantId,
      specId,
    );
    if (existing) return { data: mapBuildQueueItem(existing) };
    const now = new Date();
    const item = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: snapshot.projectId,
      specId,
      priorityRank,
      assignedTo: null,
      buildCycleId: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.createBuildQueueItem(item);
    if (snapshot.status === "approved")
      await this.specs.setSpecBuildQueueStatus(ctx, specId);
    return { data: mapBuildQueueItem(item) };
  }

  async listBuildQueue(ctx: RequestContext, projectId?: string) {
    return {
      data: (await this.repository.listBuildQueue(ctx.tenantId, projectId)).map(
        mapBuildQueueItem,
      ),
    };
  }

  async assignBuildQueueItem(
    ctx: RequestContext,
    itemId: string,
    assignedTo?: string | null,
  ) {
    const item = await this.repository.updateBuildQueueItem(
      ctx.tenantId,
      itemId,
      { assignedTo: assignedTo || null, updatedAt: new Date() },
    );
    if (!item) throw new NotFoundError(`Build queue item ${itemId} not found.`);
    return { data: mapBuildQueueItem(item) };
  }

  async addSpecToBuildCycle(
    ctx: RequestContext,
    buildCycleId: string,
    specId: string,
  ) {
    const cycle = await this.repository.findBuildCycle(
      ctx.tenantId,
      buildCycleId,
    );
    if (!cycle)
      throw new NotFoundError(`Build cycle ${buildCycleId} not found.`);
    const snapshot = await this.specs.getApprovedSpecSnapshot(ctx, specId);
    if (snapshot.projectId !== cycle.projectId)
      throw new ConflictError(
        "Build cycle must belong to the same project as the spec.",
      );
    const item =
      (await this.repository.findBuildQueueItemBySpec(ctx.tenantId, specId)) ||
      (await this.addApprovedSpecToBuildQueue(ctx, specId, 0)).data;
    const updated = await this.repository.updateBuildQueueItem(
      ctx.tenantId,
      item.id,
      { buildCycleId, updatedAt: new Date() },
    );
    await this.specs.setSpecBuildQueueStatus(ctx, specId);
    return { data: mapBuildQueueItem(updated!) };
  }

  async removeSpecFromBuildCycle(
    ctx: RequestContext,
    buildCycleId: string,
    specId: string,
  ) {
    const item = await this.repository.findBuildQueueItemBySpec(
      ctx.tenantId,
      specId,
    );
    if (!item || item.buildCycleId !== buildCycleId)
      throw new NotFoundError(
        `Spec ${specId} is not in build cycle ${buildCycleId}.`,
      );
    const updated = await this.repository.updateBuildQueueItem(
      ctx.tenantId,
      item.id,
      { buildCycleId: null, updatedAt: new Date() },
    );
    return { data: mapBuildQueueItem(updated!) };
  }

  async completeBuildCycle(ctx: RequestContext, buildCycleId: string) {
    return this.updateBuildCycle(ctx, buildCycleId, { status: "completed" });
  }

  async summarizeBuildCycle(ctx: RequestContext, buildCycleId: string) {
    const cycle = await this.getBuildCycle(ctx, buildCycleId);
    const queue = await this.repository.listBuildQueue(
      ctx.tenantId,
      cycle.data.projectId,
    );
    return {
      data: {
        cycle: cycle.data,
        specCount: queue.filter((item) => item.buildCycleId === buildCycleId)
          .length,
      },
    };
  }
}
