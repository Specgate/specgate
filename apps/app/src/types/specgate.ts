export type SpecStatus =
  | "request"
  | "draft"
  | "review"
  | "approved"
  | "build_queue"
  | "in_development"
  | "developer_review"
  | "preview"
  | "stakeholder_review"
  | "accepted"
  | "done";

export type Priority = "low" | "medium" | "high" | "urgent";
export type RoadmapLane = "Now" | "Next" | "Later" | "Icebox";
export type DemoMode = "team" | "solo";

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  type: "admin" | "stakeholder" | "developer" | "product_lead" | "unknown";
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
}

export interface Project {
  id: string;
  name: string;
  slug?: string;
  workspaceId?: string | null;
}

export interface Comment {
  id: string;
  specId: string;
  authorId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  sectionReference?: string | null;
  status: "open" | "resolved" | "dismissed";
  resolved?: boolean;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

export interface Decision {
  id: string;
  specId: string;
  question: string;
  text: string;
  decision: string;
  decidedBy?: string;
  createdAt?: string;
}

export interface SpecAsset {
  id: string;
  specId: string;
  projectId: string;
  kind: "image" | "file";
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageProvider: "gcp" | "vercel_blob" | "local";
  storageKey: string;
  url?: string | null;
  publicUrl?: string | null;
  signedUrl?: string | null;
  altText?: string | null;
  caption?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SpecCheck {
  id: string;
  specId: string;
  status: "passed" | "warning" | "failed";
  summary: string;
  details?: string[];
  createdAt: string;
}

export interface PreviewReview {
  id: string;
  specId: string;
  previewUrl?: string | null;
  status: string;
  environment: string;
  feedback?: string | null;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Spec {
  id: string;
  apiId?: string;
  projectId?: string;
  title: string;
  status: SpecStatus;
  priority: Priority;
  roadmapLane: RoadmapLane;
  milestoneId: string;
  ownerId: string;
  assigneeId?: string;
  summary: string;
  requestDocumentJson?: unknown;
  requestPlainText?: string | null;
  audience?: string;
  background?: string;
  currentBehavior?: string;
  desiredOutcome?: string;
  acceptanceCriteria: string[];
  outOfScope: string[];
  openQuestions: string[];
  edgeCases?: string[];
  securityNotes?: string;
  suggestedSearchTerms?: string[];
  verificationPlan?: string[];
  technicalNotes?: string;
  uiNotes?: string;
  relatedFiles?: string[];
  decisions: Decision[];
  commentCount?: number;
  decisionCount?: number;
  assetCount?: number;
  latestActivityAt?: string | null;
  previewUrl?: string;
  prUrl?: string;
  releaseNotes?: string;
  warning?: string;
  latestSpecCheck?: SpecCheck | null;
  gitSyncedAt?: string;
  approvedAt?: string;
  updatedAt: string;
  buildCycleId?: string;
}

export interface BuildCycle {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: "active" | "planned" | "completed";
  specIds: string[];
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  specId?: string;
}

export interface DemoState {
  mode: DemoMode;
  currentWorkspaceId: string;
  currentProjectId: string;
  workspaces: Workspace[];
  projects: Project[];
  specs: Spec[];
  comments: Comment[];
  decisions: Decision[];
  assets: SpecAsset[];
  specChecks: SpecCheck[];
  previewReviews: PreviewReview[];
  activities: Activity[];
  buildCycles: BuildCycle[];
  milestones: Milestone[];
}
