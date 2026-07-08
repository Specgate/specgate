import { EngineeringContextDto, ProjectContextRuleDto, ProjectAdrDto, ValidationCommandDto } from '@corely/contracts';

export function renderAgentsMd(
  context: EngineeringContextDto,
  rules: ProjectContextRuleDto[],
  adrs: ProjectAdrDto[],
  validationCommands: ValidationCommandDto[]
): string {
  let md = `# Project Agent Instructions\n\n`;

  if (context.projectSummaryMarkdown) {
    md += `## Project Summary\n${context.projectSummaryMarkdown}\n\n`;
  }

  if (context.architectureMarkdown) {
    md += `## Architecture\n${context.architectureMarkdown}\n\n`;
  }

  if (context.codingConventionsMarkdown) {
    md += `## Coding Conventions\n${context.codingConventionsMarkdown}\n\n`;
  }

  if (validationCommands.length > 0) {
    md += `## Validation Commands\n`;
    validationCommands.forEach(cmd => {
      md += `- **${cmd.label}** (${cmd.commandType}): \`${cmd.command}\`\n`;
    });
    md += `\n`;
  }

  if (context.securityRulesMarkdown) {
    md += `## Security Rules\n${context.securityRulesMarkdown}\n\n`;
  }

  if (context.testingStrategyMarkdown) {
    md += `## Testing Rules\n${context.testingStrategyMarkdown}\n\n`;
  }

  if (adrs.length > 0) {
    md += `## ADRs\n`;
    adrs.forEach(adr => {
      md += `- ADR-${String(adr.number).padStart(3, '0')}: ${adr.title} (${adr.status})\n`;
    });
    md += `\n`;
  }

  md += `## Required Agent Behavior
- Do not start implementation unless the spec is approved.
- Do not change architecture without an ADR.
- Do not modify unrelated files.
- Do not run destructive commands.
- Do not bypass validation commands.
- After changes, report changed files, validation result, and risks.\n\n`;

  md += `## Scope-Specific Rules\n`;
  const globalRules = rules.filter(r => r.scopeType === 'GLOBAL');
  if (globalRules.length > 0) {
    globalRules.forEach(r => {
      md += `### ${r.title}\n${r.contentMarkdown}\n\n`;
    });
  } else {
    md += `See generated path-specific rule files where supported.\n`;
  }

  return md.trim() + '\n';
}
