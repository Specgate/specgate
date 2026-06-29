import {
  PrismaSpecsRepository,
  SpecsUseCases,
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
import { getPrisma } from "./prisma";
import { getObjectStorage } from "./object-storage";
import { seedSpecGateDemo, resetSpecGateDemo } from "../../../../packages/data/prisma/seed-specgate-demo";


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
  const specs = new SpecsUseCases(
    new PrismaSpecsRepository(prisma),
    activityPublisher,
    objectStorage,
  );

  return {
    specs,
    planning: new PlanningUseCases(new PrismaPlanningRepository(prisma), specs),
    agent: new AgentUseCases(new PrismaAgentRepository(prisma), specs),
    implementation: new ImplementationUseCases(
      new PrismaImplementationRepository(prisma),
      specs,
    ),
    preview: new PreviewUseCases(new PrismaPreviewRepository(prisma), specs),
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
