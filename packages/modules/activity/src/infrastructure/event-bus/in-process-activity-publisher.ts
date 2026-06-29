import type { ActivityUseCases } from "../../application/use-cases/activity.use-cases";

export class InProcessActivityPublisher {
  constructor(private readonly activity: ActivityUseCases) {}

  async publish(event: {
    tenantId: string;
    projectId: string;
    specId?: string | null;
    actorId: string;
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.activity.recordActivity(event);
  }
}
