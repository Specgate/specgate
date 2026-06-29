import { expect, test, type APIRequestContext } from "@playwright/test";

type ApiBody<T> = {
  data: T;
};

type SpecDto = {
  id: string;
  projectId: string;
  specNumber: string;
  title: string;
  status: string;
  priority: string;
  roadmapLane: string;
  acceptanceCriteria: string[];
  outOfScope: string[];
};

test.describe("SpecGate API", () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post("/api/specgate/demo/seed");
    if (!response.ok()) {
      throw new Error(`Seed failed (${response.status()}): ${await response.text()}`);
    }
  });

  test("seeds demo project and lists roadmap specs", async ({ request }) => {
    const projectsResponse = await request.get("/api/specgate/projects");
    expect(projectsResponse.ok()).toBeTruthy();

    const projects = (await projectsResponse.json()) as ApiBody<
      Array<{ id: string; name: string; slug: string }>
    >;
    expect(projects.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "LaunchOS", slug: "launchos" }),
      ]),
    );

    const roadmapResponse = await request.get(
      `/api/specgate/planning/roadmap?projectId=${projects.data[0].id}`,
    );
    expect(roadmapResponse.ok()).toBeTruthy();

    const roadmap = (await roadmapResponse.json()) as ApiBody<{
      now: SpecDto[];
      next: SpecDto[];
      later: SpecDto[];
      icebox: SpecDto[];
    }>;
    expect(roadmap.data.now.map((spec) => spec.specNumber)).toEqual(
      expect.arrayContaining(["REQ-001", "REQ-002", "REQ-003"]),
    );
    expect(roadmap.data.icebox.map((spec) => spec.specNumber)).toContain(
      "REQ-007",
    );
  });

  test("enforces approval before agent handoff", async ({ request }) => {
    const specs = await listSpecs(request);
    const reviewSpec = specs.find((spec) => spec.specNumber === "REQ-005");
    const approvedSpec = specs.find((spec) => spec.specNumber === "REQ-002");
    expect(reviewSpec).toBeTruthy();
    expect(approvedSpec).toBeTruthy();

    const blocked = await request.post(
      `/api/specgate/agent/specs/${reviewSpec!.id}/contexts`,
      { data: { targetAgent: "cursor" } },
    );
    expect(blocked.status()).toBe(409);
    await expectErrorType(blocked, "conflict");

    const generated = await request.post(
      `/api/specgate/agent/specs/${approvedSpec!.id}/contexts`,
      { data: { targetAgent: "cursor" } },
    );
    expect(generated.ok()).toBeTruthy();
    const body = (await generated.json()) as ApiBody<{
      targetAgent: string;
      markdown: string;
      contextJson: { outOfScope: string[] };
    }>;
    expect(body.data.targetAgent).toBe("cursor");
    expect(body.data.markdown).toContain("Invite link expires after 14 days.");
    expect(body.data.contextJson.outOfScope).toContain("Bulk invite");
  });

  test("returns deterministic spec-code mismatch for REQ-002", async ({
    request,
  }) => {
    const req002 = (await listSpecs(request)).find(
      (spec) => spec.specNumber === "REQ-002",
    );
    expect(req002).toBeTruthy();

    const response = await request.post(
      `/api/specgate/agent/specs/${req002!.id}/run-spec-check`,
    );
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as ApiBody<{
      status: string;
      mismatchFindings: Array<{ message: string; severity: string }>;
    }>;
    expect(body.data.status).toBe("mismatch_found");
    expect(body.data.mismatchFindings[0].message).toContain("14 days");
  });

  test("requires preview acceptance before done", async ({ request }) => {
    const req002 = (await listSpecs(request)).find(
      (spec) => spec.specNumber === "REQ-002",
    );
    expect(req002?.status).toBe("stakeholder_review");

    const blocked = await request.post(
      `/api/specgate/preview/specs/${req002!.id}/mark-done`,
    );
    expect(blocked.status()).toBe(409);
    await expectErrorType(blocked, "conflict");

    const approved = await request.post(
      `/api/specgate/preview/specs/${req002!.id}/approve`,
    );
    expect(approved.ok()).toBeTruthy();

    const done = await request.post(
      `/api/specgate/preview/specs/${req002!.id}/mark-done`,
    );
    expect(done.ok()).toBeTruthy();
    const body = (await done.json()) as ApiBody<SpecDto>;
    expect(body.data.status).toBe("done");
  });

  test("validates approval requirements for new specs", async ({ request }) => {
    const project = (await (
      await request.get("/api/specgate/projects")
    ).json()) as ApiBody<Array<{ id: string }>>;

    const createdResponse = await request.post("/api/specgate/specs", {
      data: {
        projectId: project.data[0].id,
        title: "E2E Approval Guard",
        summary: "A deliberately incomplete spec.",
      },
    });
    expect(createdResponse.ok()).toBeTruthy();
    const created = (await createdResponse.json()) as ApiBody<SpecDto>;
    expect(created.data.priority).toBe("medium");
    expect(created.data.roadmapLane).toBe("icebox");

    const draft = await request.post(
      `/api/specgate/specs/${created.data.id}/create-draft`,
    );
    expect(draft.ok()).toBeTruthy();
    const review = await request.post(
      `/api/specgate/specs/${created.data.id}/move-to-review`,
    );
    expect(review.ok()).toBeTruthy();

    const approval = await request.post(
      `/api/specgate/specs/${created.data.id}/approve`,
    );
    expect(approval.status()).toBe(400);
    await expectErrorType(approval, "validation");
  });
});

async function listSpecs(request: APIRequestContext) {
  const response = await request.get("/api/specgate/specs");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as ApiBody<SpecDto[]>;
  return body.data;
}

async function expectErrorType(response: { json(): Promise<unknown> }, type: string) {
  const body = (await response.json()) as {
    error: { type: string; message: string };
  };
  expect(body.error.type).toBe(type);
}
