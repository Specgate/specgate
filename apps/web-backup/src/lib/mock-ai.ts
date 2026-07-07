import type { Spec } from "@/types/demo";

export function generateClarifyingQuestions(): string[] {
  return [
    "Who is the primary user?",
    "What should happen on success?",
    "What should happen on error?",
    "What is explicitly out of scope?",
    "Is this needed for MVP, Beta, or later?",
  ];
}

import { users } from "./mock-data";

export function generateAgentContext(spec: Spec): string {
  const requesterUser = users.find(u => u.id === spec.ownerId);
  const requesterName = requesterUser ? requesterUser.name : (spec.ownerId || "null");

  const frontmatter = `---
id: ${spec.id}
title: ${spec.title}
type: ${spec.type || "feature"}
status: ${spec.status}
priority: ${spec.priority}
agent_readiness: ${spec.agentReadiness || "needs_clarification"}
roadmap_lane: ${spec.roadmapLane}
milestone: ${spec.milestoneId || "null"}
build_cycle: ${spec.buildCycleId || "null"}
assignee: ${spec.assigneeId || "null"}
requester: ${requesterName}
approved_by: null
approved_at: ${spec.approvedAt || "null"}
repo: null
target_branch: main
preview_url: ${spec.previewUrl || "null"}
agent_targets:
  - claude_code
  - codex
  - cursor
  - github_copilot
  - generic_markdown
risk_level: ${spec.riskLevel || "medium"}
requires_code_changes: ${spec.requiresCodeChanges || "unknown"}
---`;

  return `${frontmatter}

# ${spec.id} — ${spec.title}

## 1. Goal

${spec.summary || "Not specified"}

## 2. Background / Business Context

${spec.problem || "Not specified"}

## 3. Current Behavior

Not specified

## 4. Desired Outcome

${spec.expectedBehavior || "Not specified"}

## 5. Scope

### In Scope

- All requirements listed in Acceptance Criteria

### Out of Scope

${(spec.outOfScope || []).filter(i => i.trim() !== "" && i.trim() !== "(none)").length > 0 ? spec.outOfScope.filter(i => i.trim() !== "" && i.trim() !== "(none)").map(i => `- ${i}`).join("\\n") : ""}

## 6. Acceptance Criteria

${(spec.acceptanceCriteria || []).filter(i => i.trim() !== "" && i.trim() !== "(none)").length > 0 ? spec.acceptanceCriteria.filter(i => i.trim() !== "" && i.trim() !== "(none)").map(i => `- [ ] ${i}`).join("\\n") : ""}

## 7. Agent Instructions

Before editing files:

1. Inspect the repository structure.
2. Read any existing project instructions such as \`AGENTS.md\`, \`CLAUDE.md\`, \`.github/copilot-instructions.md\`, or similar files.
3. Search for related code, docs, tests, environment variables, and existing patterns.
4. Produce a short plan.
5. Prefer minimal, focused changes.
6. Reuse existing architecture patterns.
7. Do not introduce new dependencies unless necessary.
8. Do not change unrelated behavior.
9. Report all commands run and results.

## 8. Suggested Search Terms

${(spec.suggestedSearchTerms || []).length > 0 ? \`\\\`\\\`\\\`text\\n\${spec.suggestedSearchTerms.join("\\n")}\\n\\\`\\\`\\\`\` : ""}

## 9. Related Files / Areas

${(spec.relatedFiles || []).length > 0 ? \`\\\`\\\`\\\`text\\n\${spec.relatedFiles.join("\\n")}\\n\\\`\\\`\\\`\` : ""}

## 10. Implementation Notes

${spec.technicalNotes || ""}

## 11. Data / API Contract Notes



## 12. UI / UX Notes



## 13. Edge Cases



## 14. Security / Privacy / Permissions



## 15. Verification Plan

${(spec.verificationPlan || []).length > 0 ? \`\\\`\\\`\\\`bash\\n\${spec.verificationPlan.join("\\n")}\\n\\\`\\\`\\\`\` : ""}

## 16. Definition of Done

* [ ] Acceptance criteria are satisfied.
* [ ] Final summary explains what changed or what was reviewed.
* [ ] Commands run and results are listed.
* [ ] Remaining risks are listed.
* [ ] Follow-up tickets are suggested if needed.
* [ ] Human reviewer can understand the result without reading the full diff.

## 17. Open Questions

${(spec.openQuestions || []).filter(i => i.trim() !== "").length > 0 ? spec.openQuestions.filter(i => i.trim() !== "").map(i => `- ${i}`).join("\\n") : ""}
`;
}

export function runSpecCodeCheck(spec: Spec): { ok: boolean; message: string } {
  if (spec.warning) {
    return {
      ok: false,
      message: `Potential mismatch:\n${spec.warning}\n\nSuggested fix: align implementation and test fixtures with the approved spec.`,
    };
  }
  return { ok: true, message: "No mismatches detected. Implementation matches the approved spec." };
}

export function generateReleaseNotes(spec: Spec): string {
  return (
    spec.releaseNotes ??
    `Shipped ${spec.title}. ${spec.summary}`
  );
}

export function suggestRoadmapPlan(): string {
  return `Move Team Invite to Now because it is high priority and already in stakeholder review.
Move Audience Import to Next because it is approved but belongs to Beta.
Keep Public Partner Links in Later because SEO policy questions are unresolved.
Keep AI Weekly Summary in Icebox because it is not needed for MVP.`;
}

export function summarizeBuildCycle(): string {
  return `MVP Build Week 1 Summary

Completed:
- Waitlist Signup

In progress:
- Product Asset Library

Needs attention:
- Team Invite has a possible expiry mismatch before stakeholder approval.`;
}

export function fakeDelay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}
