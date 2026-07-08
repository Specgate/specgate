import { PromptRegistry, StaticPromptProvider, promptDefinitions } from "@corely/prompts";
import { SpecsRepositoryPort, ActivityPublisherPort } from "../ports/specs-repository.port";
import { SpecCopilotProposalDto, SpecCopilotProposalSchema, SpecCopilotActionRequest, ApplySpecCopilotProposalRequest } from "@corely/contracts/specgate";
import { randomUUID } from "crypto";
import { RequestContext } from "./specs.use-cases";

/**
 * Minimal port for language model usage within the specs module.
 * This is intentionally separate from the full LanguageModelPort in ai-copilot
 * to avoid a circular dependency: ai-copilot -> specs -> ai-copilot.
 */
export interface SpecCopilotModelPort {
  generateStructuredData<T>(params: {
    promptId: string;
    promptContext: Record<string, unknown>;
    promptVariables: Record<string, string>;
    schema: unknown;
    tenantId: string;
    userId?: string;
  }): Promise<T>;
}

export class SpecCopilotUseCase {
  private readonly promptRegistry: PromptRegistry;

  constructor(
    private readonly specsRepo: SpecsRepositoryPort,
    private readonly languageModel: SpecCopilotModelPort,
    private readonly activity?: ActivityPublisherPort
  ) {
    this.promptRegistry = new PromptRegistry([new StaticPromptProvider(promptDefinitions)]);
  }

  async proposeChanges(
    tenantId: string,
    request: SpecCopilotActionRequest,
    userId?: string
  ): Promise<SpecCopilotProposalDto> {
    const spec = await this.specsRepo.findSpec(tenantId, request.specId);
    if (!spec) throw new Error("Spec not found");

    const object = await this.languageModel.generateStructuredData({
      promptId: "specgate.copilot.propose",
      promptContext: {
        tenantId,
        environment: process.env.NODE_ENV || "development"
      },
      promptVariables: {
        userInstruction: request.userInstruction || request.action,
        requestText: spec.requestPlainText || "",
        title: spec.title,
        summary: spec.summary || "",
        background: spec.background || "",
        currentBehavior: spec.currentBehavior || "",
        desiredOutcome: spec.desiredOutcome || "",
        acceptanceCriteria: spec.acceptanceCriteria.join("\\n"),
        outOfScope: spec.outOfScope.join("\\n"),
        openQuestions: spec.openQuestions.join("\\n"),
        uiNotes: spec.uiNotes || "",
        technicalNotes: spec.technicalNotes || "",
        edgeCases: spec.edgeCases.join("\\n"),
        securityNotes: spec.securityNotes || "",
        suggestedSearchTerms: spec.suggestedSearchTerms.join("\\n"),
        verificationPlan: spec.verificationPlan.join("\\n")
      },
      schema: SpecCopilotProposalSchema.omit({ id: true, specId: true }),
      tenantId,
      userId,
    });

    if (this.activity && userId) {
      this.activity.publish({
        tenantId,
        projectId: spec.projectId,
        specId: spec.id,
        actorId: userId,
        type: "spec_copilot_proposal_generated",
        message: `Generated Spec Copilot proposal for: ${request.userInstruction || request.action}`,
      });
    }

    return {
      ...(object as Record<string, unknown>),
      id: randomUUID(),
      specId: spec.id,
    } as SpecCopilotProposalDto;
  }

  async applyProposal(
    tenantId: string,
    request: ApplySpecCopilotProposalRequest,
    proposal: SpecCopilotProposalDto,
    userId?: string
  ): Promise<void> {
    const spec = await this.specsRepo.findSpec(tenantId, request.specId);
    if (!spec) throw new Error("Spec not found");

    const allowedFields = [
      "goal", "background", "currentBehavior", "desiredOutcome", 
      "acceptanceCriteria", "outOfScope", "openQuestions", "uiNotes", 
      "technicalNotes", "edgeCases", "securityNotes", "relatedFiles", 
      "suggestedSearchTerms", "verificationPlan"
    ];

    const patch: any = {};
    let appliedCount = 0;

    for (const change of proposal.proposedChanges) {
      if (request.selectedChanges && !request.selectedChanges.includes(change.field)) {
        continue;
      }

      if (!allowedFields.includes(change.field)) {
        continue; // Prevent modification of protected fields
      }

      if (!["replace", "append"].includes(change.operation)) {
        continue; // Only allow safe operations
      }

      appliedCount++;
      if (change.operation === "replace") {
        patch[change.field] = change.after;
      } else if (change.operation === "append") {
        if (Array.isArray(spec[change.field as keyof typeof spec])) {
          patch[change.field] = [...(spec[change.field as keyof typeof spec] as any), change.after];
        } else {
          patch[change.field] = (spec[change.field as keyof typeof spec] || "") + "\\n" + change.after;
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      await this.specsRepo.updateSpec(tenantId, request.specId, patch);
      if (this.activity && userId) {
        this.activity.publish({
          tenantId,
          projectId: spec.projectId,
          specId: spec.id,
          actorId: userId,
          type: "spec_copilot_proposal_applied",
          message: `Applied ${appliedCount} changes from Spec Copilot proposal.`,
        });
      }
    }
  }
}

