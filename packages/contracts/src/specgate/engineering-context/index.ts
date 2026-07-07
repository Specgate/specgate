export type EngineeringContextStatus = 'DRAFT' | 'APPROVED' | 'STALE' | 'ARCHIVED';

export type ContextRuleCategory = 'ARCHITECTURE' | 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'API' | 'STORAGE' | 'AUTH' | 'TESTING' | 'SECURITY' | 'UI' | 'AGENT' | 'RELEASE' | 'DOCUMENTATION' | 'OTHER';

export type ContextRuleScopeType = 'GLOBAL' | 'PATH' | 'MODULE' | 'SPEC_AREA';

export type ContextRuleSeverity = 'GUIDANCE' | 'REQUIRED' | 'BLOCKED';

export type AdrStatus = 'PROPOSED' | 'ACCEPTED' | 'SUPERSEDED' | 'REJECTED';

export type ValidationCommandType = 'INSTALL' | 'DEV' | 'LINT' | 'TYPECHECK' | 'TEST' | 'BUILD' | 'E2E' | 'DB_MIGRATION' | 'SEED' | 'CUSTOM';

export type AgentTargetId = string; // e.g., 'generic_markdown', 'agents_md', 'codex', etc.

export type AgentExportKind = 'CANONICAL' | 'TOOL_SPECIFIC' | 'RULE' | 'WORKFLOW' | 'SKILL' | 'TASK_CONTEXT';

export interface EngineeringContextDto {
  id: string;
  tenantId: string;
  projectId: string;
  status: EngineeringContextStatus;
  version: number;
  projectSummaryMarkdown?: string | null;
  architectureMarkdown?: string | null;
  codingConventionsMarkdown?: string | null;
  testingStrategyMarkdown?: string | null;
  securityRulesMarkdown?: string | null;
  validationNotesMarkdown?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertEngineeringContextRequest {
  projectId: string;
  projectSummaryMarkdown?: string | null;
  architectureMarkdown?: string | null;
  codingConventionsMarkdown?: string | null;
  testingStrategyMarkdown?: string | null;
  securityRulesMarkdown?: string | null;
  validationNotesMarkdown?: string | null;
}

export interface ApproveEngineeringContextRequest {
  projectId: string;
}

export interface ProjectContextRuleDto {
  id: string;
  tenantId: string;
  projectId: string;
  contextId: string;
  title: string;
  category: ContextRuleCategory;
  scopeType: ContextRuleScopeType;
  pathGlob?: string | null;
  moduleName?: string | null;
  severity: ContextRuleSeverity;
  contentMarkdown: string;
  enabled: boolean;
  sortOrder: number;
  targetAgentIds: string[];
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectContextRuleRequest {
  projectId: string;
  title: string;
  category: ContextRuleCategory;
  scopeType: ContextRuleScopeType;
  pathGlob?: string | null;
  moduleName?: string | null;
  severity: ContextRuleSeverity;
  contentMarkdown: string;
  enabled?: boolean;
  sortOrder?: number;
  targetAgentIds?: string[];
}

export interface UpdateProjectContextRuleRequest {
  projectId: string;
  ruleId: string;
  title?: string;
  category?: ContextRuleCategory;
  scopeType?: ContextRuleScopeType;
  pathGlob?: string | null;
  moduleName?: string | null;
  severity?: ContextRuleSeverity;
  contentMarkdown?: string;
  enabled?: boolean;
  sortOrder?: number;
  targetAgentIds?: string[];
}

export interface ProjectAdrDto {
  id: string;
  tenantId: string;
  projectId: string;
  contextId: string;
  number: number;
  title: string;
  status: AdrStatus;
  contextMarkdown: string;
  decisionMarkdown: string;
  alternativesMarkdown?: string | null;
  consequencesMarkdown?: string | null;
  supersedesAdrId?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectAdrRequest {
  projectId: string;
  title: string;
  status?: AdrStatus;
  contextMarkdown: string;
  decisionMarkdown: string;
  alternativesMarkdown?: string | null;
  consequencesMarkdown?: string | null;
  supersedesAdrId?: string | null;
}

export interface UpdateProjectAdrRequest {
  projectId: string;
  adrId: string;
  title?: string;
  status?: AdrStatus;
  contextMarkdown?: string;
  decisionMarkdown?: string;
  alternativesMarkdown?: string | null;
  consequencesMarkdown?: string | null;
  supersedesAdrId?: string | null;
}

export interface ValidationCommandDto {
  id: string;
  tenantId: string;
  projectId: string;
  contextId: string;
  label: string;
  command: string;
  commandType: ValidationCommandType;
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertValidationCommandsRequest {
  projectId: string;
  commands: Array<{
    id?: string;
    label: string;
    command: string;
    commandType: ValidationCommandType;
    required?: boolean;
    sortOrder?: number;
  }>;
}

export interface AgentTargetDto {
  id: string;
  label: string;
  category: 'standard' | 'agent' | 'generic' | 'custom';
  description?: string;
  primaryFiles?: string[];
  defaultEnabled: boolean;
  supportsPathScopedRules?: boolean;
  supportsWorkflows?: boolean;
  supportsSkills?: boolean;
  supportsImports?: boolean;
}

export interface AgentExportDto {
  id: string;
  tenantId: string;
  projectId: string;
  contextId: string;
  targetAgentId: string;
  exportKind: AgentExportKind;
  filePath: string;
  contentMarkdown: string;
  checksum: string;
  generatedAt: string;
  copiedAt?: string | null;
  syncedAt?: string | null;
  createdBy: string;
}

export interface GenerateAgentExportsRequest {
  projectId: string;
}

export interface AgentReadinessCheckDto {
  projectId: string;
  specId?: string;
  status: 'green' | 'yellow' | 'red';
  score: number;
  checks: Array<{
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'fail';
    severity: 'info' | 'recommended' | 'required';
    message?: string;
    actionLabel?: string;
    actionHref?: string;
  }>;
}
