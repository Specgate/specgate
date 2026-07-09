import { z } from "zod";
import { type PromptDefinition } from "../types";

export const crmPrompts: PromptDefinition[] = [
  {
    id: "crm.follow_up_suggestions",
    description: "Suggest follow-up activities for a CRM deal.",
    defaultVersion: "v1",
    versions: [
      {
        version: "v1",
        template:
          "Generate 2-4 suggested follow-up activities for this deal:\n\n" +
          "Deal: {{DEAL_TITLE}}\n" +
          "Stage: {{DEAL_STAGE}}\n" +
          "Amount: {{DEAL_AMOUNT}}\n" +
          "Expected Close: {{DEAL_EXPECTED_CLOSE}}\n" +
          "Notes: {{DEAL_NOTES}}\n\n" +
          "Existing Activities:\n{{{EXISTING_ACTIVITIES}}}\n\n" +
          "{{{CONTEXT_SECTION}}}\n\n" +
          "Suggest practical next steps to move this deal forward.",
        variablesSchema: z.object({
          DEAL_TITLE: z.string().min(1),
          DEAL_STAGE: z.string().min(1),
          DEAL_AMOUNT: z.string().min(1),
          DEAL_EXPECTED_CLOSE: z.string().min(1),
          DEAL_NOTES: z.string().min(1),
          EXISTING_ACTIVITIES: z.string(),
          CONTEXT_SECTION: z.string(),
        }),
        variables: [
          { key: "DEAL_TITLE" },
          { key: "DEAL_STAGE" },
          { key: "DEAL_AMOUNT" },
          { key: "DEAL_EXPECTED_CLOSE" },
          { key: "DEAL_NOTES" },
          { key: "EXISTING_ACTIVITIES", kind: "block" },
          { key: "CONTEXT_SECTION", kind: "block" },
        ],
      },
    ],
    tags: ["crm", "follow-up"],
  },
];
