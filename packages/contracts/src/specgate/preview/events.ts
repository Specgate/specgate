export type SpecGatePreviewEvent = {
  tenantId: string;
  projectId: string;
  specId: string;
  actorId: string;
  type:
    | "preview_url_added"
    | "sent_to_stakeholder_review"
    | "preview_approved"
    | "preview_commented"
    | "preview_rejected"
    | "spec_marked_done";
  message: string;
};
