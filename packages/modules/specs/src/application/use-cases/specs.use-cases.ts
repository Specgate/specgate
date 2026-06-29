import { randomUUID } from "node:crypto";
import type {
  RoadmapLane,
  ApprovedSpecSnapshot,
  CommentDto,
  DecisionDto,
  ProjectDto,
  ProjectInput,
  SpecDto,
  SpecInput,
  SpecListQuery,
  SpecUpdate,
  SpecStatus,
} from "@corely/contracts/specgate";
import type {
  SpecsRepositoryPort,
  ActivityPublisherPort,
} from "../ports/specs-repository.port";
import type { SpecRecord } from "../../domain/entities/spec";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../domain/errors";
import {
  mapApprovedSnapshot,
  mapComment,
  mapDecision,
  mapProject,
  mapSpec,
} from "../mappers";
import { WorkflowService } from "../services/spec-workflow.service";
import { generateSpecVersionMarkdown } from "../services/spec-markdown.service";

export type RequestContext = { tenantId: string; userId: string };

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export class SpecsUseCases {
  private readonly workflow = new WorkflowService();

  constructor(
    private readonly repository: SpecsRepositoryPort,
    private readonly activity?: ActivityPublisherPort,
  ) {}

  async listProjects(ctx: RequestContext): Promise<{ data: ProjectDto[] }> {
    return {
      data: (await this.repository.listProjects(ctx.tenantId)).map(mapProject),
    };
  }

  async getProject(
    ctx: RequestContext,
    projectId: string,
  ): Promise<{ data: ProjectDto }> {
    return {
      data: mapProject(await this.requireProject(ctx.tenantId, projectId)),
    };
  }

  async createProject(
    ctx: RequestContext,
    input: ProjectInput,
  ): Promise<{ data: ProjectDto }> {
    const now = new Date();
    const project = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      name: input.name,
      slug: input.slug || slugify(input.name),
      description: input.description || null,
      gitProvider: input.gitProvider || null,
      gitRepoUrl: input.gitRepoUrl || null,
      gitDefaultBranch: input.gitDefaultBranch || null,
      requirementsPath: input.requirementsPath || null,
      assetsPath: input.assetsPath || null,
      agentContextPath: input.agentContextPath || null,
      createdAt: now,
      updatedAt: now,
    };
    if (await this.repository.findProjectBySlug(ctx.tenantId, project.slug)) {
      throw new ConflictError(`Project slug ${project.slug} already exists.`);
    }
    await this.repository.createProject(project);
    return { data: mapProject(project) };
  }

  async updateProjectSettings(
    ctx: RequestContext,
    projectId: string,
    input: Partial<ProjectInput>,
  ) {
    const updated = await this.repository.updateProject(
      ctx.tenantId,
      projectId,
      input,
    );
    if (!updated) throw new NotFoundError(`Project ${projectId} not found.`);
    return { data: mapProject(updated) };
  }

  async listSpecs(
    ctx: RequestContext,
    query: SpecListQuery,
  ): Promise<{ data: SpecDto[] }> {
    return {
      data: (await this.repository.listSpecs(ctx.tenantId, query)).map(mapSpec),
    };
  }

  async getSpecDetail(
    ctx: RequestContext,
    specId: string,
  ): Promise<{ data: SpecDto }> {
    return { data: mapSpec(await this.requireSpec(ctx.tenantId, specId)) };
  }

  async createSpecRequest(
    ctx: RequestContext,
    input: SpecInput,
  ): Promise<{ data: SpecDto }> {
    await this.requireProject(ctx.tenantId, input.projectId);
    const now = new Date();
    const spec: SpecRecord = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: input.projectId,
      specNumber: await this.repository.nextSpecNumber(
        ctx.tenantId,
        input.projectId,
      ),
      title: input.title,
      slug: input.slug || slugify(input.title),
      summary: input.summary || null,
      description: input.description || null,
      status: "request",
      priority: input.priority || "medium",
      roadmapLane: input.roadmapLane || "icebox",
      targetMilestoneId: input.targetMilestoneId || null,
      buildCycleId: null,
      ownerId: input.ownerId || null,
      assigneeId: input.assigneeId || null,
      approvedVersionId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteria: input.acceptanceCriteria || [],
      outOfScope: input.outOfScope || [],
      relatedFiles: input.relatedFiles || [],
      technicalNotes: input.technicalNotes || null,
      uiNotes: input.uiNotes || null,
      createdBy: ctx.userId,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.createSpec(spec);
    await this.publish(
      ctx,
      spec,
      "spec_created",
      `${ctx.userId} created ${spec.specNumber} from an idea.`,
    );
    return { data: mapSpec(spec) };
  }

  async updateSpec(
    ctx: RequestContext,
    specId: string,
    input: SpecUpdate,
  ): Promise<{ data: SpecDto }> {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    const contentChanged = [
      "title",
      "summary",
      "description",
      "acceptanceCriteria",
      "outOfScope",
      "relatedFiles",
      "technicalNotes",
      "uiNotes",
    ].some((key) => key in input);
    const patch: Partial<SpecRecord> = {
      ...input,
      summary: input.summary === undefined ? undefined : input.summary || null,
      description:
        input.description === undefined ? undefined : input.description || null,
      targetMilestoneId:
        input.targetMilestoneId === undefined
          ? undefined
          : input.targetMilestoneId || null,
      ownerId: input.ownerId === undefined ? undefined : input.ownerId || null,
      assigneeId:
        input.assigneeId === undefined ? undefined : input.assigneeId || null,
      technicalNotes:
        input.technicalNotes === undefined
          ? undefined
          : input.technicalNotes || null,
      uiNotes: input.uiNotes === undefined ? undefined : input.uiNotes || null,
      updatedAt: new Date(),
    };
    if (input.title && !input.slug) patch.slug = slugify(input.title);
    if (
      contentChanged &&
      [
        "approved",
        "build_queue",
        "in_development",
        "developer_review",
        "preview",
        "stakeholder_review",
        "accepted",
        "done",
      ].includes(spec.status)
    ) {
      patch.status = "review";
    }
    const updated = await this.repository.updateSpec(
      ctx.tenantId,
      specId,
      patch,
    );
    if (!updated) throw new NotFoundError(`Spec ${specId} not found.`);
    await this.publish(
      ctx,
      updated,
      "spec_updated",
      `${ctx.userId} updated ${updated.specNumber}.`,
    );
    return { data: mapSpec(updated) };
  }

  createDraftFromRequest(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "draft",
      "spec_updated",
      "created a draft",
    );
  }

  moveSpecToReview(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "review",
      "spec_moved_to_review",
      "moved to Review",
    );
  }

  async approveSpec(
    ctx: RequestContext,
    specId: string,
  ): Promise<{ data: SpecDto }> {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    this.workflow.assertTransition(spec.status, "approved");
    this.workflow.assertApprovalReady(spec);
    const versionNumber =
      (await this.repository.countVersions(ctx.tenantId, specId)) + 1;
    const version = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      specId,
      versionNumber,
      summarySnapshot: spec.summary,
      markdownSnapshot: generateSpecVersionMarkdown(spec),
      createdBy: ctx.userId,
      changeSummary: "Approved snapshot",
      createdAt: new Date(),
    };
    await this.repository.createVersion(version);
    const updated = await this.repository.updateSpec(ctx.tenantId, specId, {
      status: "approved",
      approvedVersionId: version.id,
      approvedBy: ctx.userId,
      approvedAt: version.createdAt,
      updatedAt: version.createdAt,
    });
    if (!updated) throw new NotFoundError(`Spec ${specId} not found.`);
    await this.publish(
      ctx,
      updated,
      "spec_approved",
      `${ctx.userId} approved ${updated.specNumber}.`,
    );
    return { data: mapSpec(updated) };
  }

  requestSpecChanges(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "draft",
      "spec_changes_requested",
      "requested changes for",
    );
  }

  async moveRoadmapLane(
    ctx: RequestContext,
    specId: string,
    roadmapLane: RoadmapLane,
  ) {
    const updated = await this.repository.updateSpec(ctx.tenantId, specId, {
      roadmapLane,
      updatedAt: new Date(),
    });
    if (!updated) throw new NotFoundError(`Spec ${specId} not found.`);
    await this.publish(
      ctx,
      updated,
      "roadmap_lane_changed",
      `${ctx.userId} moved ${updated.specNumber} to ${roadmapLane}.`,
    );
    return { data: mapSpec(updated) };
  }

  setSpecBuildQueueStatus(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "build_queue",
      "added_to_build_queue",
      "added to Build Queue",
    );
  }
  setSpecInDevelopmentStatus(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "in_development",
      "development_started",
      "moved to In Development",
    );
  }
  setSpecDeveloperReviewStatus(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "developer_review",
      "developer_review_started",
      "moved to Developer Review",
    );
  }
  setSpecPreviewStatus(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "preview",
      "approved_for_preview",
      "moved to Preview",
    );
  }
  setSpecStakeholderReviewStatus(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "stakeholder_review",
      "sent_to_stakeholder_review",
      "sent to Stakeholder Review",
    );
  }
  setSpecAcceptedStatus(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "accepted",
      "preview_approved",
      "accepted preview for",
    );
  }
  markSpecDone(ctx: RequestContext, specId: string) {
    return this.transition(
      ctx,
      specId,
      "done",
      "spec_marked_done",
      "marked done",
    );
  }

  async listComments(
    ctx: RequestContext,
    specId: string,
  ): Promise<{ data: CommentDto[] }> {
    await this.requireSpec(ctx.tenantId, specId);
    return {
      data: (await this.repository.listComments(ctx.tenantId, specId)).map(
        mapComment,
      ),
    };
  }

  async addComment(
    ctx: RequestContext,
    specId: string,
    input: { body: string; sectionReference?: string | null },
  ) {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    const now = new Date();
    const comment = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      specId,
      userId: ctx.userId,
      body: input.body,
      sectionReference: input.sectionReference || null,
      status: "open" as const,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      resolvedBy: null,
    };
    await this.repository.createComment(comment);
    await this.publish(
      ctx,
      spec,
      "spec_updated",
      `${ctx.userId} commented on ${spec.specNumber}.`,
    );
    return { data: mapComment(comment) };
  }

  async resolveComment(ctx: RequestContext, commentId: string) {
    const comment = await this.requireComment(ctx.tenantId, commentId);
    const updated = await this.repository.updateComment(
      ctx.tenantId,
      commentId,
      {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy: ctx.userId,
        updatedAt: new Date(),
      },
    );
    if (!updated) throw new NotFoundError(`Comment ${commentId} not found.`);
    await this.requireSpec(ctx.tenantId, comment.specId);
    return { data: mapComment(updated) };
  }

  async dismissComment(ctx: RequestContext, commentId: string) {
    await this.requireComment(ctx.tenantId, commentId);
    const updated = await this.repository.updateComment(
      ctx.tenantId,
      commentId,
      {
        status: "dismissed",
        resolvedAt: new Date(),
        resolvedBy: ctx.userId,
        updatedAt: new Date(),
      },
    );
    if (!updated) throw new NotFoundError(`Comment ${commentId} not found.`);
    return { data: mapComment(updated) };
  }

  async listDecisions(
    ctx: RequestContext,
    specId: string,
  ): Promise<{ data: DecisionDto[] }> {
    await this.requireSpec(ctx.tenantId, specId);
    return {
      data: (await this.repository.listDecisions(ctx.tenantId, specId)).map(
        mapDecision,
      ),
    };
  }

  async addDecision(
    ctx: RequestContext,
    specId: string,
    input: { question: string; decision: string },
  ) {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    const decision = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      specId,
      question: input.question,
      decision: input.decision,
      decidedBy: ctx.userId,
      createdAt: new Date(),
    };
    await this.repository.createDecision(decision);
    await this.publish(
      ctx,
      spec,
      "spec_updated",
      `${ctx.userId} recorded a decision for ${spec.specNumber}.`,
    );
    return { data: mapDecision(decision) };
  }

  async getApprovedSpecSnapshot(
    ctx: RequestContext,
    specId: string,
  ): Promise<ApprovedSpecSnapshot> {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    this.workflow.assertApprovedOrLater(spec);
    return mapApprovedSnapshot(spec);
  }

  async getSpecWorkflowSnapshot(
    ctx: RequestContext,
    specId: string,
  ): Promise<{
    id: string;
    projectId: string;
    status: SpecStatus;
    specNumber: string;
    title: string;
  }> {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    return {
      id: spec.id,
      projectId: spec.projectId,
      status: spec.status,
      specNumber: spec.specNumber,
      title: spec.title,
    };
  }

  async listRoadmap(ctx: RequestContext, projectId?: string) {
    const lanes = await this.repository.listSpecsByLane(
      ctx.tenantId,
      projectId,
    );
    return {
      data: {
        now: lanes.now.map(mapSpec),
        next: lanes.next.map(mapSpec),
        later: lanes.later.map(mapSpec),
        icebox: lanes.icebox.map(mapSpec),
      },
    };
  }

  private async transition(
    ctx: RequestContext,
    specId: string,
    next: SpecStatus,
    activityType: string,
    verb: string,
  ): Promise<{ data: SpecDto }> {
    const spec = await this.requireSpec(ctx.tenantId, specId);
    this.workflow.assertTransition(spec.status, next);
    const now = new Date();
    const patch: Partial<SpecRecord> = { status: next, updatedAt: now };
    if (next === "accepted") {
      patch.acceptedBy = ctx.userId;
      patch.acceptedAt = now;
    }
    if (next === "done") patch.doneAt = now;
    const updated = await this.repository.updateSpec(
      ctx.tenantId,
      specId,
      patch,
    );
    if (!updated) throw new NotFoundError(`Spec ${specId} not found.`);
    await this.publish(
      ctx,
      updated,
      activityType,
      `${ctx.userId} ${verb} ${updated.specNumber}.`,
    );
    return { data: mapSpec(updated) };
  }

  private async requireProject(tenantId: string, projectId: string) {
    const project = await this.repository.findProject(tenantId, projectId);
    if (!project) throw new NotFoundError(`Project ${projectId} not found.`);
    return project;
  }

  private async requireSpec(tenantId: string, specId: string) {
    const spec = await this.repository.findSpec(tenantId, specId);
    if (!spec) throw new NotFoundError(`Spec ${specId} not found.`);
    return spec;
  }

  private async requireComment(tenantId: string, commentId: string) {
    const comment = await this.repository.findComment(tenantId, commentId);
    if (!comment) throw new NotFoundError(`Comment ${commentId} not found.`);
    return comment;
  }

  private async publish(
    ctx: RequestContext,
    spec: SpecRecord,
    type: string,
    message: string,
  ) {
    await this.activity?.publish({
      tenantId: ctx.tenantId,
      projectId: spec.projectId,
      specId: spec.id,
      actorId: ctx.userId,
      type,
      message,
    });
  }
}
