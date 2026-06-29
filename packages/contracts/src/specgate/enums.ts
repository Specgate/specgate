import { z } from "zod";

export const SpecStatusSchema = z.enum([
  "request",
  "draft",
  "review",
  "approved",
  "build_queue",
  "in_development",
  "developer_review",
  "preview",
  "stakeholder_review",
  "accepted",
  "done",
]);
export type SpecStatus = z.infer<typeof SpecStatusSchema>;

export const SpecPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type SpecPriority = z.infer<typeof SpecPrioritySchema>;

export const RoadmapLaneSchema = z.enum(["now", "next", "later", "icebox"]);
export type RoadmapLane = z.infer<typeof RoadmapLaneSchema>;

export const AgentTargetSchema = z.enum([
  "cursor",
  "claude_code",
  "codex",
  "github_copilot",
  "generic",
]);
export type AgentTarget = z.infer<typeof AgentTargetSchema>;

export const PreviewEnvironmentSchema = z.enum([
  "preview",
  "staging",
  "production_flag",
  "production",
]);
export type PreviewEnvironment = z.infer<typeof PreviewEnvironmentSchema>;

export const PreviewReviewStatusSchema = z.enum([
  "waiting_for_review",
  "approved",
  "commented",
  "rejected",
]);
export type PreviewReviewStatus = z.infer<typeof PreviewReviewStatusSchema>;

export const ImplementationStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "ready_for_developer_review",
  "changes_requested",
  "approved_for_preview",
]);
export type ImplementationStatus = z.infer<typeof ImplementationStatusSchema>;

export const BuildCycleStatusSchema = z.enum([
  "planned",
  "active",
  "completed",
  "cancelled",
]);
export type BuildCycleStatus = z.infer<typeof BuildCycleStatusSchema>;

export const MilestoneStatusSchema = z.enum([
  "planned",
  "active",
  "completed",
  "cancelled",
]);
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>;

export const ActivityTypeSchema = z.enum([
  "spec_created",
  "spec_updated",
  "spec_moved_to_review",
  "spec_approved",
  "spec_changes_requested",
  "roadmap_lane_changed",
  "added_to_build_queue",
  "added_to_build_cycle",
  "spec_synced_to_git",
  "agent_context_generated",
  "development_started",
  "pull_request_linked",
  "developer_review_started",
  "spec_check_completed",
  "approved_for_preview",
  "preview_url_added",
  "sent_to_stakeholder_review",
  "preview_approved",
  "preview_commented",
  "preview_rejected",
  "spec_marked_done",
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
