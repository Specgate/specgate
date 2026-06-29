export type SpecGateImplementationEvent = {
  tenantId: string;
  projectId: string;
  specId: string;
  actorId: string;
  type:
    | "development_started"
    | "pull_request_linked"
    | "developer_review_started"
    | "approved_for_preview";
  message: string;
};
