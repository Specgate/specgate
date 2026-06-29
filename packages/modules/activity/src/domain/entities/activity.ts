import type { ActivityType } from "@corely/contracts/specgate";

export type ActivityRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string | null;
  actorId: string;
  type: ActivityType;
  message: string;
  metadata: unknown | null;
  createdAt: Date;
};
