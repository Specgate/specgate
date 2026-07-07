import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ActivityLogPort } from '../ports/activity-log.port';

export interface DeleteContextRuleUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  activityLogPort: ActivityLogPort;
}

export class DeleteContextRuleUseCase {
  constructor(private deps: DeleteContextRuleUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, ruleId: string, userId: string): Promise<void> {
    await this.deps.engineeringContextRepository.deleteRule(tenantId, projectId, ruleId);

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'project_context_rule_deleted',
      message: `Deleted context rule ${ruleId}`,
    });
  }
}
