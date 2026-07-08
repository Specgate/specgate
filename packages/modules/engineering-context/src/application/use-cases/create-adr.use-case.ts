import { ProjectAdrDto, CreateProjectAdrRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';
import { EngineeringContextNotFoundError } from '../../domain/errors';

export interface CreateAdrUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class CreateAdrUseCase {
  constructor(private deps: CreateAdrUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string, req: CreateProjectAdrRequest): Promise<ProjectAdrDto> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    if (!context) {
      throw new EngineeringContextNotFoundError(projectId);
    }

    const adr = await this.deps.engineeringContextRepository.createAdr(tenantId, context.id, req, userId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'project_adr_created',
      message: `Created ADR: ${adr.title}`,
    });

    return adr;
  }
}
