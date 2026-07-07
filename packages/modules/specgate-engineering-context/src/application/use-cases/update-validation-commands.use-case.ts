import { ValidationCommandDto, UpsertValidationCommandsRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';
import { EngineeringContextNotFoundError } from '../../domain/errors';

export interface UpdateValidationCommandsUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class UpdateValidationCommandsUseCase {
  constructor(private deps: UpdateValidationCommandsUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string, req: UpsertValidationCommandsRequest): Promise<ValidationCommandDto[]> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    if (!context) {
      throw new EngineeringContextNotFoundError(projectId);
    }

    const commands = await this.deps.engineeringContextRepository.upsertValidationCommands(tenantId, context.id, req);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'validation_commands_updated',
      message: `Updated validation commands`,
    });

    return commands;
  }
}
