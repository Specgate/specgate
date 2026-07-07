import { ProjectContextRuleDto, CreateProjectContextRuleRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';
import { EngineeringContextNotFoundError } from '../../domain/errors';

export interface CreateContextRuleUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class CreateContextRuleUseCase {
  constructor(private deps: CreateContextRuleUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string, req: CreateProjectContextRuleRequest): Promise<ProjectContextRuleDto> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    if (!context) {
      throw new EngineeringContextNotFoundError(projectId);
    }

    const rule = await this.deps.engineeringContextRepository.createRule(tenantId, context.id, req, userId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'project_context_rule_created',
      message: `Created context rule: ${rule.title}`,
    });

    return rule;
  }
}
