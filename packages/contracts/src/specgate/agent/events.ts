export type SpecGateAgentEvent = {
  tenantId: string;
  projectId: string;
  specId: string;
  actorId: string;
  type:
    | "spec_synced_to_git"
    | "agent_context_generated"
    | "spec_check_completed";
  message: string;
};
