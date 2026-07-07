import { AgentReadinessCheckDto } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { ReadinessChecker } from '../services/readiness-checker';

export interface GetAgentReadinessUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  readinessChecker: ReadinessChecker;
}

export class GetAgentReadinessUseCase {
  constructor(private deps: GetAgentReadinessUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, specId?: string, specDetails?: Record<string, any>): Promise<AgentReadinessCheckDto> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    
    // We fetch validation commands too, since the readiness checker needs them
    const validationCommands = context ? await this.deps.engineeringContextRepository.getValidationCommandsByContextId(tenantId, context.id) : [];

    const projectReadiness = this.deps.readinessChecker.checkProjectReadiness(projectId, context, validationCommands);

    if (specId && specDetails) {
      return this.deps.readinessChecker.checkSpecReadiness(projectId, specId, specDetails, projectReadiness);
    }

    return projectReadiness;
  }
}
