import type { ApprovedSpecSnapshot } from "@corely/contracts/specgate";

export function generateSpecMarkdown(spec: ApprovedSpecSnapshot): string {
  const related = spec.relatedFiles.length
    ? spec.relatedFiles.map((file) => `  - ${file}`).join("\n")
    : "  []";
  const lines = [
    "---",
    `id: ${spec.specNumber}`,
    `title: ${spec.title}`,
    `status: ${spec.status}`,
    `priority: ${spec.priority}`,
    `roadmap_lane: ${spec.roadmapLane}`,
    "target_milestone: null",
    "build_cycle: null",
    `approved_by: ${spec.approvedBy || "null"}`,
    `approved_at: ${spec.approvedAt || "null"}`,
    "related_files:",
    related,
    "---",
    "",
    `# ${spec.title}`,
    "",
    "## Problem",
    spec.summary || spec.description || "",
    "",
    "## Expected Behavior",
    spec.description || spec.summary || "",
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
