import { ProjectContextRuleDto, UpdateProjectContextRuleRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';

export interface UpdateContextRuleUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class UpdateContextRuleUseCase {
  constructor(private deps: UpdateContextRuleUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string, req: UpdateProjectContextRuleRequest): Promise<ProjectContextRuleDto> {
    const rule = await this.deps.engineeringContextRepository.updateRule(tenantId, req, userId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'project_context_rule_updated',
      message: `Updated context rule: ${rule.title || req.ruleId}`,
    });

    return rule;
  }
}
