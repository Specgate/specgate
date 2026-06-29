import type { RoadmapLane, SpecListQuery } from "@corely/contracts/specgate";
import type {
  CommentRecord,
  DecisionRecord,
  ProjectRecord,
  SpecRecord,
  SpecVersionRecord,
} from "../domain/entities/spec";
import type {
  ProjectPatch,
  SpecsRepositoryPort,
} from "../application/ports/specs-repository.port";

export class InMemorySpecsRepository implements SpecsRepositoryPort {
  projects = new Map<string, ProjectRecord>();
  specs = new Map<string, SpecRecord>();
  versions = new Map<string, SpecVersionRecord>();
  comments = new Map<string, CommentRecord>();
  decisions = new Map<string, DecisionRecord>();

  async listProjects(tenantId: string) {
    return [...this.projects.values()].filter(
      (project) => project.tenantId === tenantId,
    );
  }
  async findProject(tenantId: string, projectId: string) {
    const project = this.projects.get(projectId);
    return project?.tenantId === tenantId ? project : null;
  }
  async findProjectBySlug(tenantId: string, slug: string) {
    return (
      [...this.projects.values()].find(
        (project) => project.tenantId === tenantId && project.slug === slug,
      ) || null
    );
  }
  async createProject(project: ProjectRecord) {
    this.projects.set(project.id, project);
  }
  async updateProject(
    tenantId: string,
    projectId: string,
    patch: ProjectPatch,
  ) {
    const project = await this.findProject(tenantId, projectId);
    if (!project) return null;
    const updated = { ...project, ...patch, updatedAt: new Date() };
    this.projects.set(projectId, updated);
    return updated;
  }
  async listSpecs(tenantId: string, query: SpecListQuery) {
    return [...this.specs.values()].filter(
      (spec) =>
        spec.tenantId === tenantId &&
        (!query.projectId || spec.projectId === query.projectId) &&
        (!query.status || spec.status === query.status) &&
        (!query.roadmapLane || spec.roadmapLane === query.roadmapLane) &&
        (!query.priority || spec.priority === query.priority) &&
        (!query.buildCycleId || spec.buildCycleId === query.buildCycleId),
    );
  }
  async findSpec(tenantId: string, specId: string) {
    const spec = this.specs.get(specId);
    return spec?.tenantId === tenantId ? spec : null;
  }
  async findSpecByNumber(
    tenantId: string,
    projectId: string,
    specNumber: string,
  ) {
    return (
      [...this.specs.values()].find(
        (spec) =>
          spec.tenantId === tenantId &&
          spec.projectId === projectId &&
          spec.specNumber === specNumber,
      ) || null
    );
  }
  async createSpec(spec: SpecRecord) {
    this.specs.set(spec.id, spec);
  }
  async updateSpec(
    tenantId: string,
    specId: string,
    patch: Partial<SpecRecord>,
  ) {
    const spec = await this.findSpec(tenantId, specId);
    if (!spec) return null;
    const updated = { ...spec, ...patch };
    this.specs.set(specId, updated);
    return updated;
  }
  async nextSpecNumber(tenantId: string, projectId: string) {
    return `REQ-${String([...this.specs.values()].filter((spec) => spec.tenantId === tenantId && spec.projectId === projectId).length + 1).padStart(3, "0")}`;
  }
  async listSpecsByLane(tenantId: string, projectId?: string) {
    const lanes: Record<RoadmapLane, SpecRecord[]> = {
      now: [],
      next: [],
      later: [],
      icebox: [],
    };
    for (const spec of [...this.specs.values()].filter(
      (item) =>
        item.tenantId === tenantId &&
        (!projectId || item.projectId === projectId),
    )) {
      lanes[spec.roadmapLane].push(spec);
    }
    return lanes;
  }
  async createVersion(version: SpecVersionRecord) {
    this.versions.set(version.id, version);
  }
  async countVersions(tenantId: string, specId: string) {
    return [...this.versions.values()].filter(
      (version) => version.tenantId === tenantId && version.specId === specId,
    ).length;
  }
  async listComments(tenantId: string, specId: string) {
    return [...this.comments.values()].filter(
      (comment) => comment.tenantId === tenantId && comment.specId === specId,
    );
  }
  async findComment(tenantId: string, commentId: string) {
    const comment = this.comments.get(commentId);
    return comment?.tenantId === tenantId ? comment : null;
  }
  async createComment(comment: CommentRecord) {
    this.comments.set(comment.id, comment);
  }
  async updateComment(
    tenantId: string,
    commentId: string,
    patch: Partial<CommentRecord>,
  ) {
    const comment = await this.findComment(tenantId, commentId);
    if (!comment) return null;
    const updated = { ...comment, ...patch };
    this.comments.set(commentId, updated);
    return updated;
  }
  async listDecisions(tenantId: string, specId: string) {
    return [...this.decisions.values()].filter(
      (decision) =>
        decision.tenantId === tenantId && decision.specId === specId,
    );
  }
  async createDecision(decision: DecisionRecord) {
    this.decisions.set(decision.id, decision);
  }
}
