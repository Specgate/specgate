import { GenerateSpecAgentContextRequest } from '@corely/contracts';
import { EngineeringContextRepository } from '../ports/engineering-context.repository';
import { AgentTargetRegistry } from '../services/agent-target-registry';
import { AgentExportGeneratorPort } from '../ports/agent-export-generator.port';
import { ActivityLogPort } from '../ports/activity-log.port';
import { EngineeringContextNotFoundError, TargetAgentNotFoundError } from '../../domain/errors';

export interface GenerateSpecAgentContextUseCaseDeps {
  engineeringContextRepository: EngineeringContextRepository;
  agentTargetRegistry: AgentTargetRegistry;
  agentExportGenerator: AgentExportGeneratorPort;
  activityLogPort: ActivityLogPort;
}

export class GenerateSpecAgentContextUseCase {
  constructor(private deps: GenerateSpecAgentContextUseCaseDeps) {}

  async execute(tenantId: string, userId: string, projectId: string, specId: string, targetAgentId: string | undefined, specDetails: Record<string, unknown>): Promise<{ markdown: string }> {
    const context = await this.deps.engineeringContextRepository.getEngineeringContext(tenantId, projectId);
    if (!context) {
      throw new EngineeringContextNotFoundError(projectId);
    }

    const targetAgent = this.deps.agentTargetRegistry.getById(targetAgentId || 'cursor');
    if (!targetAgent) {
      throw new TargetAgentNotFoundError(targetAgentId || 'cursor');
    }

    const [rules, adrs, validationCommands] = await Promise.all([
      this.deps.engineeringContextRepository.getRulesByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getAdrsByContextId(tenantId, context.id),
      this.deps.engineeringContextRepository.getValidationCommandsByContextId(tenantId, context.id)
    ]);

    // Relevance Filtering
    // TODO(MVP): Current filtering is string-matching only. A follow-up should replace this
    // with semantic embedding-based relevance scoring for more accurate ADR/rule inclusion.
    // See: https://github.com/acme/specgate/issues/XXX
    const suggestedSearchTerms = Array.isArray(specDetails.suggestedSearchTerms) ? specDetails.suggestedSearchTerms.join(" ").toLowerCase() : "";
    const relatedFiles = Array.isArray(specDetails.relatedFiles) ? specDetails.relatedFiles.join(" ").toLowerCase() : "";
    const relevantContent = (suggestedSearchTerms + " " + relatedFiles).trim();

    const filteredRules = rules.filter(rule => {
      if (rule.scopeType === "GLOBAL") return true;
      if (!relevantContent) return true; // If no terms are provided, include all for safety.
      // Basic keyword matching
      return relevantContent.includes(rule.title.toLowerCase());
    });

    const filteredAdrs = adrs.filter(adr => {
      if (!relevantContent) return false; // Only include relevant ADRs to avoid bloat
      return relevantContent.includes(adr.title.toLowerCase()) || relevantContent.includes(adr.id.toLowerCase());
    });

    const result = await this.deps.agentExportGenerator.generateSpecAgentContext({
      tenantId,
      projectId,
      specId,
      specDetails,
      targetAgent,
      validationCommands,
      rules: filteredRules,
      adrs: filteredAdrs,
      context
    });

    if (specDetails.status !== 'approved') {
      result.markdown = `> [!WARNING]\n> This spec is not approved. Do not start implementation.\n\n${result.markdown}`;
    }

    await this.deps.activityLogPort.publish({
      tenantId,
      projectId,
      specId,
      actorId: userId,
      type: 'spec_agent_context_generated',
      message: `Generated agent context for spec ${specId} targeting ${targetAgent.label}`,
    });

    return result;
  }
}
