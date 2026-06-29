import { randomUUID } from "node:crypto";
import type { ActivityType } from "@corely/contracts/specgate";
import type { ActivityRepositoryPort } from "../ports/activity-repository.port";
import { mapActivity } from "../mappers";

export class ActivityUseCases {
  constructor(private readonly repository: ActivityRepositoryPort) {}

  async recordActivity(input: {
    tenantId: string;
    projectId: string;
    specId?: string | null;
    actorId: string;
    type: string;
    message: string;
    metadata?: unknown;
  }) {
    const activity = {
      id: randomUUID(),
      tenantId: input.tenantId,
      projectId: input.projectId,
      specId: input.specId || null,
      actorId: input.actorId,
      type: input.type as ActivityType,
      message: input.message,
      metadata: input.metadata || null,
      createdAt: new Date(),
    };
    await this.repository.record(activity);
    return { data: mapActivity(activity) };
  }

  async listActivity(
    tenantId: string,
    filters: {
      projectId?: string;
      specId?: string;
      type?: ActivityType;
    },
  ) {
    return {
      data: (await this.repository.list(tenantId, filters)).map(mapActivity),
    };
  }

  async listSpecActivity(tenantId: string, specId: string) {
    return this.listActivity(tenantId, { specId });
  }
}
