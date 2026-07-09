import { AgentExportGeneratorPort, GenerateExportsInput, GenerateSpecContextInput } from '../application/ports/agent-export-generator.port';
import { AgentExportDto } from '@corely/contracts';
import { renderAgentsMd } from '../application/services/markdown-renderers/render-agents-md';

export class DeterministicAgentExportGenerator implements AgentExportGeneratorPort {
  async generateProjectExports(input: GenerateExportsInput): Promise<Omit<AgentExportDto, 'id' | 'tenantId' | 'projectId' | 'contextId'>[]> {
    const exports: Omit<AgentExportDto, 'id' | 'tenantId' | 'projectId' | 'contextId'>[] = [];
    const baseContent = renderAgentsMd(input.context, input.rules, input.adrs, input.validationCommands);

    for (const target of input.targets) {
      if (target.id === 'agents_md') {
        exports.push(this.createExport(target.id, 'CANONICAL', 'AGENTS.md', baseContent, input.userId));
      } else if (target.id === 'generic_markdown') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'specgate-agent-export/generic-agent-context.md', baseContent, input.userId));
      } else if (target.id === 'codex') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'AGENTS.md', baseContent, input.userId));
      } else if (target.id === 'claude_code') {
        const content = `@AGENTS.md\n\n## Claude Code Notes\n\nUse plan mode before large refactors.\nFor large tasks, explain the plan before editing.\nDo not create commits unless explicitly requested.\n`;
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'CLAUDE.md', content, input.userId));
        input.rules.forEach(rule => {
          if (rule.pathGlob || rule.scopeType === 'PATH') {
            const ruleContent = `---\npaths:\n  - "${rule.pathGlob || '*'}"\n---\n\n# ${rule.title}\n${rule.contentMarkdown}\n`;
            exports.push(this.createExport(target.id, 'RULE', `.claude/rules/${this.slugify(rule.title)}.md`, ruleContent, input.userId));
          }
        });
      } else if (target.id === 'google_antigravity') {
        const content = `# SpecGate Implementation Workflow\n\n## Steps\n1. Read the approved spec.\n2. Read project Engineering Context.\n3. Identify affected files.\n4. Plan implementation.\n5. Make the smallest safe code change.\n6. Run validation commands.\n7. Produce artifacts:\n   - changed files\n   - validation output\n   - screenshots if UI changed\n   - risks and follow-up notes\n8. Do not mark done until stakeholder preview is accepted.\n`;
        exports.push(this.createExport(target.id, 'WORKFLOW', 'specgate-agent-export/antigravity-workflows.md', content, input.userId));
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'antigravity-workspace-rules.md', baseContent, input.userId));
      } else if (target.id === 'github_copilot') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', '.github/copilot-instructions.md', baseContent, input.userId));
        const categories = ['backend', 'frontend', 'database', 'testing'];
        categories.forEach(category => {
          const rules = input.rules.filter(r => r.category.toLowerCase() === category);
          if (rules.length > 0) {
            const ruleContent = `# ${category.toUpperCase()} Rules\n\n${rules.map(r => `## ${r.title}\n${r.contentMarkdown}`).join('\n\n')}`;
            exports.push(this.createExport(target.id, 'RULE', `.github/instructions/${category}.instructions.md`, ruleContent, input.userId));
          }
        });
      } else if (target.id === 'cursor') {
        exports.push(this.createExport(target.id, 'RULE', '.cursor/rules/project-architecture.mdc', `---\ndescription: Project Architecture\nglobs: *\n---\n${input.context.architectureMarkdown || 'N/A'}`, input.userId));
        const categories = ['backend', 'frontend', 'database', 'testing', 'security'];
        categories.forEach(category => {
          const rules = input.rules.filter(r => r.category.toLowerCase() === category);
          if (rules.length > 0) {
            const ruleContent = `---\ndescription: ${category} rules\nglobs: ${rules[0].pathGlob || '*'}\n---\n${rules.map(r => `## ${r.title}\n${r.contentMarkdown}`).join('\n\n')}`;
            exports.push(this.createExport(target.id, 'RULE', `.cursor/rules/${category}.mdc`, ruleContent, input.userId));
          }
        });
      } else if (target.id === 'gemini_cli') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'GEMINI.md', baseContent, input.userId));
      } else if (target.id === 'devin') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'AGENTS.md', baseContent, input.userId));
        exports.push(this.createExport(target.id, 'WORKFLOW', '.agents/skills/specgate-implementation/SKILL.md', `---\nname: SpecGate Implementation\ndescription: How to implement a spec\n---\n# Steps\n1. Read spec.\n2. Write code.\n3. Validate.`, input.userId));
        exports.push(this.createExport(target.id, 'WORKFLOW', '.agents/skills/specgate-review/SKILL.md', `---\nname: SpecGate Review\ndescription: How to review a spec\n---\n# Steps\n1. Review code.\n2. Add comments.`, input.userId));
      } else if (target.id === 'windsurf') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', '.windsurf/rules/project.md', input.context.projectSummaryMarkdown || 'N/A', input.userId));
        const categories = ['backend', 'frontend', 'database', 'testing'];
        categories.forEach(category => {
          const rules = input.rules.filter(r => r.category.toLowerCase() === category);
          if (rules.length > 0) {
            const ruleContent = `# ${category.toUpperCase()} Rules\n\n${rules.map(r => `## ${r.title}\n${r.contentMarkdown}`).join('\n\n')}`;
            exports.push(this.createExport(target.id, 'RULE', `.windsurf/rules/${category}.md`, ruleContent, input.userId));
          }
        });
        exports.push(this.createExport(target.id, 'WORKFLOW', '.windsurf/workflows/specgate-implementation.md', `# Workflow\nFollow standard implementation process.`, input.userId));
      } else if (target.id === 'cline') {
        exports.push(this.createExport(target.id, 'RULE', '.clinerules/architecture.md', input.context.architectureMarkdown || 'N/A', input.userId));
        exports.push(this.createExport(target.id, 'RULE', '.clinerules/coding.md', input.context.codingConventionsMarkdown || 'N/A', input.userId));
        const categories = ['backend', 'frontend', 'database', 'testing', 'security'];
        categories.forEach(category => {
          const rules = input.rules.filter(r => r.category.toLowerCase() === category);
          if (rules.length > 0) {
            const ruleContent = `# ${category.toUpperCase()} Rules\n\n${rules.map(r => `## ${r.title}\n${r.contentMarkdown}`).join('\n\n')}`;
            exports.push(this.createExport(target.id, 'RULE', `.clinerules/${category}.md`, ruleContent, input.userId));
          }
        });
      } else if (target.id === 'roo_code') {
        exports.push(this.createExport(target.id, 'RULE', '.roo/rules/01-project.md', input.context.projectSummaryMarkdown || 'N/A', input.userId));
        exports.push(this.createExport(target.id, 'RULE', '.roo/rules/02-architecture.md', input.context.architectureMarkdown || 'N/A', input.userId));
        exports.push(this.createExport(target.id, 'RULE', '.roo/rules/03-coding.md', input.context.codingConventionsMarkdown || 'N/A', input.userId));
        exports.push(this.createExport(target.id, 'RULE', '.roo/rules/04-testing.md', input.context.testingStrategyMarkdown || 'N/A', input.userId));
        exports.push(this.createExport(target.id, 'RULE', '.roo/rules/05-security.md', input.context.securityRulesMarkdown || 'N/A', input.userId));
      } else if (target.id === 'custom') {
        exports.push(this.createExport(target.id, 'TOOL_SPECIFIC', 'specgate-agent-export/custom-agent-context.md', baseContent, input.userId));
      }
    }

    return exports;
  }

  async generateSpecAgentContext(input: GenerateSpecContextInput): Promise<{ markdown: string }> {
    let md = `# Spec: ${input.specDetails.title || input.specId}\n\n`;
    if (input.specDetails.status !== 'approved') {
      md += `> **WARNING: This spec is not approved. Do not start implementation.**\n\n`;
    }
    
    md += `## Spec Details\n`;
    md += `- Status: ${input.specDetails.status}\n`;
    md += `- Priority: ${input.specDetails.priority}\n\n`;

    if (input.specDetails.summary) md += `### Summary\n${input.specDetails.summary}\n\n`;
    if (input.specDetails.acceptanceCriteriaJson) md += `### Acceptance Criteria\n${JSON.stringify(input.specDetails.acceptanceCriteriaJson, null, 2)}\n\n`;

    if (input.specDetails.documents && Array.isArray(input.specDetails.documents) && input.specDetails.documents.length > 0) {
      md += `## Related Project Documents\n`;
      input.specDetails.documents.forEach((doc: { id: string; title: string; type: string; summary?: string; contentJson?: unknown; assets?: { id: string; kind: string; fileName: string }[] }) => {
        md += `### ${doc.title} (${doc.type})\n`;
        if (doc.summary) md += `${doc.summary}\n\n`;
        if (doc.contentJson) {
           md += `> Document Content: ${JSON.stringify(doc.contentJson, null, 2)}\n\n`;
        }
        if (doc.assets && Array.isArray(doc.assets) && doc.assets.length > 0) {
          md += `#### Attachments\n\n`;
          doc.assets.forEach((asset: { id: string; kind: string; fileName: string }) => {
            md += `- ${asset.kind === "pdf" ? "PDF" : "Image"}: ${asset.fileName}\n`;
            md += `  Asset ID: ${asset.id}\n`;
            md += `  Open in SpecGate: /documents/${doc.id}/assets/${asset.id}\n\n`;
          });
        }
      });
    }

    md += `## Project Engineering Context\n`;
    md += `See \`AGENTS.md\` or target-specific instructions for full details.\n\n`;
    if (input.validationCommands.length > 0) {
      md += `### Included validation commands\n`;
      input.validationCommands.filter(c => c.required).forEach(cmd => {
        md += `- \`${cmd.command}\`\n`;
      });
      md += `\n`;
    }

    if (input.rules && input.rules.length > 0) {
      md += `### Included rules\n`;
      input.rules.forEach(r => {
        md += `- ${r.title}\n`;
      });
      md += `\n`;
    }

    if (input.adrs && input.adrs.length > 0) {
      md += `### Included ADRs\n`;
      input.adrs.forEach(adr => {
        md += `- ${adr.title}\n`;
      });
      md += `\n`;
    }

    return { markdown: md };
  }

  private createExport(targetAgentId: string, exportKind: string, filePath: string, contentMarkdown: string, createdBy: string) {
    return {
      targetAgentId,
      exportKind: exportKind as import('@corely/contracts').AgentExportDto['exportKind'],
      filePath,
      contentMarkdown,
      checksum: this.hash(contentMarkdown),
      generatedAt: new Date().toISOString(),
      createdBy,
    };
  }

  private hash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
}
