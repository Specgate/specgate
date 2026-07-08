import { ProjectAdrDto, UpdateProjectAdrRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';

export interface UpdateAdrUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class UpdateAdrUseCase {
  constructor(private deps: UpdateAdrUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string, req: UpdateProjectAdrRequest): Promise<ProjectAdrDto> {
    const adr = await this.deps.engineeringContextRepository.updateAdr(tenantId, req, userId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'project_adr_status_changed',
      message: `Updated ADR: ${adr.title || req.adrId}`,
    });

    return adr;
  }
}
