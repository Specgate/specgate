import type { RoadmapLane, SpecPriority, SpecStatus } from "@corely/contracts/specgate";

export type SpecRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specNumber: string;
  title: string;
  slug: string;
  summary: string | null;
  audience: string | null;
  description: string | null;
  status: SpecStatus;
  priority: SpecPriority;
  roadmapLane: RoadmapLane;
  targetMilestoneId: string | null;
  buildCycleId: string | null;
  ownerId: string | null;
  assigneeId: string | null;
  approvedVersionId: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  acceptedBy: string | null;
  acceptedAt: Date | null;
  doneAt: Date | null;
  acceptanceCriteria: string[];
  outOfScope: string[];
  openQuestions: string[];
  relatedFiles: string[];
  technicalNotes: string | null;
  uiNotes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectRecord = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  gitProvider: string | null;
  gitRepoUrl: string | null;
  gitDefaultBranch: string | null;
  requirementsPath: string | null;
  assetsPath: string | null;
  agentContextPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SpecVersionRecord = {
  id: string;
  tenantId: string;
  specId: string;
  versionNumber: number;
  summarySnapshot: string | null;
  markdownSnapshot: string;
  createdBy: string;
  changeSummary: string | null;
  createdAt: Date;
};

export type CommentRecord = {
  id: string;
  tenantId: string;
  specId: string;
  userId: string;
  body: string;
  sectionReference: string | null;
  status: "open" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
};

export type DecisionRecord = {
  id: string;
  tenantId: string;
  specId: string;
  question: string;
  decision: string;
  decidedBy: string;
  createdAt: Date;
};

export type SpecAssetRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  kind: "image" | "file";
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageProvider: "gcp" | "vercel_blob" | "local";
  storageKey: string;
  altText: string | null;
  caption: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};
