import type { ActivityType } from "@corely/contracts/specgate";
import type { ActivityRecord } from "../../domain/entities/activity";

export interface ActivityRepositoryPort {
  record(activity: ActivityRecord): Promise<void>;
  list(
    tenantId: string,
    filters: {
      projectId?: string;
      specId?: string;
      type?: ActivityType;
    },
  ): Promise<ActivityRecord[]>;
}
