export type AgentTargetCategory = 'standard' | 'agent' | 'generic' | 'custom';

export interface AgentTarget {
  id: string;
  label: string;
  category: AgentTargetCategory;
  description?: string;
  primaryFiles?: string[];
  defaultEnabled: boolean;
  supportsPathScopedRules?: boolean;
  supportsWorkflows?: boolean;
  supportsSkills?: boolean;
  supportsImports?: boolean;
}
