import type { ActivityType } from "../enums";

export type SpecGateSpecEvent = {
  tenantId: string;
  projectId: string;
  specId: string;
  actorId: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, unknown>;
};
