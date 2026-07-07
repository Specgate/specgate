import {
  PrismaSpecsRepository,
  SpecsUseCases,
  SpecCopilotUseCase,
  type SpecCopilotModelPort,
  type RequestContext,
} from "@corely/modules-specs";
import {
  PrismaPlanningRepository,
  PlanningUseCases,
} from "@corely/modules-planning";
import { PrismaAgentRepository, AgentUseCases } from "@corely/modules-agent";
import {
  PrismaImplementationRepository,
  ImplementationUseCases,
} from "@corely/modules-implementation";
import {
  PrismaPreviewRepository,
  PreviewUseCases,
} from "@corely/modules-preview";
import {
  InProcessActivityPublisher,
  PrismaActivityRepository,
  ActivityUseCases,
} from "@corely/modules-activity";
import {
  PrismaEngineeringContextRepository,
  DeterministicAgentExportGenerator,
  EngineeringContextUseCases,
} from "@corely/modules-specgate-engineering-context";
import { getPrisma } from "./prisma";
import { getObjectStorage } from "./object-storage";
import { seedSpecGateDemo, resetSpecGateDemo } from "../../../../packages/data/prisma/seed-specgate-demo";

class DeterministicSpecCopilotModel implements SpecCopilotModelPort {
  async generateStructuredData<T>(params: {
    promptVariables: Record<string, string>;
  }): Promise<T> {
    const title = params.promptVariables.title || "Spec";
    const userInstruction = params.promptVariables.userInstruction || "Improve the spec";
    return {
      title: `Proposal for ${title}`,
      summary: userInstruction,
      proposedChanges: [
        {
          field: "openQuestions",
          operation: "append",
          after: userInstruction,
          reason: "Captured from the requested copilot action.",
        },
      ],
      readinessImpact: {
        before: "Unchanged",
        after: "Adds one clarification item for review.",
        fixedIssues: [],
        remainingIssues: [],
      },
    } as T;
  }
}

export function createRuntime() {
  const prisma = getPrisma() as any;
  let objectStorage;
  try {
    objectStorage = getObjectStorage();
  } catch {
    objectStorage = undefined;
  }
  const activity = new ActivityUseCases(new PrismaActivityRepository(prisma));
  const activityPublisher = new InProcessActivityPublisher(activity);
  const specsRepo = new PrismaSpecsRepository(prisma);
  const specs = new SpecsUseCases(
    specsRepo,
    activityPublisher,
    objectStorage,
  );
  
  const engineeringContext = new EngineeringContextUseCases(
    new PrismaEngineeringContextRepository(prisma),
    new DeterministicAgentExportGenerator(),
    activityPublisher
  );

  return {
    specs,
    copilot: new SpecCopilotUseCase(
      specsRepo, 
      new DeterministicSpecCopilotModel(),
      activityPublisher
    ),
    planning: new PlanningUseCases(new PrismaPlanningRepository(prisma), specs),
    agent: new AgentUseCases(new PrismaAgentRepository(prisma), specs, engineeringContext),
    implementation: new ImplementationUseCases(
      new PrismaImplementationRepository(prisma),
      specs,
    ),
    preview: new PreviewUseCases(new PrismaPreviewRepository(prisma), specs),
    engineeringContext,
    activity,
    demo: createDemoRuntime(prisma),
  };
}

export function getDemoRequestContext(request: Request): RequestContext {
  return {
    tenantId: request.headers.get("x-tenant-id") || "tenant_demo",
    userId: request.headers.get("x-user-id") || "u-ha",
  };
}

function createDemoRuntime(prisma: any) {
  return {
    async reset() {
      await resetSpecGateDemo(prisma);
      return { data: { reset: true } };
    },

    async seed() {
      await seedSpecGateDemo(prisma);
      return { data: { seeded: true, projectId: "project_launchos" } };
    },
  };
}
