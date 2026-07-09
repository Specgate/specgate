export interface ActivityPublisherPort {
  publish(event: {
    tenantId: string;
    projectId: string;
    specId?: string | null;
    actorId: string;
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}
