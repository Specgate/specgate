import { 
  EngineeringContextDto, 
  ProjectContextRuleDto, 
  ProjectAdrDto, 
  ValidationCommandDto,
  AgentExportDto 
} from '@corely/contracts';
import { AgentTarget } from '../../domain/agent-target';

export interface GenerateExportsInput {
  tenantId: string;
  projectId: string;
  context: EngineeringContextDto;
  rules: ProjectContextRuleDto[];
  adrs: ProjectAdrDto[];
  validationCommands: ValidationCommandDto[];
  targets: AgentTarget[];
  userId: string;
}

export interface GenerateSpecContextInput {
  tenantId: string;
  projectId: string;
  specId: string;
  targetAgent: AgentTarget;
  context: EngineeringContextDto;
  rules: ProjectContextRuleDto[];
  adrs: ProjectAdrDto[];
  validationCommands: ValidationCommandDto[];
  specDetails: Record<string, unknown>; // Pass spec details dynamically or strictly type it if needed
}

export interface AgentExportGeneratorPort {
  generateProjectExports(input: GenerateExportsInput): Promise<Omit<AgentExportDto, 'id' | 'tenantId' | 'projectId' | 'contextId'>[]>;
  generateSpecAgentContext(input: GenerateSpecContextInput): Promise<{ markdown: string }>;
}
