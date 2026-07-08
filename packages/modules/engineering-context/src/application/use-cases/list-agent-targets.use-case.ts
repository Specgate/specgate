import { AgentTargetDto } from '@corely/contracts';
import { AgentTargetRegistry } from '../services/agent-target-registry';

export interface ListAgentTargetsUseCaseDeps {
  agentTargetRegistry: AgentTargetRegistry;
}

export class ListAgentTargetsUseCase {
  constructor(private deps: ListAgentTargetsUseCaseDeps) {}

  async execute(): Promise<AgentTargetDto[]> {
    return this.deps.agentTargetRegistry.getAll();
  }
}
