import type {
  ApprovedSpecSnapshot,
  CommentDto,
  DecisionDto,
  ProjectDto,
  SpecAssetDto,
  SpecCheckSummaryDto,
  SpecDto,
  SpecVersionDto,
} from "@corely/contracts/specgate";
import type {
  CommentRecord,
  DecisionRecord,
  ProjectRecord,
  SpecAssetRecord,
  SpecCodeCheckSummaryRecord,
  SpecRecord,
  SpecVersionRecord,
} from "../domain/entities/spec";

const iso = (value: Date | null): string | null =>
  value ? value.toISOString() : null;

export function mapProject(row: ProjectRecord): ProjectDto {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSpec(row: SpecRecord): SpecDto {
  return {
    ...row,
    approvedAt: iso(row.approvedAt),
    acceptedAt: iso(row.acceptedAt),
    doneAt: iso(row.doneAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapApprovedSnapshot(row: SpecRecord): ApprovedSpecSnapshot {
  const dto = mapSpec(row);
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    projectId: dto.projectId,
    specNumber: dto.specNumber,
    title: dto.title,
    summary: dto.summary,
    audience: dto.audience,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    roadmapLane: dto.roadmapLane,
    assigneeId: dto.assigneeId,
    acceptanceCriteria: dto.acceptanceCriteria,
    outOfScope: dto.outOfScope,
    openQuestions: dto.openQuestions,
    relatedFiles: dto.relatedFiles,
    technicalNotes: dto.technicalNotes,
    uiNotes: dto.uiNotes,
    background: dto.background,
    currentBehavior: dto.currentBehavior,
    desiredOutcome: dto.desiredOutcome,
    edgeCases: dto.edgeCases,
    securityNotes: dto.securityNotes,
    suggestedSearchTerms: dto.suggestedSearchTerms,
    verificationPlan: dto.verificationPlan,
    approvedBy: dto.approvedBy,
    approvedAt: dto.approvedAt,
  };
}

export function mapVersion(row: SpecVersionRecord): SpecVersionDto {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export function mapComment(row: CommentRecord): CommentDto {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: iso(row.resolvedAt),
  };
}

export function mapDecision(row: DecisionRecord): DecisionDto {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export function mapSpecAsset(
  row: SpecAssetRecord,
  urls?: { publicUrl?: string | null; signedUrl?: string | null },
): SpecAssetDto {
  return {
    ...row,
    publicUrl: urls?.publicUrl ?? null,
    signedUrl: urls?.signedUrl ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSpecCheckSummary(
  row: SpecCodeCheckSummaryRecord,
): SpecCheckSummaryDto {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
  };
}
