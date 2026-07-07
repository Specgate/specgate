import { describe, it, expect } from "vitest";
import { generateAgentContext } from "../mock-ai";

describe("generateAgentContext", () => {
  it("generates markdown with YAML frontmatter", () => {
    const spec = {
      id: "REQ-123",
      title: "Test Feature",
      type: "feature",
      status: "approved",
      priority: "high",
      agentReadiness: "ready_for_agent",
      roadmapLane: "now",
      milestoneId: "m1",
      buildCycleId: "bc1",
      assigneeId: "u1",
      ownerId: "u2",
      approvedAt: "2026-06-25",
      previewUrl: "https://example.com",
      riskLevel: "low",
      requiresCodeChanges: "yes",
      summary: "A test feature",
      problem: "We need this",
      expectedBehavior: "It should work",
      acceptanceCriteria: ["Works"],
      outOfScope: ["Doesn't work"],
      openQuestions: [],
      suggestedSearchTerms: ["test"],
      relatedFiles: ["test.ts"],
      technicalNotes: "Use vitest",
      verificationPlan: ["Run tests"]
    };

    const markdown = generateAgentContext(spec as any);
    
    // Check frontmatter
    expect(markdown).toContain("---");
    expect(markdown).toContain("id: REQ-123");
    expect(markdown).toContain("type: feature");
    expect(markdown).toContain("risk_level: low");
    expect(markdown).toContain("requires_code_changes: yes");
    expect(markdown).toContain("agent_targets:");

    // Check headings and content
    expect(markdown).toContain("# REQ-123 — Test Feature");
    expect(markdown).toContain("## 1. Goal\n\nA test feature");
    expect(markdown).toContain("## 2. Background / Business Context\n\nWe need this");
    expect(markdown).toContain("## 4. Desired Outcome\n\nIt should work");
    expect(markdown).toContain("- [ ] Works");
    expect(markdown).toContain("- Doesn't work");
    expect(markdown).toContain("## 8. Suggested Search Terms\n\n```text\ntest\n```");
    expect(markdown).toContain("## 9. Related Files / Areas\n\n```text\ntest.ts\n```");
    expect(markdown).toContain("## 10. Implementation Notes\n\nUse vitest");
    expect(markdown).toContain("## 15. Verification Plan\n\n```bash\nRun tests\n```");
  });
});
