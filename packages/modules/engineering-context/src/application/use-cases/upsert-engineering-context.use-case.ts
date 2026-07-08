import { EngineeringContextDto, UpsertEngineeringContextRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';

export interface UpsertEngineeringContextUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class UpsertEngineeringContextUseCase {
  constructor(private deps: UpsertEngineeringContextUseCaseDeps) {}

  async execute(tenantId: string, userId: string, req: UpsertEngineeringContextRequest): Promise<EngineeringContextDto> {
    const isNew = !(await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, req.projectId));
    
    const context = await this.deps.engineeringContextRepository.upsertEngineeringContext(tenantId, req, userId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId: req.projectId,
      actorId: userId,
      type: isNew ? 'engineering_context_created' : 'engineering_context_updated',
      message: isNew ? 'Created project engineering context' : 'Updated project engineering context',
    });

    return context;
  }
}
