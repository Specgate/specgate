import { describe, it, expect } from 'vitest';
import { DeterministicAgentExportGenerator } from './deterministic-agent-export-generator';

describe('DeterministicAgentExportGenerator', () => {
  it('generates specific files for GitHub Copilot', async () => {
    const generator = new DeterministicAgentExportGenerator();
    const result = await generator.generateProjectExports({
      tenantId: 't1',
      projectId: 'p1',
      targets: [{ id: 'github_copilot', label: 'Copilot', category: 'agent', defaultEnabled: true }],
      context: { 
        id: '1', tenantId: 't1', projectId: 'p1', 
        status: 'APPROVED', version: 1, 
        createdAt: '', updatedAt: '', createdBy: 'u1' 
      },
      rules: [{
        id: 'r1', tenantId: 't1', projectId: 'p1', contextId: '1',
        title: 'Backend Rule', category: 'BACKEND', scopeType: 'GLOBAL',
        severity: 'REQUIRED', contentMarkdown: 'Do backend things',
        enabled: true, sortOrder: 0, targetAgentIds: [], createdBy: 'u1', createdAt: '', updatedAt: ''
      }],
      adrs: [],
      validationCommands: [],
      userId: 'u1'
    });

    const copilotInstructions = result.find(r => r.filePath === '.github/copilot-instructions.md');
    expect(copilotInstructions).toBeDefined();

    const backendRule = result.find(r => r.filePath === '.github/instructions/backend.instructions.md');
    expect(backendRule).toBeDefined();
    expect(backendRule?.contentMarkdown).toContain('Backend Rule');
  });

  it('generates specific files for Cursor', async () => {
    const generator = new DeterministicAgentExportGenerator();
    const result = await generator.generateProjectExports({
      tenantId: 't1',
      projectId: 'p1',
      targets: [{ id: 'cursor', label: 'Cursor', category: 'agent', defaultEnabled: true }],
      context: { 
        id: '1', tenantId: 't1', projectId: 'p1', 
        status: 'APPROVED', version: 1, 
        createdAt: '', updatedAt: '', createdBy: 'u1',
        architectureMarkdown: 'Architecture text'
      },
      rules: [{
        id: 'r1', tenantId: 't1', projectId: 'p1', contextId: '1',
        title: 'Security Rule', category: 'SECURITY', scopeType: 'GLOBAL', pathGlob: 'src/**/*.ts',
        severity: 'REQUIRED', contentMarkdown: 'No eval',
        enabled: true, sortOrder: 0, targetAgentIds: [], createdBy: 'u1', createdAt: '', updatedAt: ''
      }],
      adrs: [],
      validationCommands: [],
      userId: 'u1'
    });

    const archRule = result.find(r => r.filePath === '.cursor/rules/project-architecture.mdc');
    expect(archRule).toBeDefined();
    expect(archRule?.contentMarkdown).toContain('Architecture text');

    const secRule = result.find(r => r.filePath === '.cursor/rules/security.mdc');
    expect(secRule).toBeDefined();
    expect(secRule?.contentMarkdown).toContain('src/**/*.ts');
  });

  const supportedRenderers = [
    'generic_markdown', 'agents_md', 'codex', 'claude_code', 'github_copilot',
    'cursor', 'google_antigravity', 'gemini_cli', 'devin', 'windsurf',
    'cline', 'roo_code', 'custom'
  ];

  supportedRenderers.forEach(targetId => {
    it(`generates smoke test exports for ${targetId}`, async () => {
      const generator = new DeterministicAgentExportGenerator();
      const result = await generator.generateProjectExports({
        tenantId: 't1',
        projectId: 'p1',
        targets: [{ id: targetId, label: targetId, category: 'agent', defaultEnabled: true }],
        context: { 
          id: '1', tenantId: 't1', projectId: 'p1', 
          status: 'APPROVED', version: 1, 
          createdAt: '', updatedAt: '', createdBy: 'u1',
          architectureMarkdown: 'Architecture text'
        },
        rules: [],
        adrs: [],
        validationCommands: [],
        userId: 'u1'
      });
      // Smoke test: just ensure it doesn't crash and returns an array.
      // Depending on target, it might be empty if custom and no generic fallback logic,
      // but the method must resolve.
      expect(Array.isArray(result)).toBe(true);
    });
  });

  it('warns when spec is not approved', async () => {
    const generator = new DeterministicAgentExportGenerator();
    const result = await generator.generateSpecAgentContext({
      tenantId: 't1',
      projectId: 'p1',
      specId: 's1',
      specDetails: { title: 'Test Spec', status: 'draft', priority: 'high' } as any,
      targetAgent: { id: 'cursor', label: 'Cursor', category: 'agent', defaultEnabled: true },
      validationCommands: []
    });

    expect(result.markdown).toContain('WARNING: This spec is not approved');
  });
});
