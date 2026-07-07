import type { ApprovedSpecSnapshot } from "@corely/contracts/specgate";

export function generateSpecMarkdown(spec: ApprovedSpecSnapshot): string {
  const lines = [
    "---",
    `id: ${spec.specNumber}`,
    `title: ${spec.title}`,
    `status: ${spec.status}`,
    `assignee: ${spec.assigneeId || "agent"}`,
    `target_branch: feature/${spec.specNumber.toLowerCase()}`,
    "---",
    "",
    `# Specification: ${spec.title}`,
    "",
    "<context>",
    spec.summary || "No context provided.",
    "</context>",
    "",
    "<intent>",
    spec.description || "No intent provided.",
    "</intent>",
    "",
    "## Architecture & Implementation",
    "",
    "<architecture>",
    spec.technicalNotes || "None specified.",
    "</architecture>",
    "",
    "## Acceptance Criteria",
    "",
    "<acceptance_criteria>",
    ...spec.acceptanceCriteria.map((item, index) => `${index + 1}. ${item}`),
    "</acceptance_criteria>",
    "",
    "## Constraints & Out of Scope",
    "",
    "<constraints>",
    ...spec.outOfScope.map((item) => `- ${item}`),
    "</constraints>",
  ];

  return lines.join("\n");
}
