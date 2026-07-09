import type {
  ActivityDto,
  AgentContextDto,
  BuildCycleDto,
  BuildQueueItemDto,
  CommentDto,
  DecisionDto,
  GitSyncRecordDto,
  ImplementationRecordDto,
  MilestoneDto,
  PreviewReviewDto,
  ProjectDto,
  SpecAssetDto,
  SpecCodeCheckDto,
  SpecCheckSummaryDto,
  SpecDto,
  SpecInput,
  SpecListSummaryDto,
  SpecUpdate,
  WorkspaceDto,
  AgentTargetDto,
  AgentReadinessCheckDto,
} from "@corely/contracts/specgate";
import type {
  Activity,
  BuildCycle,
  Comment,
  Decision,
  DemoState,
  Milestone,
  PreviewReview,
  Project,
  RoadmapLane,
  Spec,
  SpecAsset,
  SpecCheck,
  Workspace,
} from "@/types/specgate";
import { getUserDisplay } from "./reference-data";

type ApiEnvelope<T> = { data: T };

const API_HEADERS = {
  "x-tenant-id": "tenant_demo",
  "x-user-id": "u-ha",
};

function buildHeaders(init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {});
  for (const [key, value] of Object.entries(API_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  if (!(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return headers;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/specgate${path}`, {
    ...init,
    headers: buildHeaders(init),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      body?.error?.message ?? body?.detail ?? body?.title ?? response.statusText;
    throw new Error(detail);
  }
  return body as T;
}

async function apiOrNull<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const response = await fetch(`/api/specgate${path}`, {
    ...init,
    headers: buildHeaders(init),
  });
  if (response.status === 404) return null;
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

export const laneToApi = (lane: RoadmapLane) =>
  lane.toLowerCase() as "now" | "next" | "later" | "icebox";

const dateOnly = (value?: string | null) => (value ? value.slice(0, 10) : "");

function mapWorkspace(workspace: WorkspaceDto): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug ?? undefined,
  };
}

function mapProject(project: ProjectDto): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    workspaceId: project.workspaceId,
  };
}

function mapSpecAsset(asset: SpecAssetDto): SpecAsset {
  return {
    id: asset.id,
    specId: asset.specId,
    projectId: asset.projectId,
    kind: asset.kind,
    fileName: asset.fileName,
    contentType: asset.contentType,
    sizeBytes: asset.sizeBytes,
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
    url: asset.signedUrl ?? asset.publicUrl ?? null,
    publicUrl: asset.publicUrl ?? null,
    signedUrl: asset.signedUrl ?? null,
    altText: asset.altText ?? null,
    caption: asset.caption ?? null,
    createdBy: asset.createdBy,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

function mapDecision(decision: DecisionDto, specNumberByApiId: Map<string, string>): Decision {
  return {
    id: decision.id,
    specId: specNumberByApiId.get(decision.specId) ?? decision.specId,
    question: decision.question,
    text: `${decision.question}: ${decision.decision}`,
    decision: decision.decision,
    decidedBy: decision.decidedBy,
    createdAt: decision.createdAt,
  };
}

function normalizeSpecCheckStatus(status: string): SpecCheck["status"] {
  const value = status.toLowerCase();
  if (value.includes("pass")) return "passed";
  if (value.includes("warning") || value.includes("mismatch")) return "warning";
  return "failed";
}

function mapSpecCheck(
  dto: SpecCodeCheckDto | SpecCheckSummaryDto,
  specNumberByApiId: Map<string, string>,
): SpecCheck {
  const details =
    "mismatchFindings" in dto
      ? dto.mismatchFindings.map((finding) =>
          `${finding.severity}: ${finding.message}${finding.file ? ` (${finding.file})` : ""}`,
        )
      : [];
  return {
    id: dto.id,
    specId: specNumberByApiId.get(dto.specId) ?? dto.specId,
    status: normalizeSpecCheckStatus(dto.status),
    summary: dto.summary,
    details,
    createdAt: dto.createdAt,
  };
}

function mapPreviewReview(review: PreviewReviewDto, specNumberByApiId: Map<string, string>): PreviewReview {
  return {
    id: review.id,
    specId: specNumberByApiId.get(review.specId) ?? review.specId,
    previewUrl: review.previewUrl ?? null,
    status: review.status,
    environment: review.environment,
    feedback: review.feedback ?? null,
    rejectionReason: review.rejectionReason ?? null,
    reviewedBy: review.reviewedBy ?? null,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function mapSpec(
  spec: SpecDto,
  options: {
    queueBySpecId: Map<string, BuildQueueItemDto>;
    latestPreviewBySpecId: Map<string, PreviewReviewDto>;
    decisionsBySpecId: Map<string, DecisionDto[]>;
    latestSpecCheckBySpecId: Map<string, SpecCheck>;
    summariesBySpecId?: Map<string, SpecListSummaryDto>;
  },
): Spec {
  const queueItem = options.queueBySpecId.get(spec.id);
  const preview = options.latestPreviewBySpecId.get(spec.id);
  const latestSpecCheck = options.latestSpecCheckBySpecId.get(spec.id) ?? null;
  const decisions = options.decisionsBySpecId.get(spec.id) ?? [];
  const summary = options.summariesBySpecId?.get(spec.id);

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
    summary: spec.summary ?? "",
    audience: spec.audience ?? undefined,
    background: spec.description ?? spec.summary ?? undefined,
    desiredOutcome: spec.description ?? spec.summary ?? undefined,
    acceptanceCriteria: spec.acceptanceCriteria,
    outOfScope: spec.outOfScope,
    openQuestions: spec.openQuestions ?? [],
    technicalNotes: spec.technicalNotes ?? undefined,
    uiNotes: spec.uiNotes ?? undefined,
    decisions: decisions.map((decision) => mapDecision(decision, new Map([[spec.id, spec.specNumber]]))),
    commentCount: summary?.commentCount,
    decisionCount: summary?.decisionCount,
    assetCount: summary?.assetCount,
    latestActivityAt: summary?.latestActivityAt,
    relatedFiles: spec.relatedFiles,
    previewUrl: preview?.previewUrl ?? undefined,
    warning:
      latestSpecCheck && latestSpecCheck.status !== "passed"
        ? latestSpecCheck.summary
        : undefined,
    latestSpecCheck,
    approvedAt: dateOnly(spec.approvedAt) || undefined,
    updatedAt: dateOnly(summary?.latestActivityAt ?? spec.updatedAt),
    buildCycleId: queueItem?.buildCycleId ?? spec.buildCycleId ?? undefined,
  };
}

function mapComment(comment: CommentDto, specNumberByApiId: Map<string, string>): Comment {
  return {
    id: comment.id,
    specId: specNumberByApiId.get(comment.specId) ?? comment.specId,
    authorId: comment.userId,
    text: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    sectionReference: comment.sectionReference ?? null,
    status: comment.status,
    resolved: comment.status === "resolved",
    resolvedAt: comment.resolvedAt ?? null,
    resolvedBy: comment.resolvedBy ?? null,
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

export function getUserName(userId?: string | null) {
  return getUserDisplay(userId)?.name ?? userId ?? "Someone";
}

export async function resetAndSeedDemo() {
  await api<ApiEnvelope<{ reset: true }>>("/demo/reset", { method: "POST" });
  await api<ApiEnvelope<{ seeded: true; projectId: string }>>("/demo/seed", { method: "POST" });
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const result = await api<ApiEnvelope<WorkspaceDto>>("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return mapWorkspace(result.data);
}

export async function createProject(name: string, workspaceId?: string): Promise<Project> {
  const result = await api<ApiEnvelope<ProjectDto>>("/projects", {
    method: "POST",
    body: JSON.stringify({ name, workspaceId }),
  });
  return mapProject(result.data);
}

export async function loadWorkspaceState(options: {
  mode: DemoState["mode"];
  currentProjectId?: string;
  currentWorkspaceId?: string;
}): Promise<DemoState> {
  let [workspaces, projects] = await Promise.all([
    api<ApiEnvelope<WorkspaceDto[]>>("/workspaces").then((r) => r.data),
    api<ApiEnvelope<ProjectDto[]>>("/projects").then((r) => r.data),
  ]);

  if (projects.length === 0) {
    await resetAndSeedDemo();
    workspaces = (await api<ApiEnvelope<WorkspaceDto[]>>("/workspaces")).data;
    projects = (await api<ApiEnvelope<ProjectDto[]>>("/projects")).data;
  }

  const workspaceId =
    workspaces.find((w) => w.id === options.currentWorkspaceId)?.id ??
    projects.find((p) => p.id === options.currentProjectId)?.workspaceId ??
    workspaces[0]?.id ??
    "";

  const projectId =
    projects.find((project) => project.id === options.currentProjectId)?.id ??
    projects.find((project) => project.workspaceId === workspaceId)?.id ??
    projects[0]?.id ??
    "";

  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const loadStartedAt =
    process.env.NODE_ENV === "development" && typeof performance !== "undefined"
      ? performance.now()
      : null;
  const [specSummaries, milestones, buildCycles, queue, reviews, activities] = await Promise.all([
    api<ApiEnvelope<SpecListSummaryDto[]>>(`/specs/summary${query}`).then((r) => r.data),
    api<ApiEnvelope<MilestoneDto[]>>(`/planning/milestones${query}`).then((r) => r.data),
    api<ApiEnvelope<BuildCycleDto[]>>(`/planning/build-cycles${query}`).then((r) => r.data),
    api<ApiEnvelope<BuildQueueItemDto[]>>(`/planning/build-queue${query}`).then((r) => r.data),
    api<ApiEnvelope<PreviewReviewDto[]>>(`/preview/reviews${query}`).then((r) => r.data),
    api<ApiEnvelope<ActivityDto[]>>(`/activity${query}`).then((r) => r.data),
  ]);

  const specs = specSummaries.map((summary) => summary.spec);
  const specNumberByApiId = new Map(specs.map((spec) => [spec.id, spec.specNumber]));
  const queueBySpecId = new Map(queue.map((item) => [item.specId, item]));
  const previewsBySpecId = latestPreviewBySpec(reviews);
  const summariesBySpecId = new Map(specSummaries.map((summary) => [summary.spec.id, summary]));
  const decisionsBySpecId = new Map<string, DecisionDto[]>();
  const latestSpecCheckBySpecId = new Map(
    specSummaries
      .filter((summary) => summary.latestCheck)
      .map((summary) => [
        summary.spec.id,
        mapSpecCheck(summary.latestCheck as SpecCheckSummaryDto, specNumberByApiId),
      ]),
  );
  if (loadStartedAt !== null) {
    console.debug(
      `[SpecGate] workspace list loaded with 1 spec summary request in ${Math.round(
        performance.now() - loadStartedAt,
      )}ms`,
    );
  }

  return {
    mode: options.mode,
    currentWorkspaceId: workspaceId,
    currentProjectId: projectId,
    workspaces: workspaces.map(mapWorkspace),
    projects: projects.map(mapProject),
    specs: specs.map((spec) =>
      mapSpec(spec, {
        queueBySpecId,
        latestPreviewBySpecId: previewsBySpecId,
        decisionsBySpecId,
        latestSpecCheckBySpecId,
        summariesBySpecId,
      }),
    ),
    comments: [],
    decisions: [],
    assets: [],
    specChecks: Array.from(latestSpecCheckBySpecId.values()),
    previewReviews: reviews.map((review) => mapPreviewReview(review, specNumberByApiId)),
    activities: activities.map((activity) => mapActivity(activity, specNumberByApiId)),
    buildCycles: buildCycles.map((cycle) => mapBuildCycle(cycle, queue, specNumberByApiId)),
    milestones: milestones.map(mapMilestone),
  };
}

function toSpecUpdate(patch: Partial<Spec>): SpecUpdate {
  return {
    title: patch.title,
    summary: patch.summary,
    audience: patch.audience,
    description: patch.desiredOutcome ?? patch.background,
    priority: patch.priority,
    roadmapLane: patch.roadmapLane ? laneToApi(patch.roadmapLane) : undefined,
    targetMilestoneId: patch.milestoneId,
    ownerId: patch.ownerId,
    assigneeId: patch.assigneeId,
    acceptanceCriteria: patch.acceptanceCriteria,
    outOfScope: patch.outOfScope,
    openQuestions: patch.openQuestions,
    relatedFiles: patch.relatedFiles,
    technicalNotes: patch.technicalNotes,
    uiNotes: patch.uiNotes,
  };
}

export async function createSpec(projectId: string, spec: Spec) {
  const input: SpecInput = {
    projectId,
    title: spec.title,
    summary: spec.summary,
    audience: spec.audience ?? null,
    description: spec.desiredOutcome ?? spec.background ?? spec.summary,
    priority: spec.priority,
    roadmapLane: laneToApi(spec.roadmapLane),
    targetMilestoneId: spec.milestoneId || null,
    ownerId: spec.ownerId || null,
    assigneeId: spec.assigneeId || null,
    acceptanceCriteria: spec.acceptanceCriteria,
    outOfScope: spec.outOfScope,
    openQuestions: spec.openQuestions,
    relatedFiles: spec.relatedFiles ?? [],
    technicalNotes: spec.technicalNotes ?? null,
    uiNotes: spec.uiNotes ?? null,
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

export async function addSpecComment(spec: Spec, body: string, sectionReference?: string | null) {
  return api<ApiEnvelope<CommentDto>>(`/specs/${apiIdForSpec(spec)}/comments`, {
    method: "POST",
    body: JSON.stringify({ body, sectionReference: sectionReference ?? null }),
  });
}

export async function resolveComment(commentId: string) {
  return api<ApiEnvelope<CommentDto>>(`/comments/${commentId}/resolve`, { method: "POST" });
}

export async function dismissComment(commentId: string) {
  return api<ApiEnvelope<CommentDto>>(`/comments/${commentId}/dismiss`, { method: "POST" });
}

export async function addDecision(spec: Spec, question: string, decision: string) {
  return api<ApiEnvelope<DecisionDto>>(`/specs/${apiIdForSpec(spec)}/decisions`, {
    method: "POST",
    body: JSON.stringify({ question, decision }),
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

export async function generateAgentContextForSpec(spec: Spec, targetAgentId: string = "generic_markdown") {
  return api<ApiEnvelope<{ markdown: string }>>(`/agent/specs/${apiIdForSpec(spec)}/contexts`, {
    method: "POST",
    body: JSON.stringify({ targetAgent: { id: targetAgentId, label: targetAgentId } }),
  });
}

export async function getLatestAgentContextForSpec(spec: Spec) {
  return apiOrNull<ApiEnvelope<AgentContextDto>>(`/agent/specs/${apiIdForSpec(spec)}/contexts/latest`);
}

export async function getAgentTargets() {
  return api<ApiEnvelope<AgentTargetDto[]>>(`/agent-targets`);
}

export async function getProjectAgentReadiness(projectId: string) {
  return api<ApiEnvelope<AgentReadinessCheckDto>>(`/projects/${projectId}/readiness`);
}

export async function getSpecAgentReadiness(spec: Spec) {
  return api<ApiEnvelope<AgentReadinessCheckDto>>(`/specs/${apiIdForSpec(spec)}/readiness`);
}

export async function runSpecCodeCheckForSpec(spec: Spec) {
  return api<ApiEnvelope<SpecCodeCheckDto>>(`/agent/specs/${apiIdForSpec(spec)}/run-spec-check`, {
    method: "POST",
  });
}

export async function getLatestSpecCheckForSpec(spec: Spec) {
  return apiOrNull<ApiEnvelope<SpecCodeCheckDto>>(`/agent/specs/${apiIdForSpec(spec)}/spec-checks/latest`);
}

export async function getSpecRelatedData(spec: Spec) {
  const specNumberByApiId = new Map([[apiIdForSpec(spec), spec.id]]);
  const [comments, decisions, assets, latestCheck] = await Promise.all([
    api<ApiEnvelope<CommentDto[]>>(`/specs/${apiIdForSpec(spec)}/comments`).then((r) => r.data),
    api<ApiEnvelope<DecisionDto[]>>(`/specs/${apiIdForSpec(spec)}/decisions`).then((r) => r.data),
    api<ApiEnvelope<SpecAssetDto[]>>(`/specs/${apiIdForSpec(spec)}/assets`).then((r) => r.data),
    getLatestSpecCheckForSpec(spec).then((r) => r?.data ?? null),
  ]);
  return {
    comments: comments.map((comment) => mapComment(comment, specNumberByApiId)),
    decisions: decisions.map((decision) => mapDecision(decision, specNumberByApiId)),
    assets: assets.map(mapSpecAsset),
    latestCheck: latestCheck ? mapSpecCheck(latestCheck, specNumberByApiId) : null,
  };
}

export async function getSpecAssets(spec: Spec) {
  return api<ApiEnvelope<SpecAssetDto[]>>(`/specs/${apiIdForSpec(spec)}/assets`);
}

export async function uploadSpecImage(
  spec: Spec,
  file: File,
  metadata?: { altText?: string | null; caption?: string | null },
) {
  const formData = new FormData();
  formData.set("file", file);
  if (metadata?.altText) formData.set("altText", metadata.altText);
  if (metadata?.caption) formData.set("caption", metadata.caption);
  return api<ApiEnvelope<{ asset: SpecAssetDto }>>(`/specs/${apiIdForSpec(spec)}/assets`, {
    method: "POST",
    body: formData,
  });
}

export async function updateSpecAsset(
  spec: Spec,
  assetId: string,
  metadata: { altText?: string | null; caption?: string | null },
) {
  return api<ApiEnvelope<SpecAssetDto>>(`/specs/${apiIdForSpec(spec)}/assets/${assetId}`, {
    method: "PATCH",
    body: JSON.stringify(metadata),
  });
}

export async function deleteSpecAsset(spec: Spec, assetId: string) {
  return api<ApiEnvelope<{ deleted: true }>>(`/specs/${apiIdForSpec(spec)}/assets/${assetId}`, {
    method: "DELETE",
  });
}

export async function addPreviewUrlForSpec(spec: Spec, previewUrl: string) {
  return api<ApiEnvelope<PreviewReviewDto>>(`/preview/specs/${apiIdForSpec(spec)}/add-url`, {
    method: "POST",
    body: JSON.stringify({ previewUrl, environment: "staging" }),
  });
}

export async function linkImplementationBranchForSpec(spec: Spec, branchName: string) {
  return api<ApiEnvelope<ImplementationRecordDto>>(
    `/implementation/specs/${apiIdForSpec(spec)}/link-branch`,
    {
      method: "POST",
      body: JSON.stringify({ branchName }),
    },
  );
}

export async function linkImplementationPullRequestForSpec(spec: Spec, pullRequestUrl: string) {
  return api<ApiEnvelope<ImplementationRecordDto>>(
    `/implementation/specs/${apiIdForSpec(spec)}/link-pr`,
    {
      method: "POST",
      body: JSON.stringify({ pullRequestUrl }),
    },
  );
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
