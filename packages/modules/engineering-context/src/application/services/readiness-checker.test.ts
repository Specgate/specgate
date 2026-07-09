import { describe, it, expect } from 'vitest';
import { ReadinessChecker } from './readiness-checker';
import { AgentTargetRegistry } from './agent-target-registry';

describe('ReadinessChecker', () => {
  it('returns red when context is not approved', () => {
    const checker = new ReadinessChecker(new AgentTargetRegistry());
    const result = checker.checkProjectReadiness(
      'p1',
      { status: 'DRAFT' } as unknown as Parameters<ReadinessChecker['checkProjectReadiness']>[1],
      []
    );
    expect(result.status).toBe('red');
  });

  it('returns yellow when context is approved but lacking targets or rules', () => {
    const checker = new ReadinessChecker(new AgentTargetRegistry());
    const result = checker.checkProjectReadiness(
      'p1',
      { 
        status: 'APPROVED',
        projectSummaryMarkdown: 'test',
        architectureMarkdown: 'test',
        codingConventionsMarkdown: 'test',
        securityRulesMarkdown: '' // missing recommended field
      } as unknown as Parameters<ReadinessChecker['checkProjectReadiness']>[1],
      [{ command: 'test' } as unknown as Parameters<ReadinessChecker['checkProjectReadiness']>[2][0]]
    );
    expect(result.status).toBe('yellow');
  });

  it('returns green when context is approved, has rules, and has supported targets', () => {
    const checker = new ReadinessChecker(new AgentTargetRegistry());
    const registry = new AgentTargetRegistry();
    const result = checker.checkProjectReadiness(
      'p1',
      { 
        status: 'APPROVED', 
        projectSummaryMarkdown: 'test', 
        architectureMarkdown: 'test', 
        codingConventionsMarkdown: 'test',
        securityRulesMarkdown: 'test'
      } as unknown as Parameters<ReadinessChecker['checkProjectReadiness']>[1],
      [{ command: 'test' } as unknown as Parameters<ReadinessChecker['checkProjectReadiness']>[2][0]]
    );
    expect(result.status).toBe('green');
  });


  describe('checkSpecReadiness', () => {
    it('returns green when spec has all required and recommended fields', () => {
      const checker = new ReadinessChecker(new AgentTargetRegistry());
      const projectReadiness = { status: 'green' } as unknown as Parameters<ReadinessChecker['checkSpecReadiness']>[3];
      const specDetails = {
        status: 'approved',
        acceptanceCriteria: ['Must do X'],
        background: 'Some background',
        desiredOutcome: 'Do X',
        verificationPlan: ['Test X'],
        relatedFiles: ['src/index.ts']
      };
      const result = checker.checkSpecReadiness('p1', 's1', specDetails, projectReadiness);
      expect(result.status).toBe('green');
    });

    it('returns yellow when spec lacks recommended fields', () => {
      const checker = new ReadinessChecker(new AgentTargetRegistry());
      const projectReadiness = { status: 'green' } as unknown as Parameters<ReadinessChecker['checkSpecReadiness']>[3];
      const specDetails = {
        status: 'approved',
        acceptanceCriteria: ['Must do X'],
        background: '',
        desiredOutcome: '',
        verificationPlan: []
      };
      const result = checker.checkSpecReadiness('p1', 's1', specDetails, projectReadiness);
      expect(result.status).toBe('yellow');
    });

    it('returns red when spec lacks required fields', () => {
      const checker = new ReadinessChecker(new AgentTargetRegistry());
      const projectReadiness = { status: 'green' } as unknown as Parameters<ReadinessChecker['checkSpecReadiness']>[3];
      const specDetails = {
        status: 'approved',
        acceptanceCriteria: [], // Missing required
        background: 'Some background',
        desiredOutcome: 'Do X',
        verificationPlan: ['Test X']
      };
      const result = checker.checkSpecReadiness('p1', 's1', specDetails, projectReadiness);
      expect(result.status).toBe('red');
    });
  });
});
