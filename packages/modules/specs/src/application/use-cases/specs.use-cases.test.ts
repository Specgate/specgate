import { describe, expect, it } from "vitest";
import { ConflictError, ValidationError } from "../../domain/errors";
import { InMemorySpecsRepository } from "../../testkit/in-memory-specs.repository";
import { SpecsUseCases } from "./specs.use-cases";

async function setup() {
  const repository = new InMemorySpecsRepository();
  const useCases = new SpecsUseCases(repository);
  const ctx = { tenantId: "tenant_a", userId: "u-ha" };
  const project = await useCases.createProject(ctx, {
    name: "LaunchOS",
    slug: "launchos",
  });
  return { repository, useCases, ctx, projectId: project.data.id };
}

describe("SpecsUseCases", () => {
  it("creates request specs with default priority and roadmap lane", async () => {
    const { useCases, ctx, projectId } = await setup();

    const created = await useCases.createSpecRequest(ctx, {
      projectId,
      title: "Team Invite",
    });

    expect(created.data.priority).toBe("medium");
    expect(created.data.roadmapLane).toBe("icebox");
    expect(created.data.status).toBe("request");
  });

  it("scopes specs by tenant id", async () => {
    const { useCases, ctx, projectId } = await setup();
    await useCases.createSpecRequest(ctx, {
      projectId,
      title: "Tenant A Spec",
    });

    const tenantB = await useCases.listSpecs(
      { tenantId: "tenant_b", userId: "u-ha" },
      {},
    );

    expect(tenantB.data).toHaveLength(0);
  });

  it("rejects approval without acceptance criteria and out-of-scope", async () => {
    const { useCases, ctx, projectId } = await setup();
    const spec = await useCases.createSpecRequest(ctx, {
      projectId,
      title: "Incomplete Spec",
      summary: "Needs work",
    });
    await useCases.createDraftFromRequest(ctx, spec.data.id);
    await useCases.moveSpecToReview(ctx, spec.data.id);

    await expect(
      useCases.approveSpec(ctx, spec.data.id),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("approval sets status and creates a version snapshot", async () => {
    const { repository, useCases, ctx, projectId } = await setup();
    const spec = await useCases.createSpecRequest(ctx, {
      projectId,
      title: "Complete Spec",
      summary: "Ready to approve",
      acceptanceCriteria: ["User can invite a teammate."],
      outOfScope: ["Bulk invite"],
    });
    await useCases.createDraftFromRequest(ctx, spec.data.id);
    await useCases.moveSpecToReview(ctx, spec.data.id);

    const approved = await useCases.approveSpec(ctx, spec.data.id);

    expect(approved.data.status).toBe("approved");
    expect(repository.versions.size).toBe(1);
  });

  it("rejects invalid workflow transitions", async () => {
    const { useCases, ctx, projectId } = await setup();
    const spec = await useCases.createSpecRequest(ctx, {
      projectId,
      title: "Invalid Jump",
    });

    await expect(
      useCases.approveSpec(ctx, spec.data.id),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("returns batched summaries with grouped counts and latest checks", async () => {
    const { repository, useCases, ctx, projectId } = await setup();
    const first = await useCases.createSpecRequest(ctx, {
      projectId,
      title: "First Spec",
    });
    const second = await useCases.createSpecRequest(ctx, {
      projectId,
      title: "Second Spec",
    });
    const older = new Date("2027-01-01T10:00:00.000Z");
    const newer = new Date("2027-01-02T10:00:00.000Z");

    repository.comments.set("comment_1", {
      id: "comment_1",
      tenantId: ctx.tenantId,
      specId: first.data.id,
      userId: ctx.userId,
      body: "Looks good.",
      sectionReference: null,
      status: "open",
      createdAt: older,
      updatedAt: older,
      resolvedAt: null,
      resolvedBy: null,
    });
    repository.comments.set("comment_2", {
      id: "comment_2",
      tenantId: ctx.tenantId,
      specId: first.data.id,
      userId: ctx.userId,
      body: "Needs copy.",
      sectionReference: null,
      status: "open",
      createdAt: newer,
      updatedAt: newer,
      resolvedAt: null,
      resolvedBy: null,
    });
    repository.decisions.set("decision_1", {
      id: "decision_1",
      tenantId: ctx.tenantId,
      specId: first.data.id,
      question: "Ship?",
      decision: "Yes",
      decidedBy: ctx.userId,
      createdAt: older,
    });
    repository.assets.set("asset_1", {
      id: "asset_1",
      tenantId: ctx.tenantId,
      projectId,
      specId: first.data.id,
      kind: "image",
      fileName: "screen.png",
      contentType: "image/png",
      sizeBytes: 12,
      storageProvider: "local",
      storageKey: "screen.png",
      altText: null,
      caption: null,
      createdBy: ctx.userId,
      createdAt: older,
      updatedAt: older,
    });
    repository.specChecks.set("check_old", {
      id: "check_old",
      tenantId: ctx.tenantId,
      projectId,
      specId: first.data.id,
      status: "failed",
      summary: "Old failure",
      createdBy: ctx.userId,
      createdAt: older,
    });
    repository.specChecks.set("check_new", {
      id: "check_new",
      tenantId: ctx.tenantId,
      projectId,
      specId: first.data.id,
      status: "passed",
      summary: "Latest pass",
      createdBy: ctx.userId,
      createdAt: newer,
    });

    const summaries = await useCases.listSpecSummaries(ctx, { projectId });
    const firstSummary = summaries.data.find(
      (summary) => summary.spec.id === first.data.id,
    );
    const secondSummary = summaries.data.find(
      (summary) => summary.spec.id === second.data.id,
    );

    expect(firstSummary).toMatchObject({
      commentCount: 2,
      decisionCount: 1,
      assetCount: 1,
      latestCheck: {
        id: "check_new",
        status: "passed",
        summary: "Latest pass",
      },
      latestActivityAt: newer.toISOString(),
    });
    expect(secondSummary).toMatchObject({
      commentCount: 0,
      decisionCount: 0,
      assetCount: 0,
      latestCheck: null,
    });
    expect(secondSummary?.latestActivityAt).toBe(second.data.updatedAt);
  });
});
