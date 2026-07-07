export interface ActivityLogPort {
  publish(event: {
    tenantId: string;
    projectId: string;
    specId?: string;
    actorId: string;
    type: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<void>;
}
