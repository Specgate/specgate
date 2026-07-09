import { describe, it, expect, vi } from "vitest";
import { SpecCopilotUseCase } from "./spec-copilot.usecase";
import { ActivityPublisherPort } from "../ports/specs-repository.port";

describe("SpecCopilotUseCase", () => {
  it("proposeChanges uses languageModel correctly", async () => {
    const mockSpecsRepo = {
      findSpec: vi.fn().mockResolvedValue({
        id: "s1",
        title: "Test Spec",
        acceptanceCriteria: [],
        outOfScope: [],
        openQuestions: [],
        edgeCases: [],
        suggestedSearchTerms: [],
        verificationPlan: []
      }),
      updateSpec: vi.fn(),
    };

    const mockLanguageModel = {
      generateStructuredData: vi.fn().mockResolvedValue({
        proposedChanges: [{ field: "acceptanceCriteria", operation: "append", after: "New criteria" }]
      }),
    };

    const useCase = new SpecCopilotUseCase(mockSpecsRepo as unknown as import("../ports/specs-repository.port").SpecsRepositoryPort, mockLanguageModel as unknown as import("./spec-copilot.usecase").SpecCopilotModelPort);

    const proposal = await useCase.proposeChanges("tenant-1", { specId: "s1", action: "improve_spec" });

    expect(proposal.specId).toBe("s1");
    expect(proposal.proposedChanges).toHaveLength(1);
    expect(mockLanguageModel.generateStructuredData).toHaveBeenCalled();
    expect(mockSpecsRepo.updateSpec).not.toHaveBeenCalled();
  });

  it("applyProposal strictly validates fields, operations, and selections", async () => {
    const mockSpecsRepo = {
      findSpec: vi.fn().mockResolvedValue({
        id: "s1",
        projectId: "p1",
        title: "Test Spec",
        background: "Old background",
        acceptanceCriteria: ["Old AC"],
        outOfScope: [],
        openQuestions: [],
        edgeCases: [],
        suggestedSearchTerms: [],
        verificationPlan: []
      }),
      updateSpec: vi.fn(),
    };

    const mockLanguageModel = {
      generateStructuredData: vi.fn(),
    };

    const mockActivity = {
      publish: vi.fn(),
    };

    const useCase = new SpecCopilotUseCase(mockSpecsRepo as unknown as import("../ports/specs-repository.port").SpecsRepositoryPort, mockLanguageModel as unknown as import("./spec-copilot.usecase").SpecCopilotModelPort, mockActivity as unknown as ActivityPublisherPort);

    const proposal = {
      id: "p1",
      specId: "s1",
      proposedChanges: [
        { field: "acceptanceCriteria", operation: "append", after: "New AC" },
        { field: "background", operation: "append", after: "New context" },
        { field: "outOfScope", operation: "invalid_op", after: "Something" },
        { field: "title", operation: "replace", after: "Hacked Title" },
        { field: "unknown_field", operation: "replace", after: "Data" },
        { field: "uiNotes", operation: "replace", after: "UI notes" },
      ]
    };

    const request = { 
      specId: "s1", 
      proposalId: "p1",
      selectedChanges: ["acceptanceCriteria", "background", "outOfScope", "title", "unknown_field"] 
    };

    await useCase.applyProposal("tenant-1", request, proposal as unknown as import('@corely/contracts/specgate').SpecCopilotProposalDto, "user-1");

    expect(mockSpecsRepo.updateSpec).toHaveBeenCalledWith("tenant-1", "s1", {
      background: "Old background\\nNew context",
      acceptanceCriteria: ["Old AC", "New AC"]
    });
    
    expect(mockActivity.publish).toHaveBeenCalled();
  });
});
