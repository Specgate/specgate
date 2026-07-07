import { z } from "zod";
import { type PromptDefinition } from "../types";

export const specgateCopilotPrompts: PromptDefinition[] = [
  {
    id: "specgate.copilot.system",
    description: "System prompt for Spec Copilot",
    defaultVersion: "v1",
    versions: [
      {
        version: "v1",
        template: `
You are Spec Copilot, an AI assistant built into SpecGate. 
Your goal is to help Product Managers and Engineers craft, refine, and finalize high-quality software specifications.
You must be rigorous, analytical, and heavily focused on edge cases, unstated assumptions, and engineering readiness.

When asked to draft or improve a spec, use your analytical skills to fill in gaps.
You have access to tools that can generate spec proposals.
`,
        variablesSchema: z.object({
          PROPOSE_SPEC_CHANGE: z.string().optional()
        }),
        variables: [{ key: "PROPOSE_SPEC_CHANGE" }],
      }
    ],
    tags: ["system", "specgate"],
  },
  {
    id: "specgate.copilot.propose",
    description: "Prompt for generating a spec proposal",
    defaultVersion: "v1",
    versions: [
      {
        version: "v1",
        template: `
You are tasked with generating a structured proposal for changes to a SpecGate specification.
The user has requested the following changes:
{{userInstruction}}

Currently, the spec has the following content:
# Title: {{title}}
# Summary: {{summary}}
# Background: {{background}}
# Current Behavior: {{currentBehavior}}
# Desired Outcome: {{desiredOutcome}}
# Acceptance Criteria:
{{acceptanceCriteria}}
# Out of Scope:
{{outOfScope}}
# Open Questions:
{{openQuestions}}
# UI Notes:
{{uiNotes}}
# Technical Notes:
{{technicalNotes}}
# Edge Cases:
{{edgeCases}}
# Security Notes:
{{securityNotes}}
# Suggested Search Terms:
{{suggestedSearchTerms}}
# Verification Plan:
{{verificationPlan}}

Generate a list of proposed changes to improve this spec based on the user instruction.
Focus on identifying hidden edge cases and ensuring engineering context is clear.
`,
        variablesSchema: z.object({
          userInstruction: z.string(),
          title: z.string().optional(),
          summary: z.string().optional(),
          background: z.string().optional(),
          currentBehavior: z.string().optional(),
          desiredOutcome: z.string().optional(),
          acceptanceCriteria: z.string().optional(),
          outOfScope: z.string().optional(),
          openQuestions: z.string().optional(),
          uiNotes: z.string().optional(),
          technicalNotes: z.string().optional(),
          edgeCases: z.string().optional(),
          securityNotes: z.string().optional(),
          suggestedSearchTerms: z.string().optional(),
          verificationPlan: z.string().optional()
        }),
        variables: [
          { key: "userInstruction" },
          { key: "title" },
          { key: "summary" },
          { key: "background" },
          { key: "currentBehavior" },
          { key: "desiredOutcome" },
          { key: "acceptanceCriteria" },
          { key: "outOfScope" },
          { key: "openQuestions" },
          { key: "uiNotes" },
          { key: "technicalNotes" },
          { key: "edgeCases" },
          { key: "securityNotes" },
          { key: "suggestedSearchTerms" },
          { key: "verificationPlan" }
        ],
      }
    ],
    tags: ["propose", "specgate"],
  }
];

