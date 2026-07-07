import { Module } from "@nestjs/common";
import { DataModule, PrismaService } from "@corely/data";
import { CopilotController } from "./adapters/http/copilot.controller";
import { EnvService } from "@corely/config";
import { z } from "zod";

import { StreamCopilotChatUseCase } from "./application/use-cases/stream-copilot-chat.usecase";
import { PrismaAgentRunRepository } from "./infrastructure/adapters/prisma-agent-run-repository.adapter";
import { PrismaMessageRepository } from "./infrastructure/adapters/prisma-message-repository.adapter";
import { PrismaChatStoreAdapter } from "./infrastructure/adapters/prisma-chat-store.adapter";
import { PrismaToolExecutionRepository } from "./infrastructure/adapters/prisma-tool-execution-repository.adapter";
import { PrismaThreadHistoryRepository } from "./infrastructure/adapters/prisma-thread-history-repository.adapter";
import { ToolRegistry } from "./infrastructure/tools/tool-registry";
import { AiSdkModelAdapter } from "./infrastructure/model/ai-sdk.model-adapter";
import { PrismaAuditAdapter } from "./infrastructure/audit/prisma.audit.adapter";
import { PrismaCopilotIdempotencyAdapter } from "./infrastructure/idempotency/prisma-idempotency-copilot.adapter";
import { TenantGuard } from "./adapters/http/guards/tenant.guard";
import { COPILOT_TOOLS } from "./application/ports/tool-registry.port";
import { AuditPort } from "./application/ports/audit.port";
import { OUTBOX_PORT } from "@corely/kernel";
import type { OutboxPort } from "@corely/kernel";
import { ClockPort } from "@corely/kernel/ports/clock.port";
import { IdentityModule } from "../identity/identity.module";
import { NestLoggerAdapter } from "../../shared/adapters/logger/nest-logger.adapter";
import { IdempotencyService } from "../../shared/infrastructure/idempotency/idempotency.service";

import { OtelObservabilityAdapter } from "../../shared/observability/otel-observability.adapter";
import { type ObservabilityPort } from "@corely/kernel";
import { CreateRunUseCase } from "./application/use-cases/create-run.usecase";
import { GetRunUseCase } from "./application/use-cases/get-run.usecase";
import { ListMessagesUseCase } from "./application/use-cases/list-messages.usecase";
import { ListCopilotThreadsUseCase } from "./application/use-cases/list-copilot-threads.usecase";
import { GetCopilotThreadUseCase } from "./application/use-cases/get-copilot-thread.usecase";
import { ListCopilotThreadMessagesUseCase } from "./application/use-cases/list-copilot-thread-messages.usecase";
import { SearchCopilotMessagesUseCase } from "./application/use-cases/search-copilot-messages.usecase";
import { CreateCopilotThreadUseCase } from "./application/use-cases/create-copilot-thread.usecase";
import { PromptModule } from "./shared/prompts/prompt.module";
import { PromptRegistry } from "@corely/prompts";
import { PromptUsageLogger } from "./shared/prompts/prompt-usage.logger";
import { CHAT_STORE_PORT, type ChatStorePort } from "./application/ports/chat-store.port";
import {
  THREAD_HISTORY_REPOSITORY_PORT,
  type ThreadHistoryRepositoryPort,
} from "./application/ports/thread-history-repository.port";
import { CopilotContextBuilder } from "./application/services/copilot-context.builder";
import { CopilotTaskStateTracker } from "./application/services/copilot-task-state.service";
import type { DomainToolPort } from "./application/ports/domain-tool.port";
import { PlatformEntitlementsModule } from "../platform-entitlements/platform-entitlements.module";
import { NoopOutbox } from "../../shared/noop/noop-outbox";

@Module({
  imports: [DataModule, IdentityModule, PlatformEntitlementsModule, PromptModule],
  controllers: [CopilotController],
  providers: [
    PrismaAgentRunRepository,
    PrismaMessageRepository,
    PrismaChatStoreAdapter,
    PrismaToolExecutionRepository,
    PrismaThreadHistoryRepository,
    ToolRegistry,
    PrismaAuditAdapter,
    IdempotencyService,
    PrismaCopilotIdempotencyAdapter,
    TenantGuard,
    { provide: OUTBOX_PORT, useClass: NoopOutbox },
    { provide: "COPILOT_LOGGER", useClass: NestLoggerAdapter },
    {
      provide: AiSdkModelAdapter,
      useFactory: (
        toolExec: PrismaToolExecutionRepository,
        audit: PrismaAuditAdapter,
        outbox: OutboxPort,
        env: EnvService,
        logger: NestLoggerAdapter,
        observability: ObservabilityPort,
        promptRegistry: PromptRegistry,
        promptUsageLogger: PromptUsageLogger
      ) => {
        logger.debug("Creating AiSdkModelAdapter");
        return new AiSdkModelAdapter(
          toolExec,
          audit,
          outbox,
          env,
          observability,
          promptRegistry,
          promptUsageLogger
        );
      },
      inject: [
        PrismaToolExecutionRepository,
        PrismaAuditAdapter,
        OUTBOX_PORT,
        EnvService,
        "COPILOT_LOGGER",
        "OBSERVABILITY_PORT",
        PromptRegistry,
        PromptUsageLogger,
      ],
    },
    {
      provide: "COPILOT_CLOCK",
      useValue: { now: () => new Date() },
    },
    {
      provide: CreateRunUseCase,
      useFactory: (runs: PrismaAgentRunRepository) => new CreateRunUseCase(runs),
      inject: [PrismaAgentRunRepository],
    },
    {
      provide: GetRunUseCase,
      useFactory: (runs: PrismaAgentRunRepository) => new GetRunUseCase(runs),
      inject: [PrismaAgentRunRepository],
    },
    {
      provide: ListMessagesUseCase,
      useFactory: (messages: PrismaMessageRepository) => new ListMessagesUseCase(messages),
      inject: [PrismaMessageRepository],
    },
    {
      provide: CHAT_STORE_PORT,
      useClass: PrismaChatStoreAdapter,
    },
    {
      provide: THREAD_HISTORY_REPOSITORY_PORT,
      useClass: PrismaThreadHistoryRepository,
    },
    {
      provide: ListCopilotThreadsUseCase,
      useFactory: (threads: ThreadHistoryRepositoryPort) => new ListCopilotThreadsUseCase(threads),
      inject: [THREAD_HISTORY_REPOSITORY_PORT],
    },
    {
      provide: GetCopilotThreadUseCase,
      useFactory: (threads: ThreadHistoryRepositoryPort) => new GetCopilotThreadUseCase(threads),
      inject: [THREAD_HISTORY_REPOSITORY_PORT],
    },
    {
      provide: ListCopilotThreadMessagesUseCase,
      useFactory: (threads: ThreadHistoryRepositoryPort) =>
        new ListCopilotThreadMessagesUseCase(threads),
      inject: [THREAD_HISTORY_REPOSITORY_PORT],
    },
    {
      provide: SearchCopilotMessagesUseCase,
      useFactory: (threads: ThreadHistoryRepositoryPort) =>
        new SearchCopilotMessagesUseCase(threads),
      inject: [THREAD_HISTORY_REPOSITORY_PORT],
    },
    {
      provide: CreateCopilotThreadUseCase,
      useFactory: (threads: ThreadHistoryRepositoryPort, clock: ClockPort) =>
        new CreateCopilotThreadUseCase(threads, clock),
      inject: [THREAD_HISTORY_REPOSITORY_PORT, "COPILOT_CLOCK"],
    },
    {
      provide: CopilotContextBuilder,
      useFactory: (prisma: PrismaService) => new CopilotContextBuilder(prisma),
      inject: [PrismaService],
    },
    CopilotTaskStateTracker,
    {
      provide: "OBSERVABILITY_PORT",
      useFactory: (env: EnvService) =>
        new OtelObservabilityAdapter({ maskingMode: env.OBSERVABILITY_MASKING_MODE }),
      inject: [EnvService],
    },
    {
      provide: COPILOT_TOOLS,
      useFactory: (prisma: PrismaService): DomainToolPort[] => {
        return [
          {
            name: "german_exam_coach.get_speaking_feedback",
            description:
              "Fetch a learner's latest speaking feedback or a specific speaking submission by id from German Exam Coach.",
            inputSchema: z.object({
              submissionId: z.string().trim().min(1).optional(),
              latest: z.boolean().optional().default(true),
            }),
            kind: "server",
            needsApproval: false,
            execute: async ({ userId, input }) => {
              const params = input as { submissionId?: string; latest?: boolean };
              const profile = await prisma.germanExamCoachLearnerProfile.findFirst({
                where: { userId },
                select: { id: true, targetLevel: true, interfaceLanguage: true, explanationLanguage: true },
              });

              if (!profile) {
                return { found: false, reason: "learner_profile_not_found" };
              }

              const submission = await prisma.germanExamCoachSubmission.findFirst({
                where: {
                  learnerProfileId: profile.id,
                  skill: "speaking",
                  ...(params.submissionId ? { id: params.submissionId } : {}),
                },
                orderBy: params.submissionId ? undefined : { createdAt: "desc" },
              });

              if (!submission) {
                return { found: false, reason: "speaking_submission_not_found" };
              }

              const task = await prisma.germanExamCoachSpeakingTask.findUnique({
                where: { id: submission.taskId },
                select: { title: true, promptGerman: true, type: true },
              });

              return {
                found: true,
                profile,
                submission: {
                  id: submission.id,
                  taskId: submission.taskId,
                  taskTitle: task?.title ?? submission.taskId,
                  taskPromptGerman: task?.promptGerman ?? null,
                  taskType: task?.type ?? null,
                  level: submission.level,
                  overallScore: submission.overallScore,
                  transcript: submission.transcriptText ?? submission.answerText,
                  audioAssetId: submission.audioAssetId ?? null,
                  createdAt: submission.createdAt.toISOString(),
                  feedback: submission.feedbackJson,
                },
              };
            },
          },
          {
            name: "get_launchos_workspace_summary",
            description: "Get a summary of the current LaunchOS workspace.",
            inputSchema: z.object({}),
            kind: "server",
            needsApproval: false,
            execute: async ({ workspaceId }) => {
              if (!workspaceId) return { error: "No workspace ID" };
              const profile = await prisma.launchOsProfile.findUnique({ where: { workspaceId } });
              const positioning = await prisma.launchOsPositioning.findUnique({ where: { workspaceId } });
              return { profile, positioning };
            },
          },
          {
            name: "get_outreach_pipeline",
            description: "View outreach contacts and status.",
            inputSchema: z.object({}),
            kind: "server",
            needsApproval: false,
            execute: async ({ workspaceId }) => {
              if (!workspaceId) return { error: "No workspace ID" };
              const contacts = await prisma.launchOsOutreachContact.findMany({
                where: { workspaceId },
                orderBy: { updatedAt: "desc" },
                take: 50,
              });
              return { contacts };
            },
          },
          {
            name: "review_launch_asset",
            description: "Review a specific launch asset by ID or name.",
            inputSchema: z.object({ label: z.string() }),
            kind: "server",
            needsApproval: false,
            execute: async ({ workspaceId, input }) => {
              if (!workspaceId) return { error: "No workspace ID" };
              const asset = await prisma.launchOsAsset.findFirst({
                where: { workspaceId, label: { contains: (input as any).label, mode: "insensitive" } },
              });
              return asset ? { asset } : { error: "Asset not found" };
            },
          },
          {
            name: "generate_launch_asset",
            description: "Draft a new launch asset. Generates draft content but does not save.",
            inputSchema: z.object({ type: z.string(), prompt: z.string() }),
            kind: "server",
            needsApproval: false,
            execute: async ({ input }) => {
              return { draft: `Draft asset for ${(input as any).type}: ${(input as any).prompt}` };
            },
          },
          {
            name: "generate_outreach_follow_up",
            description: "Draft a follow-up message for a contact. Does not save.",
            inputSchema: z.object({ contactId: z.string(), context: z.string() }),
            kind: "server",
            needsApproval: false,
            execute: async ({ input, workspaceId }) => {
              if (!workspaceId) return { error: "No workspace ID" };
              const contact = await prisma.launchOsOutreachContact.findFirst({
                where: { workspaceId, id: (input as any).contactId },
              });
              return { contact, draft: `Draft follow up for ${contact?.name || 'Contact'} regarding ${(input as any).context}` };
            },
          },
          {
            name: "suggest_lead_searches",
            description: "Suggest places or searches to find more leads.",
            inputSchema: z.object({ query: z.string() }),
            kind: "server",
            needsApproval: false,
            execute: async ({ input }) => {
              return { suggestions: [`Search LinkedIn for ${(input as any).query}`, `Search Twitter for ${(input as any).query}`] };
            },
          },
          {
            name: "review_launchos_positioning",
            description: "Review current positioning details.",
            inputSchema: z.object({}),
            kind: "server",
            needsApproval: false,
            execute: async ({ workspaceId }) => {
              if (!workspaceId) return { error: "No workspace ID" };
              const pos = await prisma.launchOsPositioning.findUnique({ where: { workspaceId } });
              return { positioning: pos };
            },
          },
          {
            name: "add_sprint_task",
            description: "Add a new task to the LaunchOS Sprint checklist.",
            inputSchema: z.object({ title: z.string(), description: z.string(), phase: z.string() }),
            kind: "server",
            needsApproval: true,
            execute: async ({ workspaceId, tenantId, input }) => {
              if (!workspaceId || !tenantId) return { error: "No workspace/tenant ID" };
              const task = await prisma.launchOsSprintTask.create({
                data: {
                  tenantId,
                  workspaceId,
                  title: (input as any).title,
                  description: (input as any).description,
                  phase: (input as any).phase || "execution",
                  status: "todo",
                  stableKey: `task-${Date.now()}`
                }
              });
              return { success: true, task };
            },
          },
        ];
      },
      inject: [PrismaService],
    },
    {
      provide: StreamCopilotChatUseCase,
      useFactory: (
        runs: PrismaAgentRunRepository,
        chatStore: ChatStorePort,
        toolExec: PrismaToolExecutionRepository,
        tools: ToolRegistry,
        model: AiSdkModelAdapter,
        audit: PrismaAuditAdapter,
        outbox: OutboxPort,
        idem: PrismaCopilotIdempotencyAdapter,
        clock: ClockPort,
        logger: NestLoggerAdapter,
        observability: ObservabilityPort,
        contextBuilder: CopilotContextBuilder,
        taskTracker: CopilotTaskStateTracker
      ) => {
        logger.debug("Creating StreamCopilotChatUseCase");
        return new StreamCopilotChatUseCase(
          runs,
          chatStore,
          toolExec,
          tools,
          model,
          audit as AuditPort,
          outbox as OutboxPort,
          idem,
          clock,
          observability,
          contextBuilder,
          taskTracker
        );
      },
      inject: [
        PrismaAgentRunRepository,
        CHAT_STORE_PORT,
        PrismaToolExecutionRepository,
        ToolRegistry,
        AiSdkModelAdapter,
        PrismaAuditAdapter,
        OUTBOX_PORT,
        PrismaCopilotIdempotencyAdapter,
        "COPILOT_CLOCK",
        "COPILOT_LOGGER",
        "OBSERVABILITY_PORT",
        CopilotContextBuilder,
        CopilotTaskStateTracker,
      ],
    },
  ],
  exports: [],
})
export class AiCopilotModule {}
