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

export function generateAgentContext(spec: Spec): string {
  return `# Agent Context: ${spec.id} ${spec.title}

## Goal
Implement the approved ${spec.title} feature.

## Approved behavior
${spec.expectedBehavior ?? spec.summary}

## Acceptance criteria
${spec.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}

## Constraints
- Do not rewrite the auth module.
- Use existing email service.
- Keep current team permission model.

## Suggested implementation
1. Add API endpoint.
2. Add data model.
3. Add email/notification template.
4. Add frontend form.
5. Add error states.
6. Add tests.
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
