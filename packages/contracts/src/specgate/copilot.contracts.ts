import { z } from "zod";

export const SpecCopilotActionRequestSchema = z.object({
  specId: z.string(),
  action: z.enum([
    "draft_spec",
    "improve_spec",
    "make_clearer",
    "generate_acceptance_criteria",
    "generate_out_of_scope",
    "find_missing_requirements",
    "identify_open_questions",
    "rewrite_for_stakeholders",
    "rewrite_for_agent_handoff",
    "suggest_related_files",
    "suggest_verification_plan",
    "check_readiness_gaps",
    "apply_engineering_context"
  ]),
  userInstruction: z.string().optional(),
  selectedSection: z.string().optional(),
  targetAgentId: z.string().optional(),
});
export type SpecCopilotActionRequest = z.infer<typeof SpecCopilotActionRequestSchema>;

export const SpecCopilotProposalChangeSchema = z.object({
  field: z.enum([
    "goal",
    "background",
    "currentBehavior",
    "desiredOutcome",
    "acceptanceCriteria",
    "outOfScope",
    "openQuestions",
    "uiNotes",
    "technicalNotes",
    "edgeCases",
    "securityNotes",
    "relatedFiles",
    "suggestedSearchTerms",
    "verificationPlan"
  ]),
  operation: z.enum(["replace", "append", "remove", "reorder"]),
  before: z.unknown().optional(),
  after: z.unknown(),
  reason: z.string().optional(),
});
export type SpecCopilotProposalChange = z.infer<typeof SpecCopilotProposalChangeSchema>;

export const SpecCopilotProposalSchema = z.object({
  id: z.string(),
  specId: z.string(),
  title: z.string(),
  summary: z.string(),
  proposedChanges: z.array(SpecCopilotProposalChangeSchema),
  readinessImpact: z.object({
    before: z.string(),
    after: z.string(),
    fixedIssues: z.array(z.string()),
    remainingIssues: z.array(z.string()),
  }).optional(),
});
export type SpecCopilotProposalDto = z.infer<typeof SpecCopilotProposalSchema>;

export const ApplySpecCopilotProposalRequestSchema = z.object({
  specId: z.string(),
  proposalId: z.string(),
  selectedChanges: z.array(z.string()).optional(),
});
export type ApplySpecCopilotProposalRequest = z.infer<typeof ApplySpecCopilotProposalRequestSchema>;

export const GeneratedSpecAgentContextDtoSchema = z.object({
  specId: z.string(),
  targetAgentId: z.string(),
  readiness: z.object({
    status: z.enum(["green", "yellow", "red"]),
    label: z.string(),
    blockingIssues: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
  includedContext: z.object({
    engineeringContextVersion: z.number().optional(),
    adrIds: z.array(z.string()),
    ruleIds: z.array(z.string()),
    validationCommandIds: z.array(z.string()),
  }),
  contentMarkdown: z.string(),
  generatedAt: z.string(),
});
export type GeneratedSpecAgentContextDto = z.infer<typeof GeneratedSpecAgentContextDtoSchema>;

export const GenerateSpecAgentContextRequestSchema = z.object({
  targetAgentId: z.string(),
});
export type GenerateSpecAgentContextRequest = z.infer<typeof GenerateSpecAgentContextRequestSchema>;

