import { z } from "zod";
import {
  ActivityTypeSchema,
  AgentTargetSchema,
  BuildCycleStatusSchema,
  ImplementationStatusSchema,
  MilestoneStatusSchema,
  PreviewEnvironmentSchema,
  PreviewReviewStatusSchema,
  RoadmapLaneSchema,
  SpecPrioritySchema,
  SpecStatusSchema,
} from "./enums";

export const IdSchema = z.string().min(1);
export const IsoDateSchema = z.string();
export const StringArraySchema = z.array(z.string()).default([]);

export const WorkspaceSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type WorkspaceDto = z.infer<typeof WorkspaceSchema>;

export const ProjectSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  workspaceId: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  gitProvider: z.string().nullable(),
  gitRepoUrl: z.string().nullable(),
  gitDefaultBranch: z.string().nullable(),
  requirementsPath: z.string().nullable(),
  assetsPath: z.string().nullable(),
  agentContextPath: z.string().nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type ProjectDto = z.infer<typeof ProjectSchema>;

export const SpecSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specNumber: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string().nullable(),
  audience: z.string().nullable(),
  description: z.string().nullable(),
  status: SpecStatusSchema,
  priority: SpecPrioritySchema,
  roadmapLane: RoadmapLaneSchema,
  targetMilestoneId: z.string().nullable(),
  buildCycleId: z.string().nullable(),
  ownerId: z.string().nullable(),
  assigneeId: z.string().nullable(),
  approvedVersionId: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: IsoDateSchema.nullable(),
  acceptedBy: z.string().nullable(),
  acceptedAt: IsoDateSchema.nullable(),
  doneAt: IsoDateSchema.nullable(),
  acceptanceCriteria: z.array(z.string()),
  outOfScope: z.array(z.string()),
  openQuestions: z.array(z.string()),
  relatedFiles: z.array(z.string()),
  technicalNotes: z.string().nullable(),
  uiNotes: z.string().nullable(),
  createdBy: z.string(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type SpecDto = z.infer<typeof SpecSchema>;

export const ApprovedSpecSnapshotSchema = SpecSchema.pick({
  id: true,
  tenantId: true,
  projectId: true,
  specNumber: true,
  title: true,
  summary: true,
  audience: true,
  description: true,
  status: true,
  priority: true,
  roadmapLane: true,
  acceptanceCriteria: true,
  outOfScope: true,
  openQuestions: true,
  relatedFiles: true,
  technicalNotes: true,
  uiNotes: true,
  approvedBy: true,
  approvedAt: true,
});
export type ApprovedSpecSnapshot = z.infer<typeof ApprovedSpecSnapshotSchema>;

export const SpecVersionSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  specId: z.string(),
  versionNumber: z.number().int().positive(),
  summarySnapshot: z.string().nullable(),
  markdownSnapshot: z.string(),
  createdBy: z.string(),
  changeSummary: z.string().nullable(),
  createdAt: IsoDateSchema,
});
export type SpecVersionDto = z.infer<typeof SpecVersionSchema>;

export const CommentSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  specId: z.string(),
  userId: z.string(),
  body: z.string(),
  sectionReference: z.string().nullable(),
  status: z.enum(["open", "resolved", "dismissed"]),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  resolvedAt: IsoDateSchema.nullable(),
  resolvedBy: z.string().nullable(),
});
export type CommentDto = z.infer<typeof CommentSchema>;

export const DecisionSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  specId: z.string(),
  question: z.string(),
  decision: z.string(),
  decidedBy: z.string(),
  createdAt: IsoDateSchema,
});
export type DecisionDto = z.infer<typeof DecisionSchema>;

export const SpecAssetSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  kind: z.enum(["image", "file"]),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  storageProvider: z.enum(["gcp", "vercel_blob", "local"]),
  storageKey: z.string(),
  publicUrl: z.string().nullable().optional(),
  signedUrl: z.string().nullable().optional(),
  altText: z.string().nullable(),
  caption: z.string().nullable(),
  createdBy: z.string(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type SpecAssetDto = z.infer<typeof SpecAssetSchema>;

export const MilestoneSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  targetDate: IsoDateSchema.nullable(),
  status: MilestoneStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type MilestoneDto = z.infer<typeof MilestoneSchema>;

export const BuildCycleSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  name: z.string(),
  goal: z.string().nullable(),
  startDate: IsoDateSchema.nullable(),
  endDate: IsoDateSchema.nullable(),
  status: BuildCycleStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type BuildCycleDto = z.infer<typeof BuildCycleSchema>;

export const BuildQueueItemSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  priorityRank: z.number().int(),
  assignedTo: z.string().nullable(),
  buildCycleId: z.string().nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type BuildQueueItemDto = z.infer<typeof BuildQueueItemSchema>;

export const AgentContextSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  targetAgent: AgentTargetSchema,
  markdown: z.string(),
  contextJson: z.unknown().nullable(),
  createdBy: z.string(),
  createdAt: IsoDateSchema,
});
export type AgentContextDto = z.infer<typeof AgentContextSchema>;

export const GitSyncRecordSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  provider: z.string(),
  fakeCommitSha: z.string(),
  path: z.string(),
  status: z.string(),
  createdBy: z.string(),
  createdAt: IsoDateSchema,
});
export type GitSyncRecordDto = z.infer<typeof GitSyncRecordSchema>;

export const SpecCodeCheckSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  status: z.string(),
  summary: z.string(),
  mismatchFindings: z.array(
    z.object({
      severity: z.string(),
      message: z.string(),
      file: z.string().nullable(),
    }),
  ),
  createdBy: z.string(),
  createdAt: IsoDateSchema,
});
export type SpecCodeCheckDto = z.infer<typeof SpecCodeCheckSchema>;

export const ImplementationRecordSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  status: ImplementationStatusSchema,
  branchName: z.string().nullable(),
  pullRequestUrl: z.string().nullable(),
  developerId: z.string().nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type ImplementationRecordDto = z.infer<
  typeof ImplementationRecordSchema
>;

export const PreviewReviewSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  previewUrl: z.string().nullable(),
  environment: PreviewEnvironmentSchema,
  status: PreviewReviewStatusSchema,
  feedback: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type PreviewReviewDto = z.infer<typeof PreviewReviewSchema>;

export const PreviewChecklistSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  items: z.array(z.string()),
  createdAt: IsoDateSchema,
});
export type PreviewChecklistDto = z.infer<typeof PreviewChecklistSchema>;

export const ActivitySchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string().nullable(),
  actorId: z.string(),
  type: ActivityTypeSchema,
  message: z.string(),
  metadata: z.unknown().nullable(),
  createdAt: IsoDateSchema,
});
export type ActivityDto = z.infer<typeof ActivitySchema>;

export const ProjectInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  workspaceId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  gitProvider: z.string().optional().nullable(),
  gitRepoUrl: z.string().optional().nullable(),
  gitDefaultBranch: z.string().optional().nullable(),
  requirementsPath: z.string().optional().nullable(),
  assetsPath: z.string().optional().nullable(),
  agentContextPath: z.string().optional().nullable(),
});
export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export const SpecInputSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional().nullable(),
  audience: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  priority: SpecPrioritySchema.default("medium"),
  roadmapLane: RoadmapLaneSchema.default("icebox"),
  targetMilestoneId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  acceptanceCriteria: z.array(z.string()).optional(),
  outOfScope: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
  relatedFiles: z.array(z.string()).optional(),
  technicalNotes: z.string().optional().nullable(),
  uiNotes: z.string().optional().nullable(),
});
export type SpecInput = z.input<typeof SpecInputSchema>;

export const SpecUpdateSchema = SpecInputSchema.omit({
  projectId: true,
}).partial();
export type SpecUpdate = z.infer<typeof SpecUpdateSchema>;

export const SpecListQuerySchema = z.object({
  projectId: z.string().optional(),
  status: SpecStatusSchema.optional(),
  roadmapLane: RoadmapLaneSchema.optional(),
  priority: SpecPrioritySchema.optional(),
  buildCycleId: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type SpecListQuery = z.input<typeof SpecListQuerySchema>;

export const CommentInputSchema = z.object({
  body: z.string().min(1),
  sectionReference: z.string().optional().nullable(),
});
export const DecisionInputSchema = z.object({
  question: z.string().min(1),
  decision: z.string().min(1),
});
export const RequestChangesInputSchema = z.object({
  reason: z.string().min(1).optional(),
});
export const MoveRoadmapLaneInputSchema = z.object({
  specId: z.string().min(1),
  roadmapLane: RoadmapLaneSchema,
});
export const MilestoneInputSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  status: MilestoneStatusSchema.default("planned"),
});
export const MilestoneUpdateSchema = MilestoneInputSchema.omit({
  projectId: true,
}).partial();
export const BuildCycleInputSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  goal: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: BuildCycleStatusSchema.default("planned"),
});
export const BuildCycleUpdateSchema = BuildCycleInputSchema.omit({
  projectId: true,
}).partial();
export const BuildQueueAddInputSchema = z.object({
  specId: z.string().min(1),
  priorityRank: z.number().int().default(0),
});
export const BuildQueueAssignInputSchema = z.object({
  assignedTo: z.string().nullable().optional(),
});
export const BuildCycleSpecInputSchema = z.object({
  specId: z.string().min(1),
});
export const AgentContextInputSchema = z.object({
  targetAgent: AgentTargetSchema,
});
export const ImplementationBranchInputSchema = z.object({
  branchName: z.string().min(1),
});
export const ImplementationPullRequestInputSchema = z.object({
  pullRequestUrl: z.string().url(),
});
export const PreviewUrlInputSchema = z.object({
  previewUrl: z.string().url(),
  environment: PreviewEnvironmentSchema.default("preview"),
});
export const PreviewCommentInputSchema = z.object({
  feedback: z.string().min(1),
});
export const PreviewRejectInputSchema = z.object({
  reason: z.string().min(1),
});
export const SpecAssetMetadataInputSchema = z.object({
  altText: z.string().max(500).optional().nullable(),
  caption: z.string().max(1000).optional().nullable(),
});
