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
} from "@corely/modules-engineering-context";
import { DocumentsUseCases, PrismaDocumentRepository } from "@corely/modules-documents";
import { getPrisma } from "./prisma";
import { getObjectStorage } from "./object-storage";
import { verifyJwt } from "./auth";
import { getDevAuthBypassConfig, isDevAuthBypassEnabled } from "./dev-auth-bypass";

class AuthContextError extends Error {
  readonly type: "unauthorized" | "forbidden";

  constructor(type: "unauthorized" | "forbidden", message: string) {
    super(message);
    this.name = "AuthContextError";
    this.type = type;
  }
}

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
  const prisma = getPrisma() as never;
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
    documents: new DocumentsUseCases(
      new PrismaDocumentRepository(prisma),
      activityPublisher,
      objectStorage
    ),
    demo: createDemoRuntime(prisma),
  };
}

export async function getRequestContext(request: Request): Promise<RequestContext> {
  if (isDevAuthBypassEnabled("specgate")) {
    const bypassConfig = getDevAuthBypassConfig("specgate");
    const tenantId =
      request.headers.get("x-tenant-id") ?? process.env[bypassConfig.tenantFlag];
    const userId =
      request.headers.get("x-user-id") ?? process.env[bypassConfig.userFlag ?? ""];
    if (tenantId && userId) {
      return { tenantId, userId };
    }
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    throw new AuthContextError("unauthorized", "Authentication is required.");
  }

  const payload = await verifyJwt(authorization.slice("Bearer ".length));
  const userId = typeof payload?.sub === "string" ? payload.sub : null;
  const tenantId =
    typeof payload?.tenantId === "string" && payload.tenantId.length > 0
      ? payload.tenantId
      : null;

  if (!userId) {
    throw new AuthContextError("unauthorized", "Authentication is required.");
  }
  if (!tenantId) {
    throw new AuthContextError("forbidden", "No active tenant is available for this session.");
  }

  const membership = await getPrisma().membership.findFirst({
    where: { userId, tenantId },
    select: { id: true },
  });
  if (!membership) {
    throw new AuthContextError("forbidden", "You do not have access to this tenant.");
  }

  return { tenantId, userId };
}

function createDemoRuntime(prisma: ReturnType<typeof getPrisma>) {
  return {
    async reset() {
      const { resetSpecGateDemo } = await import(
        "../../../../packages/data/prisma/seed-specgate-demo"
      );
      await resetSpecGateDemo(prisma);
      return { data: { reset: true } };
    },

    async seed() {
      const { seedSpecGateDemo } = await import(
        "../../../../packages/data/prisma/seed-specgate-demo"
      );
      await seedSpecGateDemo(prisma);
      return { data: { seeded: true, projectId: "project_launchos" } };
    },
  };
}
