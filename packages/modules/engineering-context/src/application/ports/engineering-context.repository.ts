import { 
  EngineeringContextDto, 
  ProjectContextRuleDto, 
  ProjectAdrDto, 
  ValidationCommandDto,
  AgentExportDto,
  CreateProjectContextRuleRequest,
  UpdateProjectContextRuleRequest,
  CreateProjectAdrRequest,
  UpdateProjectAdrRequest,
  UpsertValidationCommandsRequest,
  UpsertEngineeringContextRequest
} from '@corely/contracts';

export interface EngineeringContextRepository {
  getEngineeringContext(tenantId: string, projectId: string): Promise<EngineeringContextDto | null>;
  upsertEngineeringContext(tenantId: string, req: UpsertEngineeringContextRequest, userId: string): Promise<EngineeringContextDto>;
  approveEngineeringContext(tenantId: string, projectId: string, userId: string): Promise<EngineeringContextDto>;
  
  createRule(tenantId: string, contextId: string, req: CreateProjectContextRuleRequest, userId: string): Promise<ProjectContextRuleDto>;
  updateRule(tenantId: string, req: UpdateProjectContextRuleRequest, userId: string): Promise<ProjectContextRuleDto>;
  deleteRule(tenantId: string, projectId: string, ruleId: string): Promise<void>;
  getRulesByContextId(tenantId: string, contextId: string): Promise<ProjectContextRuleDto[]>;

  createAdr(tenantId: string, contextId: string, req: CreateProjectAdrRequest, userId: string): Promise<ProjectAdrDto>;
  updateAdr(tenantId: string, req: UpdateProjectAdrRequest, userId: string): Promise<ProjectAdrDto>;
  getAdrsByContextId(tenantId: string, contextId: string): Promise<ProjectAdrDto[]>;

  upsertValidationCommands(tenantId: string, contextId: string, req: UpsertValidationCommandsRequest): Promise<ValidationCommandDto[]>;
  getValidationCommandsByContextId(tenantId: string, contextId: string): Promise<ValidationCommandDto[]>;

  saveAgentExports(tenantId: string, projectId: string, contextId: string, exports: Omit<AgentExportDto, 'id' | 'tenantId' | 'projectId' | 'contextId'>[], userId: string): Promise<AgentExportDto[]>;
  getAgentExportsByContextId(tenantId: string, contextId: string): Promise<AgentExportDto[]>;
}
