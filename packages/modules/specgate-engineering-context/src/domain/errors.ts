export class EngineeringContextNotFoundError extends Error {
  constructor(public readonly projectId: string) {
    super(`Engineering context for project ${projectId} not found.`);
    this.name = 'EngineeringContextNotFoundError';
  }
}

export class ContextRuleNotFoundError extends Error {
  constructor(public readonly ruleId: string) {
    super(`Context rule ${ruleId} not found.`);
    this.name = 'ContextRuleNotFoundError';
  }
}

export class AdrNotFoundError extends Error {
  constructor(public readonly adrId: string) {
    super(`ADR ${adrId} not found.`);
    this.name = 'AdrNotFoundError';
  }
}

export class TargetAgentNotFoundError extends Error {
  constructor(public readonly agentId: string) {
    super(`Target agent ${agentId} not found.`);
    this.name = 'TargetAgentNotFoundError';
  }
}
