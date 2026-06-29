import { randomUUID } from "node:crypto";
import type { PreviewEnvironment } from "@corely/contracts/specgate";
import type { RequestContext, SpecsUseCases } from "@corely/modules-specs";
import { ConflictError, NotFoundError } from "@corely/modules-specs";
import type { PreviewRepositoryPort } from "../ports/preview-repository.port";
import { mapPreviewChecklist, mapPreviewReview } from "../mappers";

export class PreviewUseCases {
  constructor(
    private readonly repository: PreviewRepositoryPort,
    private readonly specs: SpecsUseCases,
  ) {}

  async listReviews(ctx: RequestContext, projectId?: string) {
    return {
      data: (await this.repository.listReviews(ctx.tenantId, projectId)).map(
        mapPreviewReview,
      ),
    };
  }

  async listSpecReviews(ctx: RequestContext, specId: string) {
    return {
      data: (
        await this.repository.listReviewsForSpec(ctx.tenantId, specId)
      ).map(mapPreviewReview),
    };
  }

  async addPreviewUrl(
    ctx: RequestContext,
    specId: string,
    previewUrl: string,
    environment: PreviewEnvironment,
  ) {
    const workflow = await this.specs.getSpecWorkflowSnapshot(ctx, specId);
    const now = new Date();
    const review = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: workflow.projectId,
      specId,
      previewUrl,
      environment,
      status: "waiting_for_review" as const,
      feedback: null,
      rejectionReason: null,
      reviewedBy: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.createReview(review);
    return { data: mapPreviewReview(review) };
  }

  async sendToStakeholderReview(ctx: RequestContext, specId: string) {
    const latest = await this.repository.latestReview(ctx.tenantId, specId);
    if (!latest?.previewUrl)
      throw new ConflictError(
        "Preview URL is required before stakeholder review.",
      );
    await this.specs.setSpecStakeholderReviewStatus(ctx, specId);
    return { data: mapPreviewReview(latest) };
  }

  async generatePreviewChecklist(ctx: RequestContext, specId: string) {
    const snapshot = await this.specs.getApprovedSpecSnapshot(ctx, specId);
    const checklist = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: snapshot.projectId,
      specId,
      items: snapshot.acceptanceCriteria.map((item) => `Verify: ${item}`),
      createdAt: new Date(),
    };
    await this.repository.createChecklist(checklist);
    return { data: mapPreviewChecklist(checklist) };
  }

  async approvePreview(ctx: RequestContext, specId: string) {
    await this.requireStakeholderReview(ctx, specId);
    const latest = await this.requireLatestReview(ctx, specId);
    const updated = await this.repository.updateReview(
      ctx.tenantId,
      latest.id,
      {
        status: "approved",
        reviewedBy: ctx.userId,
        updatedAt: new Date(),
      },
    );
    await this.specs.setSpecAcceptedStatus(ctx, specId);
    return { data: mapPreviewReview(updated!) };
  }

  async commentPreview(ctx: RequestContext, specId: string, feedback: string) {
    await this.requireStakeholderReview(ctx, specId);
    const latest = await this.requireLatestReview(ctx, specId);
    const updated = await this.repository.updateReview(
      ctx.tenantId,
      latest.id,
      {
        status: "commented",
        feedback,
        reviewedBy: ctx.userId,
        updatedAt: new Date(),
      },
    );
    return { data: mapPreviewReview(updated!) };
  }

  async rejectPreview(ctx: RequestContext, specId: string, reason: string) {
    await this.requireStakeholderReview(ctx, specId);
    const latest = await this.requireLatestReview(ctx, specId);
    const updated = await this.repository.updateReview(
      ctx.tenantId,
      latest.id,
      {
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: ctx.userId,
        updatedAt: new Date(),
      },
    );
    await this.specs.setSpecDeveloperReviewStatus(ctx, specId);
    return { data: mapPreviewReview(updated!) };
  }

  async markSpecDone(ctx: RequestContext, specId: string) {
    const workflow = await this.specs.getSpecWorkflowSnapshot(ctx, specId);
    if (workflow.status !== "accepted")
      throw new ConflictError(
        "Spec must be accepted before it can be marked done.",
      );
    return this.specs.markSpecDone(ctx, specId);
  }

  private async requireStakeholderReview(ctx: RequestContext, specId: string) {
    const workflow = await this.specs.getSpecWorkflowSnapshot(ctx, specId);
    if (workflow.status !== "stakeholder_review")
      throw new ConflictError(
        "Spec must be in stakeholder review for this preview action.",
      );
  }

  private async requireLatestReview(ctx: RequestContext, specId: string) {
    const latest = await this.repository.latestReview(ctx.tenantId, specId);
    if (!latest)
      throw new NotFoundError(`Preview review for spec ${specId} not found.`);
    return latest;
  }
}
