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
  ];

  if (spec.summary) {
    lines.push("## Goal / Summary");
    lines.push(spec.summary, "");
  }

  if (spec.background) {
    lines.push("## Background / Business Context");
    lines.push(spec.background, "");
  }

  if (spec.currentBehavior) {
    lines.push("## Current Behavior");
    lines.push(spec.currentBehavior, "");
  }

  if (spec.desiredOutcome || spec.description) {
    lines.push("## Desired Outcome");
    lines.push(spec.desiredOutcome || spec.description || "", "");
  }

  if (spec.acceptanceCriteria?.length) {
    lines.push("## Acceptance Criteria");
    spec.acceptanceCriteria.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push("");
  }

  if (spec.outOfScope?.length) {
    lines.push("## Out of Scope");
    spec.outOfScope.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (spec.openQuestions?.length) {
    lines.push("## Open Questions");
    spec.openQuestions.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (spec.uiNotes) {
    lines.push("## UI Notes");
    lines.push(spec.uiNotes, "");
  }

  if (spec.technicalNotes) {
    lines.push("## Technical Notes");
    lines.push(spec.technicalNotes, "");
  }

  if (spec.edgeCases?.length) {
    lines.push("## Edge Cases");
    spec.edgeCases.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (spec.securityNotes) {
    lines.push("## Security / Privacy Notes");
    lines.push(spec.securityNotes, "");
  }

  if (spec.relatedFiles?.length) {
    lines.push("## Related Files / Areas");
    spec.relatedFiles.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (spec.suggestedSearchTerms?.length) {
    lines.push("## Suggested Search Terms");
    spec.suggestedSearchTerms.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (spec.verificationPlan?.length) {
    lines.push("## Verification Plan");
    spec.verificationPlan.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
