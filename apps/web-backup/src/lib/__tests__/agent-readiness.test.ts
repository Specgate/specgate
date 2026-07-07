import { describe, it, expect } from "vitest";
import { validateAgentReadiness } from "../agent-readiness";

describe("validateAgentReadiness", () => {
  it("returns ready_for_agent when all requirements are met", () => {
    const data = {
      summary: "Add a new button",
      expectedBehavior: "Button should be visible",
      acceptanceCriteria: ["Button is blue"],
      requiresCodeChanges: "yes" as const,
      suggestedSearchTerms: ["button"],
      verificationPlan: ["Click the button"]
    };
    
    const result = validateAgentReadiness(data);
    expect(result.status).toBe("ready_for_agent");
    expect(result.missingFields).toHaveLength(0);
  });

  it("returns blocked when code changes are required but there's no verification plan", () => {
    const data = {
      summary: "Add a new button",
      expectedBehavior: "Button should be visible",
      acceptanceCriteria: ["Button is blue"],
      requiresCodeChanges: "yes" as const,
      suggestedSearchTerms: ["button"],
      verificationPlan: []
    };
    
    const result = validateAgentReadiness(data);
    expect(result.status).toBe("blocked");
    expect(result.missingFields).toContain("Missing Verification Plan (required for code changes)");
  });

  it("returns needs_clarification when essential fields are missing", () => {
    const data = {
      summary: "",
      expectedBehavior: "",
      acceptanceCriteria: [],
      requiresCodeChanges: "unknown" as const,
      suggestedSearchTerms: [],
      verificationPlan: []
    };
    
    const result = validateAgentReadiness(data);
    expect(result.status).toBe("needs_clarification");
    expect(result.missingFields).toContain("Missing Goal / Summary");
    expect(result.missingFields).toContain("Missing Desired Outcome");
    expect(result.missingFields).toContain("Missing Acceptance Criteria");
    expect(result.missingFields).toContain("Clarify if code changes are required");
  });

  it("returns blocked when there are open questions and code changes are needed", () => {
    const data = {
      summary: "Add a new button",
      expectedBehavior: "Button should be visible",
      acceptanceCriteria: ["Button is blue"],
      requiresCodeChanges: "yes" as const,
      suggestedSearchTerms: ["button"],
      verificationPlan: ["Test"],
      openQuestions: ["What color is the button exactly?"]
    };
    
    const result = validateAgentReadiness(data);
    expect(result.status).toBe("blocked");
    expect(result.missingFields).toContain("Unresolved open questions remain");
  });
});
