import type { Spec } from "@/types/demo";

export type AgentReadinessStatus = "ready_for_agent" | "needs_clarification";

export interface ReadinessValidationResult {
  status: AgentReadinessStatus;
  missingFields: string[];
}

export function validateAgentReadiness(
  spec: Partial<Spec> & { 
    summary?: string; 
    expectedBehavior?: string; 
    acceptanceCriteria?: string[]; 
    outOfScope?: string[];
    openQuestions?: string[];
    verificationPlan?: string[];
    requiresCodeChanges?: string;
    relatedFiles?: string[];
    suggestedSearchTerms?: string[];
    riskLevel?: string;
    technicalNotes?: string;
  }
): ReadinessValidationResult {
  const missingFields: string[] = [];

  const goal = spec.summary?.trim() || "";
  const desiredOutcome = spec.expectedBehavior?.trim() || "";
  
  if (!goal) {
    missingFields.push("Missing goal or summary");
  }

  if (!desiredOutcome) {
    missingFields.push("Missing desired outcome");
  }

  const ac = spec.acceptanceCriteria || [];
  const validAc = ac.filter(item => item.trim() !== "" && item.trim() !== "(none)");
  if (validAc.length === 0) {
    missingFields.push("Missing acceptance criteria");
  }

  const oos = spec.outOfScope || [];
  const validOos = oos.filter(item => item.trim() !== "");
  if (validOos.length === 0) {
    missingFields.push("Missing out of scope items (or 'None confirmed')");
  }

  const vp = spec.verificationPlan || [];
  const validVp = vp.filter(item => item.trim() !== "");
  if (validVp.length === 0) {
    missingFields.push("Missing verification plan");
  }

  const oq = spec.openQuestions || [];
  const blockingOq = oq.filter(q => q.trim() !== "" && !q.toLowerCase().includes("non-blocking"));
  if (blockingOq.length > 0) {
    missingFields.push("Open questions are still blocking");
  }

  if (spec.requiresCodeChanges === "yes") {
    const hasFiles = (spec.relatedFiles || []).length > 0;
    const hasSearch = (spec.suggestedSearchTerms || []).length > 0;
    if (!hasFiles && !hasSearch) {
      missingFields.push("Requires related files or suggested search terms for code changes");
    }
  }

  if (spec.riskLevel === "high") {
    const notes = spec.technicalNotes || "";
    if (!notes.toLowerCase().includes("security") && !notes.toLowerCase().includes("privacy") && !notes.toLowerCase().includes("rollback")) {
      missingFields.push("High risk requires security/privacy/rollback notes in Technical Notes");
    }
  }

  const status = missingFields.length === 0 ? "ready_for_agent" : "needs_clarification";

  return { status, missingFields };
}
