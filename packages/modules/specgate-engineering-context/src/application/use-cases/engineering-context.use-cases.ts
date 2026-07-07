import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { AgentExportGeneratorPort } from '../ports/agent-export-generator.port';
import { ActivityLogPort } from '../ports/activity-log.port';
import { AgentTargetRegistry } from '../services/agent-target-registry';
import { ReadinessChecker } from '../services/readiness-checker';

import { GetEngineeringContextUseCase } from './get-engineering-context.use-case';
import { UpsertEngineeringContextUseCase } from './upsert-engineering-context.use-case';
import { ApproveEngineeringContextUseCase } from './approve-engineering-context.use-case';
import { CreateContextRuleUseCase } from './create-context-rule.use-case';
import { UpdateContextRuleUseCase } from './update-context-rule.use-case';
import { DeleteContextRuleUseCase } from './delete-context-rule.use-case';
import { CreateAdrUseCase } from './create-adr.use-case';
import { UpdateAdrUseCase } from './update-adr.use-case';
import { UpdateValidationCommandsUseCase } from './update-validation-commands.use-case';
import { ListAgentTargetsUseCase } from './list-agent-targets.use-case';
import { GenerateProjectAgentExportsUseCase } from './generate-project-agent-exports.use-case';
import { GenerateSpecAgentContextUseCase } from './generate-spec-agent-context.use-case';
import { GetAgentReadinessUseCase } from './get-agent-readiness.use-case';

export class EngineeringContextUseCases {
  public getEngineeringContext: GetEngineeringContextUseCase;
  public upsertEngineeringContext: UpsertEngineeringContextUseCase;
  public approveEngineeringContext: ApproveEngineeringContextUseCase;
  public createContextRule: CreateContextRuleUseCase;
  public updateContextRule: UpdateContextRuleUseCase;
  public deleteContextRule: DeleteContextRuleUseCase;
  public createAdr: CreateAdrUseCase;
  public updateAdr: UpdateAdrUseCase;
  public updateValidationCommands: UpdateValidationCommandsUseCase;
  public listAgentTargets: ListAgentTargetsUseCase;
  public generateProjectAgentExports: GenerateProjectAgentExportsUseCase;
  public generateSpecAgentContext: GenerateSpecAgentContextUseCase;
  public getAgentReadiness: GetAgentReadinessUseCase;

  constructor(
    engineeringContextRepository: EngineeringContextRepository,
    agentExportGenerator: AgentExportGeneratorPort,
    activityLogPort: ActivityLogPort
  ) {
    const agentTargetRegistry = new AgentTargetRegistry();
    const readinessChecker = new ReadinessChecker(agentTargetRegistry);

    this.getEngineeringContext = new GetEngineeringContextUseCase({ engineeringContextRepository });
    this.upsertEngineeringContext = new UpsertEngineeringContextUseCase({ engineeringContextRepository, activityLogPort });
    this.approveEngineeringContext = new ApproveEngineeringContextUseCase({ engineeringContextRepository, activityLogPort });
    this.createContextRule = new CreateContextRuleUseCase({ engineeringContextRepository, activityLogPort });
    this.updateContextRule = new UpdateContextRuleUseCase({ engineeringContextRepository, activityLogPort });
    this.deleteContextRule = new DeleteContextRuleUseCase({ engineeringContextRepository, activityLogPort });
    this.createAdr = new CreateAdrUseCase({ engineeringContextRepository, activityLogPort });
    this.updateAdr = new UpdateAdrUseCase({ engineeringContextRepository, activityLogPort });
    this.updateValidationCommands = new UpdateValidationCommandsUseCase({ engineeringContextRepository, activityLogPort });
    this.listAgentTargets = new ListAgentTargetsUseCase({ agentTargetRegistry });
    this.generateProjectAgentExports = new GenerateProjectAgentExportsUseCase({ engineeringContextRepository, agentTargetRegistry, agentExportGenerator, activityLogPort });
    this.generateSpecAgentContext = new GenerateSpecAgentContextUseCase({ engineeringContextRepository, agentTargetRegistry, agentExportGenerator, activityLogPort });
    this.getAgentReadiness = new GetAgentReadinessUseCase({ engineeringContextRepository, readinessChecker });
  }
}
