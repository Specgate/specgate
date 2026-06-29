export type SpecGatePlanningEvent = {
  tenantId: string;
  projectId: string;
  specId?: string;
  actorId: string;
  type:
    | "roadmap_lane_changed"
    | "added_to_build_queue"
    | "added_to_build_cycle";
  message: string;
};
