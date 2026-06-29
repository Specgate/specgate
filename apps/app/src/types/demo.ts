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
  type: "admin" | "stakeholder" | "developer";
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
}

export interface Project {
  id: string;
  name: string;
  slug?: string;
}

export interface Comment {
  id: string;
  specId: string;
  authorId: string;
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface Decision {
  id: string;
  text: string;
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
  problem?: string;
  expectedBehavior?: string;
  acceptanceCriteria: string[];
  outOfScope: string[];
  openQuestions?: string[];
  technicalNotes?: string;
  decisions: Decision[];
  relatedFiles?: string[];
  previewUrl?: string;
  prUrl?: string;
  releaseNotes?: string;
  warning?: string;
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
  currentProjectId: string;
  projects: Project[];
  specs: Spec[];
  comments: Comment[];
  activities: Activity[];
  buildCycles: BuildCycle[];
  milestones: Milestone[];
}
