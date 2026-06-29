import type { SpecRecord } from "../../domain/entities/spec";

export function generateSpecVersionMarkdown(spec: SpecRecord): string {
  const lines = [
    `# ${spec.specNumber} ${spec.title}`,
    "",
    "## Summary",
    spec.summary || spec.description || "",
    "",
    "## Acceptance Criteria",
    ...spec.acceptanceCriteria.map((item) => `- ${item}`),
    "",
    "## Out of Scope",
    ...spec.outOfScope.map((item) => `- ${item}`),
  ];

  if (spec.technicalNotes)
    lines.push("", "## Technical Notes", spec.technicalNotes);
  if (spec.uiNotes) lines.push("", "## UI Notes", spec.uiNotes);
  return lines.join("\n");
}
