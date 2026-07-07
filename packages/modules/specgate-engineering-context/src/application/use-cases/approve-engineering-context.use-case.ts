import { EngineeringContextDto } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';
import { EngineeringContextNotFoundError } from '../../domain/errors';

export interface ApproveEngineeringContextUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class ApproveEngineeringContextUseCase {
  constructor(private deps: ApproveEngineeringContextUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string): Promise<EngineeringContextDto> {
    const existing = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    if (!existing) {
      throw new EngineeringContextNotFoundError(projectId);
    }

    const context = await this.deps.engineeringContextRepository.approveEngineeringContext(tenantId, projectId, userId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'engineering_context_approved',
      message: 'Approved project engineering context',
    });

    return context;
  }
}
