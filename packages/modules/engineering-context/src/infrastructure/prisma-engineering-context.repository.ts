import { PrismaClient } from '@prisma/client';
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
import { EngineeringContextRepository } from '../application/ports/engineering-context.repository';

export class PrismaEngineeringContextRepository implements EngineeringContextRepository {
  constructor(private prisma: PrismaClient) {}

  async getEngineeringContext(tenantId: string, projectId: string): Promise<EngineeringContextDto | null> {
    const context = await this.prisma.specGateEngineeringContext.findFirst({
      where: { tenantId, projectId }
    });
    return context as unknown as EngineeringContextDto;
  }

  async upsertEngineeringContext(tenantId: string, req: UpsertEngineeringContextRequest, userId: string): Promise<EngineeringContextDto> {
    const existing = await this.prisma.specGateEngineeringContext.findFirst({
      where: { tenantId, projectId: req.projectId }
    });

    if (existing) {
      const updated = await this.prisma.specGateEngineeringContext.update({
        where: { id: existing.id },
        data: {
          projectSummaryMarkdown: req.projectSummaryMarkdown ?? existing.projectSummaryMarkdown,
          architectureMarkdown: req.architectureMarkdown ?? existing.architectureMarkdown,
          codingConventionsMarkdown: req.codingConventionsMarkdown ?? existing.codingConventionsMarkdown,
          testingStrategyMarkdown: req.testingStrategyMarkdown ?? existing.testingStrategyMarkdown,
          securityRulesMarkdown: req.securityRulesMarkdown ?? existing.securityRulesMarkdown,
          validationNotesMarkdown: req.validationNotesMarkdown ?? existing.validationNotesMarkdown,
          updatedBy: userId,
          status: existing.status === 'APPROVED' ? 'STALE' : existing.status,
          version: existing.version + 1,
        }
      });
      return updated as unknown as EngineeringContextDto;
    }

    const created = await this.prisma.specGateEngineeringContext.create({
      data: {
        tenantId,
        projectId: req.projectId,
        projectSummaryMarkdown: req.projectSummaryMarkdown,
        architectureMarkdown: req.architectureMarkdown,
        codingConventionsMarkdown: req.codingConventionsMarkdown,
        testingStrategyMarkdown: req.testingStrategyMarkdown,
        securityRulesMarkdown: req.securityRulesMarkdown,
        validationNotesMarkdown: req.validationNotesMarkdown,
        createdBy: userId,
        status: 'DRAFT',
      }
    });

    return created as unknown as EngineeringContextDto;
  }

  async approveEngineeringContext(tenantId: string, projectId: string, userId: string): Promise<EngineeringContextDto> {
    const existing = await this.prisma.specGateEngineeringContext.findFirst({
      where: { tenantId, projectId }
    });

    if (!existing) throw new Error('Not found');

    const updated = await this.prisma.specGateEngineeringContext.update({
      where: { id: existing.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
        updatedBy: userId,
      }
    });

    return updated as unknown as EngineeringContextDto;
  }

  async createRule(tenantId: string, contextId: string, req: CreateProjectContextRuleRequest, userId: string): Promise<ProjectContextRuleDto> {
    const rule = await this.prisma.specGateProjectContextRule.create({
      data: {
        tenantId,
        projectId: req.projectId,
        contextId,
        title: req.title,
        category: req.category,
        scopeType: req.scopeType,
        pathGlob: req.pathGlob ?? null,
        moduleName: req.moduleName ?? null,
        severity: req.severity,
        contentMarkdown: req.contentMarkdown,
        enabled: req.enabled ?? true,
        sortOrder: req.sortOrder ?? 0,
        targetAgentIds: req.targetAgentIds ?? [],
        createdBy: userId,
      } as any
    });
    return rule as unknown as ProjectContextRuleDto;
  }

  async updateRule(tenantId: string, req: UpdateProjectContextRuleRequest, userId: string): Promise<ProjectContextRuleDto> {
    const rule = await this.prisma.specGateProjectContextRule.update({
      where: { id: req.ruleId, tenantId },
      data: {
        title: req.title,
        category: req.category,
        scopeType: req.scopeType,
        pathGlob: req.pathGlob,
        moduleName: req.moduleName,
        severity: req.severity,
        contentMarkdown: req.contentMarkdown,
        enabled: req.enabled,
        sortOrder: req.sortOrder,
        targetAgentIds: req.targetAgentIds,
        updatedBy: userId,
      } as any
    });
    return rule as unknown as ProjectContextRuleDto;
  }

  async deleteRule(tenantId: string, projectId: string, ruleId: string): Promise<void> {
    await this.prisma.specGateProjectContextRule.delete({
      where: { id: ruleId, tenantId, projectId }
    });
  }

  async getRulesByContextId(tenantId: string, contextId: string): Promise<ProjectContextRuleDto[]> {
    const rules = await this.prisma.specGateProjectContextRule.findMany({
      where: { tenantId, contextId },
      orderBy: { sortOrder: 'asc' }
    });
    return rules as unknown as ProjectContextRuleDto[];
  }

  async createAdr(tenantId: string, contextId: string, req: CreateProjectAdrRequest, userId: string): Promise<ProjectAdrDto> {
    // Get max ADR number for this project
    const maxAdr = await this.prisma.specGateProjectAdr.findFirst({
      where: { tenantId, projectId: req.projectId },
      orderBy: { number: 'desc' }
    });
    
    const nextNumber = maxAdr ? maxAdr.number + 1 : 1;

    const adr = await this.prisma.specGateProjectAdr.create({
      data: {
        tenantId,
        projectId: req.projectId,
        contextId,
        number: nextNumber,
        title: req.title,
        status: req.status ?? 'PROPOSED',
        contextMarkdown: req.contextMarkdown,
        decisionMarkdown: req.decisionMarkdown,
        alternativesMarkdown: req.alternativesMarkdown ?? null,
        consequencesMarkdown: req.consequencesMarkdown ?? null,
        supersedesAdrId: req.supersedesAdrId ?? null,
        createdBy: userId,
      } as any
    });
    return adr as unknown as ProjectAdrDto;
  }

  async updateAdr(tenantId: string, req: UpdateProjectAdrRequest, userId: string): Promise<ProjectAdrDto> {
    const adr = await this.prisma.specGateProjectAdr.update({
      where: { id: req.adrId, tenantId },
      data: {
        title: req.title,
        status: req.status,
        contextMarkdown: req.contextMarkdown,
        decisionMarkdown: req.decisionMarkdown,
        alternativesMarkdown: req.alternativesMarkdown,
        consequencesMarkdown: req.consequencesMarkdown,
        supersedesAdrId: req.supersedesAdrId,
        updatedBy: userId,
        decidedAt: req.status === 'ACCEPTED' ? new Date() : undefined,
      } as any
    });
    return adr as unknown as ProjectAdrDto;
  }

  async getAdrsByContextId(tenantId: string, contextId: string): Promise<ProjectAdrDto[]> {
    const adrs = await this.prisma.specGateProjectAdr.findMany({
      where: { tenantId, contextId },
      orderBy: { number: 'asc' }
    });
    return adrs as unknown as ProjectAdrDto[];
  }

  async upsertValidationCommands(tenantId: string, contextId: string, req: UpsertValidationCommandsRequest): Promise<ValidationCommandDto[]> {
    // Basic replace all for now, in a real app we'd carefully upsert/delete
    await this.prisma.specGateProjectValidationCommand.deleteMany({
      where: { tenantId, contextId, projectId: req.projectId }
    });

    await this.prisma.specGateProjectValidationCommand.createMany({
      data: req.commands.map(cmd => ({
        id: cmd.id as any,
        tenantId,
        projectId: req.projectId,
        contextId,
        label: cmd.label,
        command: cmd.command,
        commandType: cmd.commandType,
        required: cmd.required ?? true,
        sortOrder: cmd.sortOrder ?? 0,
      }))
    });

    const commands = await this.getValidationCommandsByContextId(tenantId, contextId);
    return commands;
  }

  async getValidationCommandsByContextId(tenantId: string, contextId: string): Promise<ValidationCommandDto[]> {
    const commands = await this.prisma.specGateProjectValidationCommand.findMany({
      where: { tenantId, contextId },
      orderBy: { sortOrder: 'asc' }
    });
    return commands as unknown as ValidationCommandDto[];
  }

  async saveAgentExports(tenantId: string, projectId: string, contextId: string, exports: Omit<AgentExportDto, 'id' | 'tenantId' | 'projectId' | 'contextId'>[], userId: string): Promise<AgentExportDto[]> {
    const results: AgentExportDto[] = [];
    
    for (const exp of exports) {
      const saved = await this.prisma.specGateProjectAgentExport.upsert({
        where: {
          tenantId_projectId_targetAgentId_filePath: {
            tenantId,
            projectId,
            targetAgentId: exp.targetAgentId,
            filePath: exp.filePath
          }
        },
        update: {
          exportKind: exp.exportKind,
          contentMarkdown: exp.contentMarkdown,
          checksum: exp.checksum,
          generatedAt: new Date(),
        },
        create: {
          tenantId,
          projectId,
          contextId,
          targetAgentId: exp.targetAgentId,
          exportKind: exp.exportKind,
          filePath: exp.filePath,
          contentMarkdown: exp.contentMarkdown,
          checksum: exp.checksum,
          createdBy: userId,
        }
      });
      results.push(saved as unknown as AgentExportDto);
    }
    return results;
  }

  async getAgentExportsByContextId(tenantId: string, contextId: string): Promise<AgentExportDto[]> {
    const exports = await this.prisma.specGateProjectAgentExport.findMany({
      where: { tenantId, contextId },
      orderBy: { targetAgentId: 'asc' }
    });
    return exports as unknown as AgentExportDto[];
  }
}
