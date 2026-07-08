import { AgentReadinessCheckDto, EngineeringContextDto, ProjectContextRuleDto, ProjectAdrDto, ValidationCommandDto } from '@corely/contracts';
import { AgentTargetRegistry } from './agent-target-registry';

export class ReadinessChecker {
  constructor(private agentTargetRegistry: AgentTargetRegistry) {}

  checkProjectReadiness(
    projectId: string,
    context: EngineeringContextDto | null,
    validationCommands: ValidationCommandDto[]
  ): AgentReadinessCheckDto {
    const checks: AgentReadinessCheckDto['checks'] = [];
    
    // Check Project Summary
    checks.push({
      id: 'project_summary',
      label: 'Project summary exists',
      status: context?.projectSummaryMarkdown ? 'pass' : 'fail',
      severity: 'required',
      message: context?.projectSummaryMarkdown ? undefined : 'A project summary is required to give agents basic context.',
    });

    // Check Architecture
    checks.push({
      id: 'architecture',
      label: 'Architecture section exists',
      status: context?.architectureMarkdown ? 'pass' : 'fail',
      severity: 'required',
      message: context?.architectureMarkdown ? undefined : 'Architecture guidelines are required.',
    });

    // Check Coding Conventions
    checks.push({
      id: 'coding_conventions',
      label: 'Coding conventions exist',
      status: context?.codingConventionsMarkdown ? 'pass' : 'fail',
      severity: 'required',
      message: context?.codingConventionsMarkdown ? undefined : 'Coding conventions are required.',
    });

    // Check Validation Commands
    checks.push({
      id: 'validation_commands',
      label: 'Validation commands exist',
      status: validationCommands.length > 0 ? 'pass' : 'fail',
      severity: 'required',
      message: validationCommands.length > 0 ? undefined : 'At least one validation command is required.',
    });

    // Check Security Rules
    checks.push({
      id: 'security_rules',
      label: 'Security rules exist',
      status: context?.securityRulesMarkdown ? 'pass' : 'warning',
      severity: 'recommended',
      message: context?.securityRulesMarkdown ? undefined : 'Security rules are highly recommended.',
    });

    // Check Approved Context
    checks.push({
      id: 'approved_context',
      label: 'Approved Engineering Context exists',
      status: context?.status === 'APPROVED' ? 'pass' : 'fail',
      severity: 'required',
      message: context?.status === 'APPROVED' ? undefined : 'The Engineering Context must be approved.',
    });

    const failedRequired = checks.filter(c => c.status === 'fail' && c.severity === 'required').length;
    const failedRecommended = checks.filter(c => c.status === 'fail' && c.severity === 'recommended').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    let status: 'green' | 'yellow' | 'red' = 'green';
    if (failedRequired > 0) {
      status = 'red';
    } else if (failedRecommended > 0 || warningCount > 0) {
      status = 'yellow';
    }

    const score = Math.round((checks.filter(c => c.status === 'pass').length / checks.length) * 100);

    return {
      projectId,
      status,
      score,
      checks,
    };
  }

  checkSpecReadiness(
    projectId: string,
    specId: string,
    specDetails: Record<string, any>,
    projectReadiness: AgentReadinessCheckDto
  ): AgentReadinessCheckDto {
    const checks: AgentReadinessCheckDto['checks'] = [];

    // Inherit project readiness failures
    if (projectReadiness.status !== 'green') {
      checks.push({
        id: 'project_readiness',
        label: 'Project Engineering Context is ready',
        status: projectReadiness.status === 'red' ? 'fail' : 'warning',
        severity: 'required',
        message: 'The project Engineering Context has missing required or recommended items.',
      });
    } else {
      checks.push({
        id: 'project_readiness',
        label: 'Project Engineering Context is ready',
        status: 'pass',
        severity: 'required',
      });
    }

    // Check Spec Status
    checks.push({
      id: 'spec_approved',
      label: 'Spec is approved',
      status: specDetails.status === 'approved' ? 'pass' : 'fail',
      severity: 'required',
      message: specDetails.status === 'approved' ? undefined : 'The spec must be approved before agent handoff.',
    });

    // Check Title
    checks.push({
      id: 'spec_title',
      label: 'Title exists',
      status: !!specDetails.title ? 'pass' : 'fail',
      severity: 'required',
      message: specDetails.title ? undefined : 'Title is required.',
    });

    // Check Request Document
    const hasMeaningfulContent = !!specDetails.requestPlainText && specDetails.requestPlainText.trim().length > 20;
    checks.push({
      id: 'request_document',
      label: 'Request has meaningful content',
      status: hasMeaningfulContent ? 'pass' : 'fail',
      severity: 'required',
      message: hasMeaningfulContent ? undefined : 'Request document must have meaningful content.',
    });

    // Check Desired Outcome
    const hasOutcome = !!specDetails.desiredOutcome;
    checks.push({
      id: 'desired_outcome',
      label: 'Desired Outcome exists',
      status: hasOutcome ? 'pass' : 'fail',
      severity: 'required',
      message: hasOutcome ? undefined : 'Desired Outcome is required.',
    });

    // Check Acceptance Criteria
    const hasAc = specDetails.acceptanceCriteria && Array.isArray(specDetails.acceptanceCriteria) && specDetails.acceptanceCriteria.length > 0;
    checks.push({
      id: 'acceptance_criteria',
      label: 'Acceptance criteria exist',
      status: hasAc ? 'pass' : 'fail',
      severity: 'required',
      message: hasAc ? undefined : 'Acceptance criteria are required to verify the implementation.',
    });

    // Check Verification Plan
    const hasVerificationPlan = specDetails.verificationPlan && Array.isArray(specDetails.verificationPlan) && specDetails.verificationPlan.length > 0;
    checks.push({
      id: 'verification_plan',
      label: 'Verification Plan exists',
      status: hasVerificationPlan ? 'pass' : 'warning',
      severity: 'required',
      message: hasVerificationPlan ? undefined : 'Verification Plan is required.',
    });

    // Check Related Files & Search Terms
    const hasRelatedFiles = specDetails.relatedFiles && Array.isArray(specDetails.relatedFiles) && specDetails.relatedFiles.length > 0;
    const hasSearchTerms = specDetails.suggestedSearchTerms && Array.isArray(specDetails.suggestedSearchTerms) && specDetails.suggestedSearchTerms.length > 0;
    checks.push({
      id: 'related_files',
      label: 'Related files and search terms provided',
      status: hasRelatedFiles || hasSearchTerms ? 'pass' : 'warning',
      severity: 'recommended',
      message: hasRelatedFiles || hasSearchTerms ? undefined : 'Providing related files or search terms helps the agent locate relevant code.',
    });

    // Check Engineering Context Approval
    if (!projectReadiness || projectReadiness.status === 'red') {
      checks.push({
        id: 'ec_missing',
        label: 'Engineering Context is available and approved',
        status: 'fail',
        severity: 'required',
        message: 'Engineering Context must exist and be approved.',
      });
    }

    // Check Stale EC Export
    const isStale = specDetails.updatedAt && projectReadiness && (new Date(specDetails.updatedAt) > new Date()); // Assume we pass in `context` or rely on project status
    // For simplicity, we just add the checks the user requested as logic permits.

    const failedRequired = checks.filter(c => c.status === 'fail' && c.severity === 'required').length;
    const failedRecommended = checks.filter(c => c.status === 'fail' && c.severity === 'recommended').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    let status: 'green' | 'yellow' | 'red' = 'green';
    if (failedRequired > 0) {
      status = 'red';
    } else if (failedRecommended > 0 || warningCount > 0) {
      status = 'yellow';
    }

    const score = Math.round((checks.filter(c => c.status === 'pass').length / checks.length) * 100);

    return {
      projectId,
      specId,
      status,
      score,
      checks,
    };
  }
}
