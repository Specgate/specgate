import { randomUUID } from "node:crypto";
import type { RequestContext, SpecsUseCases } from "@corely/modules-specs";
import { ConflictError, NotFoundError } from "@corely/modules-specs";
import type { ImplementationRepositoryPort } from "../ports/implementation-repository.port";
import { mapImplementation } from "../mappers";

export class ImplementationUseCases {
  constructor(
    private readonly repository: ImplementationRepositoryPort,
    private readonly specs: SpecsUseCases,
  ) {}

  async getImplementation(ctx: RequestContext, specId: string) {
    const record = await this.repository.findBySpec(ctx.tenantId, specId);
    if (!record)
      throw new NotFoundError(
        `Implementation record for spec ${specId} not found.`,
      );
    return { data: mapImplementation(record) };
  }

  async startDevelopment(ctx: RequestContext, specId: string) {
    const workflow = await this.specs.getSpecWorkflowSnapshot(ctx, specId);
    if (!["approved", "build_queue"].includes(workflow.status)) {
      throw new ConflictError(
        "Spec must be approved or in build queue before development can start.",
      );
    }
    const existing = await this.repository.findBySpec(ctx.tenantId, specId);
    if (existing) return { data: mapImplementation(existing) };
    const now = new Date();
    const record = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: workflow.projectId,
      specId,
      status: "in_progress" as const,
      branchName: null,
      pullRequestUrl: null,
      developerId: ctx.userId,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.create(record);
    await this.specs.setSpecInDevelopmentStatus(ctx, specId);
    return { data: mapImplementation(record) };
  }

  async linkBranch(ctx: RequestContext, specId: string, branchName: string) {
    await this.ensureRecord(ctx, specId);
    const updated = await this.repository.updateBySpec(ctx.tenantId, specId, {
      branchName,
      updatedAt: new Date(),
    });
    return { data: mapImplementation(updated!) };
  }

  async linkPullRequest(
    ctx: RequestContext,
    specId: string,
    pullRequestUrl: string,
  ) {
    await this.ensureRecord(ctx, specId);
    const updated = await this.repository.updateBySpec(ctx.tenantId, specId, {
      pullRequestUrl,
      updatedAt: new Date(),
    });
    return { data: mapImplementation(updated!) };
  }

  async moveToDeveloperReview(ctx: RequestContext, specId: string) {
    await this.ensureRecord(ctx, specId);
    const updated = await this.repository.updateBySpec(ctx.tenantId, specId, {
      status: "ready_for_developer_review",
      updatedAt: new Date(),
    });
    await this.specs.setSpecDeveloperReviewStatus(ctx, specId);
    return { data: mapImplementation(updated!) };
  }

  async requestImplementationChanges(ctx: RequestContext, specId: string) {
    await this.ensureRecord(ctx, specId);
    const updated = await this.repository.updateBySpec(ctx.tenantId, specId, {
      status: "changes_requested",
      updatedAt: new Date(),
    });
    await this.specs.setSpecInDevelopmentStatus(ctx, specId);
    return { data: mapImplementation(updated!) };
  }

  async approveForPreview(ctx: RequestContext, specId: string) {
    await this.ensureRecord(ctx, specId);
    const updated = await this.repository.updateBySpec(ctx.tenantId, specId, {
      status: "approved_for_preview",
      updatedAt: new Date(),
    });
    await this.specs.setSpecPreviewStatus(ctx, specId);
    return { data: mapImplementation(updated!) };
  }

  private async ensureRecord(ctx: RequestContext, specId: string) {
    const record = await this.repository.findBySpec(ctx.tenantId, specId);
    if (!record)
      throw new NotFoundError(
        `Implementation record for spec ${specId} not found.`,
      );
    return record;
  }
}
