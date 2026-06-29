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
});
