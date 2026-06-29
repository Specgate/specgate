import type {
  ActivityDto,
  AgentContextDto,
  BuildCycleDto,
  BuildQueueItemDto,
  CommentDto,
  DecisionDto,
  GitSyncRecordDto,
  MilestoneDto,
  PreviewReviewDto,
  SpecCodeCheckDto,
  ProjectDto,
  SpecDto,
  SpecInput,
  SpecUpdate,
} from "@corely/contracts/specgate";
import type {
  Activity,
  BuildCycle,
  Comment,
  DemoState,
  Milestone,
  Project,
  RoadmapLane,
  Spec,
} from "@/types/demo";
import { users } from "./mock-data";

type ApiEnvelope<T> = { data: T };

const API_HEADERS = {
  "content-type": "application/json",
  "x-tenant-id": "tenant_demo",
  "x-user-id": "u-ha",
};

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/specgate${path}`, {
    ...init,
    headers: {
      ...API_HEADERS,
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      body?.error?.message ?? body?.detail ?? body?.title ?? response.statusText;
    throw new Error(detail);
  }
  return body as T;
}

const laneToUi = (lane: string): RoadmapLane =>
  lane === "now" ? "Now" : lane === "next" ? "Next" : lane === "later" ? "Later" : "Icebox";

export const laneToApi = (lane: RoadmapLane) => lane.toLowerCase() as "now" | "next" | "later" | "icebox";

const dateOnly = (value?: string | null) => (value ? value.slice(0, 10) : "");

const userName = (id?: string | null) => users.find((u) => u.id === id)?.name ?? id ?? "Someone";

function mapProject(project: ProjectDto): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
  };
}

function mapSpec(
  spec: SpecDto,
  options: {
    queueBySpecId: Map<string, BuildQueueItemDto>;
    latestPreviewBySpecId: Map<string, PreviewReviewDto>;
    decisionsBySpecId: Map<string, DecisionDto[]>;
  },
): Spec {
  const queueItem = options.queueBySpecId.get(spec.id);
  const preview = options.latestPreviewBySpecId.get(spec.id);
  const decisions = options.decisionsBySpecId.get(spec.id) ?? [];

  return {
    id: spec.specNumber,
    apiId: spec.id,
    projectId: spec.projectId,
    title: spec.title,
    status: spec.status,
    priority: spec.priority,
    roadmapLane: laneToUi(spec.roadmapLane),
    milestoneId: spec.targetMilestoneId ?? "",
    ownerId: spec.ownerId ?? spec.createdBy,
    assigneeId: spec.assigneeId ?? queueItem?.assignedTo ?? undefined,
    summary: spec.summary ?? spec.description ?? "",
    problem: spec.description ?? undefined,
    expectedBehavior: spec.uiNotes ?? undefined,
    acceptanceCriteria: spec.acceptanceCriteria,
    outOfScope: spec.outOfScope,
    technicalNotes: spec.technicalNotes ?? undefined,
    decisions: decisions.map((decision) => ({
      id: decision.id,
      text: `${decision.question}: ${decision.decision}`,
    })),
    relatedFiles: spec.relatedFiles,
    previewUrl: preview?.previewUrl ?? undefined,
    approvedAt: dateOnly(spec.approvedAt) || undefined,
    updatedAt: dateOnly(spec.updatedAt),
    buildCycleId: queueItem?.buildCycleId ?? spec.buildCycleId ?? undefined,
  };
}

function mapComment(comment: CommentDto, specNumberByApiId: Map<string, string>): Comment {
  return {
    id: comment.id,
    specId: specNumberByApiId.get(comment.specId) ?? comment.specId,
    authorId: comment.userId,
    text: comment.body,
    createdAt: dateOnly(comment.createdAt),
    resolved: comment.status === "resolved",
  };
}

function mapMilestone(milestone: MilestoneDto): Milestone {
  return {
    id: milestone.id,
    name: milestone.name,
    targetDate: dateOnly(milestone.targetDate),
  };
}

function mapBuildCycle(
  cycle: BuildCycleDto,
  queue: BuildQueueItemDto[],
  specNumberByApiId: Map<string, string>,
): BuildCycle {
  return {
    id: cycle.id,
    name: cycle.name,
    goal: cycle.goal ?? "",
    startDate: dateOnly(cycle.startDate),
    endDate: dateOnly(cycle.endDate),
    status: cycle.status === "cancelled" ? "completed" : cycle.status,
    specIds: queue
      .filter((item) => item.buildCycleId === cycle.id)
      .sort((a, b) => a.priorityRank - b.priorityRank)
      .map((item) => specNumberByApiId.get(item.specId) ?? item.specId),
  };
}

function mapActivity(activity: ActivityDto, specNumberByApiId: Map<string, string>): Activity {
  return {
    id: activity.id,
    text: activity.message,
    time: dateOnly(activity.createdAt),
    specId: activity.specId ? specNumberByApiId.get(activity.specId) ?? activity.specId : undefined,
  };
}

function latestPreviewBySpec(reviews: PreviewReviewDto[]) {
  const bySpec = new Map<string, PreviewReviewDto>();
  for (const review of reviews) {
    const current = bySpec.get(review.specId);
    if (!current || review.updatedAt > current.updatedAt) bySpec.set(review.specId, review);
  }
  return bySpec;
}

export function apiIdForSpec(spec: Spec): string {
  return spec.apiId ?? spec.id;
}

export async function resetAndSeedDemo() {
  await api<ApiEnvelope<{ reset: true }>>("/demo/reset", { method: "POST" });
  await api<ApiEnvelope<{ seeded: true; projectId: string }>>("/demo/seed", { method: "POST" });
}

export async function loadWorkspaceState(options: {
  mode: DemoState["mode"];
  currentProjectId?: string;
}): Promise<DemoState> {
  let projects = (await api<ApiEnvelope<ProjectDto[]>>("/projects")).data;
  if (projects.length === 0) {
    await resetAndSeedDemo();
    projects = (await api<ApiEnvelope<ProjectDto[]>>("/projects")).data;
  }

  const projectId =
    projects.find((project) => project.id === options.currentProjectId)?.id ??
    projects[0]?.id ??
    "";

  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const [specs, milestones, buildCycles, queue, reviews, activities] = await Promise.all([
    api<ApiEnvelope<SpecDto[]>>(`/specs${query}`).then((r) => r.data),
    api<ApiEnvelope<MilestoneDto[]>>(`/planning/milestones${query}`).then((r) => r.data),
    api<ApiEnvelope<BuildCycleDto[]>>(`/planning/build-cycles${query}`).then((r) => r.data),
    api<ApiEnvelope<BuildQueueItemDto[]>>(`/planning/build-queue${query}`).then((r) => r.data),
    api<ApiEnvelope<PreviewReviewDto[]>>(`/preview/reviews${query}`).then((r) => r.data),
    api<ApiEnvelope<ActivityDto[]>>(`/activity${query}`).then((r) => r.data),
  ]);

  const specNumberByApiId = new Map(specs.map((spec) => [spec.id, spec.specNumber]));
  const queueBySpecId = new Map(queue.map((item) => [item.specId, item]));
  const previewsBySpecId = latestPreviewBySpec(reviews);

  const [commentsBySpec, decisionsBySpec] = await Promise.all([
    Promise.all(
      specs.map(async (spec) => [
        spec.id,
        await api<ApiEnvelope<CommentDto[]>>(`/specs/${spec.id}/comments`).then((r) => r.data),
      ] as const),
    ),
    Promise.all(
      specs.map(async (spec) => [
        spec.id,
        await api<ApiEnvelope<DecisionDto[]>>(`/specs/${spec.id}/decisions`).then((r) => r.data),
      ] as const),
    ),
  ]);

  const decisionsBySpecId = new Map(decisionsBySpec);

  return {
    mode: options.mode,
    currentProjectId: projectId,
    projects: projects.map(mapProject),
    specs: specs.map((spec) =>
      mapSpec(spec, {
        queueBySpecId,
        latestPreviewBySpecId: previewsBySpecId,
        decisionsBySpecId,
      }),
    ),
    comments: commentsBySpec.flatMap(([, comments]) =>
      comments.map((comment) => mapComment(comment, specNumberByApiId)),
    ),
    activities: activities.map((activity) => mapActivity(activity, specNumberByApiId)),
    buildCycles: buildCycles.map((cycle) => mapBuildCycle(cycle, queue, specNumberByApiId)),
    milestones: milestones.map(mapMilestone),
  };
}

function toSpecUpdate(patch: Partial<Spec>): SpecUpdate {
  return {
    title: patch.title,
    summary: patch.summary,
    description: patch.problem,
    priority: patch.priority,
    roadmapLane: patch.roadmapLane ? laneToApi(patch.roadmapLane) : undefined,
    targetMilestoneId: patch.milestoneId,
    ownerId: patch.ownerId,
    assigneeId: patch.assigneeId,
    acceptanceCriteria: patch.acceptanceCriteria,
    outOfScope: patch.outOfScope,
    relatedFiles: patch.relatedFiles,
    technicalNotes: patch.technicalNotes,
    uiNotes: patch.expectedBehavior,
  };
}

export async function createSpec(projectId: string, spec: Spec) {
  const input: SpecInput = {
    projectId,
    title: spec.title,
    summary: spec.summary,
    description: spec.problem,
    priority: spec.priority,
    roadmapLane: laneToApi(spec.roadmapLane),
    targetMilestoneId: spec.milestoneId || null,
    ownerId: spec.ownerId || null,
    assigneeId: spec.assigneeId || null,
    acceptanceCriteria: spec.acceptanceCriteria,
    outOfScope: spec.outOfScope,
    relatedFiles: spec.relatedFiles ?? [],
    technicalNotes: spec.technicalNotes ?? null,
    uiNotes: spec.expectedBehavior ?? null,
  };
  return api<ApiEnvelope<SpecDto>>("/specs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSpec(spec: Spec, patch: Partial<Spec>) {
  return api<ApiEnvelope<SpecDto>>(`/specs/${apiIdForSpec(spec)}`, {
    method: "PATCH",
    body: JSON.stringify(toSpecUpdate(patch)),
  });
}

export async function moveSpecLane(spec: Spec, lane: RoadmapLane) {
  return api<ApiEnvelope<SpecDto>>("/planning/roadmap/move", {
    method: "POST",
    body: JSON.stringify({ specId: apiIdForSpec(spec), roadmapLane: laneToApi(lane) }),
  });
}

export async function addSpecComment(spec: Spec, body: string) {
  return api<ApiEnvelope<CommentDto>>(`/specs/${apiIdForSpec(spec)}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function runStatusAction(spec: Spec, status: Spec["status"]) {
  const specId = apiIdForSpec(spec);
  const method = "POST";
  if (status === "draft") return api(`/specs/${specId}/create-draft`, { method });
  if (status === "review") return api(`/specs/${specId}/move-to-review`, { method });
  if (status === "approved") return api(`/specs/${specId}/approve`, { method });
  if (status === "build_queue") {
    return api("/planning/build-queue/add", {
      method,
      body: JSON.stringify({ specId, priorityRank: 0 }),
    });
  }
  if (status === "in_development") return api(`/implementation/specs/${specId}/start`, { method });
  if (status === "developer_review") {
    return api(`/implementation/specs/${specId}/move-to-developer-review`, { method });
  }
  if (status === "preview") return api(`/implementation/specs/${specId}/approve-for-preview`, { method });
  if (status === "stakeholder_review") {
    return api(`/preview/specs/${specId}/send-to-stakeholder-review`, { method });
  }
  if (status === "accepted") return api(`/preview/specs/${specId}/approve`, { method });
  if (status === "done") return api(`/preview/specs/${specId}/mark-done`, { method });
  return updateSpec(spec, {});
}

export async function syncSpecToGit(spec: Spec) {
  return api<ApiEnvelope<GitSyncRecordDto>>(`/agent/specs/${apiIdForSpec(spec)}/sync-git`, {
    method: "POST",
  });
}

export async function generateAgentContextForSpec(spec: Spec) {
  return api<ApiEnvelope<AgentContextDto>>(`/agent/specs/${apiIdForSpec(spec)}/contexts`, {
    method: "POST",
    body: JSON.stringify({ targetAgent: "generic" }),
  });
}

export async function runSpecCodeCheckForSpec(spec: Spec) {
  return api<ApiEnvelope<SpecCodeCheckDto>>(`/agent/specs/${apiIdForSpec(spec)}/run-spec-check`, {
    method: "POST",
  });
}

export async function addPreviewUrlForSpec(spec: Spec, previewUrl: string) {
  return api<ApiEnvelope<PreviewReviewDto>>(`/preview/specs/${apiIdForSpec(spec)}/add-url`, {
    method: "POST",
    body: JSON.stringify({ previewUrl, environment: "staging" }),
  });
}

export async function commentOnPreview(spec: Spec, feedback: string) {
  return api<ApiEnvelope<PreviewReviewDto>>(`/preview/specs/${apiIdForSpec(spec)}/comment`, {
    method: "POST",
    body: JSON.stringify({ feedback }),
  });
}

export async function rejectPreview(spec: Spec, reason: string) {
  return api<ApiEnvelope<PreviewReviewDto>>(`/preview/specs/${apiIdForSpec(spec)}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function suggestRoadmapPlan(projectId: string) {
  return api<ApiEnvelope<{ summary: string }>>(
    `/planning/roadmap/suggest?projectId=${encodeURIComponent(projectId)}`,
    { method: "POST" },
  );
}

export async function summarizeBuildCycle(buildCycleId: string) {
  return api<ApiEnvelope<{ specCount: number }>>(
    `/planning/build-cycles/${buildCycleId}/summary`,
    { method: "POST" },
  );
}
