import { EngineeringContextDto, ProjectContextRuleDto, ProjectAdrDto, ValidationCommandDto, AgentExportDto } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';

export interface GetEngineeringContextUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
}

export class GetEngineeringContextUseCase {
  constructor(private deps: GetEngineeringContextUseCaseDeps) {}

  async execute(tenantId: string, projectId: string): Promise<{
    context: EngineeringContextDto | null;
    rules: ProjectContextRuleDto[];
    adrs: ProjectAdrDto[];
    validationCommands: ValidationCommandDto[];
    agentExports: AgentExportDto[];
  }> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    
    if (!context) {
      return {
        context: null,
        rules: [],
        adrs: [],
        validationCommands: [],
        agentExports: []
      };
    }

    const [rules, adrs, validationCommands, agentExports] = await Promise.all([
      this.deps.engineeringContextRepository.getRulesByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getAdrsByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getValidationCommandsByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getAgentExportsByContextId(tenantId, context.id)
    ]);

    return {
      context,
      rules,
      adrs,
      validationCommands,
      agentExports
    };
  }
}
