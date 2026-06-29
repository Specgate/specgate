import type {
  CommentRecord,
  DecisionRecord,
  ProjectRecord,
  SpecAssetRecord,
  SpecRecord,
  SpecVersionRecord,
} from "../../domain/entities/spec";
import type {
  RoadmapLane,
  ProjectInput,
  SpecListQuery,
} from "@corely/contracts/specgate";

export type ProjectPatch = Partial<Omit<ProjectInput, "slug">> & {
  slug?: string;
};

export interface SpecsRepositoryPort {
  listProjects(tenantId: string): Promise<ProjectRecord[]>;
  findProject(
    tenantId: string,
    projectId: string,
  ): Promise<ProjectRecord | null>;
  findProjectBySlug(
    tenantId: string,
    slug: string,
  ): Promise<ProjectRecord | null>;
  createProject(project: ProjectRecord): Promise<void>;
  updateProject(
    tenantId: string,
    projectId: string,
    patch: ProjectPatch,
  ): Promise<ProjectRecord | null>;

  listSpecs(tenantId: string, query: SpecListQuery): Promise<SpecRecord[]>;
  findSpec(tenantId: string, specId: string): Promise<SpecRecord | null>;
  findSpecByNumber(
    tenantId: string,
    projectId: string,
    specNumber: string,
  ): Promise<SpecRecord | null>;
  createSpec(spec: SpecRecord): Promise<void>;
  updateSpec(
    tenantId: string,
    specId: string,
    patch: Partial<SpecRecord>,
  ): Promise<SpecRecord | null>;
  nextSpecNumber(tenantId: string, projectId: string): Promise<string>;
  listSpecsByLane(
    tenantId: string,
    projectId?: string,
  ): Promise<Record<RoadmapLane, SpecRecord[]>>;

  createVersion(version: SpecVersionRecord): Promise<void>;
  countVersions(tenantId: string, specId: string): Promise<number>;

  listComments(tenantId: string, specId: string): Promise<CommentRecord[]>;
  findComment(
    tenantId: string,
    commentId: string,
  ): Promise<CommentRecord | null>;
  createComment(comment: CommentRecord): Promise<void>;
  updateComment(
    tenantId: string,
    commentId: string,
    patch: Partial<CommentRecord>,
  ): Promise<CommentRecord | null>;

  listDecisions(tenantId: string, specId: string): Promise<DecisionRecord[]>;
  createDecision(decision: DecisionRecord): Promise<void>;
  listSpecAssets(tenantId: string, specId: string): Promise<SpecAssetRecord[]>;
  findSpecAsset(
    tenantId: string,
    assetId: string,
  ): Promise<SpecAssetRecord | null>;
  createSpecAsset(asset: SpecAssetRecord): Promise<void>;
  updateSpecAsset(
    tenantId: string,
    assetId: string,
    patch: Partial<SpecAssetRecord>,
  ): Promise<SpecAssetRecord | null>;
  deleteSpecAsset(tenantId: string, assetId: string): Promise<void>;
}

export interface ActivityPublisherPort {
  publish(event: {
    tenantId: string;
    projectId: string;
    specId?: string | null;
    actorId: string;
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}
