import { AgentExportDto } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { AgentTargetRegistry } from '../services/agent-target-registry';
import { AgentExportGeneratorPort } from '../ports/agent-export-generator.port';
import { ActivityLogPort } from '../ports/activity-log.port';
import { EngineeringContextNotFoundError } from '../../domain/errors';

export interface GenerateProjectAgentExportsUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  agentTargetRegistry: AgentTargetRegistry;
  agentExportGenerator: AgentExportGeneratorPort;
  activityLogPort: ActivityLogPort;
}

export class GenerateProjectAgentExportsUseCase {
  constructor(private deps: GenerateProjectAgentExportsUseCaseDeps) {}

  async execute(tenantId: string, projectId: string, userId: string): Promise<AgentExportDto[]> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    if (!context) {
      throw new EngineeringContextNotFoundError(projectId);
    }

    const [rules, adrs, validationCommands] = await Promise.all([
      this.deps.engineeringContextRepository.getRulesByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getAdrsByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getValidationCommandsByContextId(tenantId, context.id)
    ]);

    const targets = this.deps.agentTargetRegistry.getAll().filter(t => t.defaultEnabled); // Assuming we just generate for default enabled for now

    const generatedExports = await this.deps.agentExportGenerator.generateProjectExports({
      tenantId,
      projectId,
      context,
      rules,
      adrs,
      validationCommands,
      targets,
      userId
    });

    const savedExports = await this.deps.engineeringContextRepository.saveAgentExports(
      tenantId,
      projectId,
      context.id,
      generatedExports,
      userId
    );

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      actorId: userId,
      type: 'agent_exports_generated',
      message: `Generated ${savedExports.length} agent exports`,
    });

    return savedExports;
  }
}
