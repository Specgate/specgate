import { Injectable, Logger } from "@nestjs/common";
import type { EnvService } from "@corely/config";
import { streamText, convertToModelMessages, stepCountIs, validateUIMessages, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { LanguageModelPort } from "../../application/ports/language-model.port";
import type { DomainToolPort } from "../../application/ports/domain-tool.port";
import { buildAiTools } from "../tools/tools.factory";
import type { ToolExecutionRepositoryPort } from "../../application/ports/tool-execution-repository.port";
import type { AuditPort } from "../../application/ports/audit.port";
import type { OutboxPort } from "@corely/kernel";
import { buildCollectInputsTool } from "../tools/interactive-tools";
import { type CopilotUIMessage } from "../../domain/types/ui-message";
import { CopilotDataPartSchemas } from "@corely/contracts";
import {
  ExternalServiceError,
  type ObservabilityPort,
  type ObservabilitySpanRef,
} from "@corely/kernel";
import { type LanguageModelUsage, type StreamTextResult, type CoreTool } from "ai";
import { type WorkspaceKind, PromptRegistry } from "@corely/prompts";
import { PromptUsageLogger } from "../../shared/prompts/prompt-usage.logger";
import { buildPromptContext } from "../../shared/prompts/prompt-context";
import { copilotMessageMetadataSchema } from "../../application/validation/copilot-message-metadata.schema";
import {
  hasAiGatewayApiKey,
  normalizeOpenAiModelId,
} from "../../shared/ai/openai-config";

@Injectable()
export class AiSdkModelAdapter implements LanguageModelPort {
  private readonly openai: ReturnType<typeof createOpenAI>;
  private readonly anthropic: ReturnType<typeof createAnthropic>;
  private readonly google: ReturnType<typeof createGoogleGenerativeAI>;
  private readonly deepseek: ReturnType<typeof createDeepSeek>;
  private readonly useAiGateway: boolean;
  private readonly logger = new Logger(AiSdkModelAdapter.name);

  constructor(
    private readonly toolExecutions: ToolExecutionRepositoryPort,
    private readonly audit: AuditPort,
    private readonly outbox: OutboxPort,
    private readonly env: EnvService,
    private readonly observability: ObservabilityPort,
    private readonly promptRegistry: PromptRegistry,
    private readonly promptUsageLogger: PromptUsageLogger
  ) {
    this.useAiGateway = hasAiGatewayApiKey(this.env.AI_GATEWAY_API_KEY);
    this.openai = createOpenAI({
      apiKey: this.useAiGateway ? this.env.AI_GATEWAY_API_KEY || "" : this.env.OPENAI_API_KEY || "",
      ...(this.useAiGateway ? { baseURL: this.env.AI_GATEWAY_BASE_URL } : {}),
    });
    this.anthropic = createAnthropic({
      apiKey: this.env.ANTHROPIC_API_KEY || "",
    });
    this.google = createGoogleGenerativeAI({
      apiKey: this.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });
    this.deepseek = createDeepSeek({
      apiKey: this.env.DEEPSEEK_API_KEY || "",
    });
  }

  async streamChat(params: {
    messages: CopilotUIMessage[];
    tools: DomainToolPort[];
    runId: string;
    tenantId: string;
    toolTenantId?: string;
    workspaceId?: string;
    userId: string;
    workspaceKind?: WorkspaceKind;
    environment?: string;
    intent?: string;
    observability: ObservabilitySpanRef;
  }): Promise<{ result: StreamTextResult<Record<string, CoreTool>, unknown>; usage?: LanguageModelUsage }> {
    const toolTenantId = params.toolTenantId ?? params.tenantId;
    const aiTools = buildAiTools(params.tools, {
      toolExecutions: this.toolExecutions,
      audit: this.audit,
      outbox: this.outbox,
      tenantId: toolTenantId,
      workspaceId: params.workspaceId,
      runId: params.runId,
      userId: params.userId,
      observability: this.observability,
      parentSpan: params.observability,
    });

    const provider = this.env.AI_MODEL_PROVIDER;
    const modelId = this.env.AI_MODEL_ID;

    if (provider === "google" && !this.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new ExternalServiceError("Google Generative AI API key is not configured", {
        provider: "google",
      });
    }

    if (provider === "deepseek" && !this.env.DEEPSEEK_API_KEY) {
      throw new ExternalServiceError("DeepSeek API key is not configured", {
        provider: "deepseek",
      });
    }

    if (provider === "anthropic" && !this.env.ANTHROPIC_API_KEY) {
      throw new ExternalServiceError("Anthropic API key is not configured", {
        provider: "anthropic",
      });
    }

    if (provider === "openai" && !this.env.AI_GATEWAY_API_KEY && !this.env.OPENAI_API_KEY) {
      throw new ExternalServiceError("AI Gateway or OpenAI API key is not configured", {
        provider: "openai",
      });
    }

    const model =
      provider === "anthropic"
        ? this.anthropic(modelId)
        : provider === "google"
          ? this.google(modelId)
          : provider === "deepseek"
            ? this.deepseek(modelId)
            : this.openai(normalizeOpenAiModelId(modelId, this.useAiGateway));

    const promptContext = buildPromptContext({
      env: this.env,
      tenantId: toolTenantId,
      workspaceKind: params.workspaceKind,
      environmentOverride: params.environment,
    });

    const promptId = params.intent === "specgate-copilot" 
      ? "specgate.copilot.system" 
      : "copilot.system";

    const systemPrompt = this.promptRegistry.render(promptId, promptContext, {
      CUSTOMER_SEARCH_TOOL: "customer_search",
      INVOICE_CREATE_FROM_CUSTOMER_TOOL: "invoice_create_from_customer",
      COLLECT_INPUTS_TOOL: "collect_inputs",
      GET_WORKSPACE_SUMMARY: "get_launchos_workspace_summary",
      REVIEW_POSITIONING: "review_launchos_positioning",
      REVIEW_ASSET: "review_launch_asset",
      GENERATE_ASSET: "generate_launch_asset",
      GET_OUTREACH_PIPELINE: "get_outreach_pipeline",
      GENERATE_OUTREACH_FOLLOW_UP: "generate_outreach_follow_up",
      SUGGEST_LEAD_SEARCHES: "suggest_lead_searches",
      ADD_SPRINT_TASK: "add_sprint_task",
    });
    this.observability.setAttributes(params.observability, {
      "prompt.id": systemPrompt.promptId,
      "prompt.version": systemPrompt.promptVersion,
      "prompt.hash": systemPrompt.promptHash,
    });
    this.promptUsageLogger.logUsage({
      promptId: systemPrompt.promptId,
      promptVersion: systemPrompt.promptVersion,
      promptHash: systemPrompt.promptHash,
      modelId,
      provider,
      tenantId: toolTenantId,
      userId: params.userId,
      runId: params.runId,
      purpose: promptId,
    });

    const collectInputsDescription = this.promptRegistry.render(
      "copilot.collect_inputs.description",
      promptContext,
      {}
    );
    this.promptUsageLogger.logUsage({
      promptId: collectInputsDescription.promptId,
      promptVersion: collectInputsDescription.promptVersion,
      promptHash: collectInputsDescription.promptHash,
      modelId,
      provider,
      tenantId: toolTenantId,
      userId: params.userId,
      runId: params.runId,
      purpose: "copilot.tool.collect_inputs",
    });

    const toolset = {
      ...aiTools,
      collect_inputs: buildCollectInputsTool(collectInputsDescription.content),
    };

    this.logger.debug(`Starting streamText with ${Object.keys(toolset).length} tools`);

    const systemMessage: CopilotUIMessage = {
      id: `copilot-system-${params.runId}`,
      role: "system",
      parts: [
        {
          type: "text" as const,
          text: systemPrompt.content,
        },
      ],
    };

    const messagesWithIds = [systemMessage, ...params.messages].map((message, index) => ({
      ...message,
      id: message.id ?? `copilot-${params.runId}-${index}`,
    }));

    const normalizedMessages = messagesWithIds
      .map((message) => {
        const normalizeToolPart = (part: CopilotUIMessage["parts"][number]) => {
          if (!part || typeof part !== "object") {
            return part;
          }
          if (typeof part.type !== "string" || !part.type.startsWith("tool-")) {
            return part;
          }
          const toolPart = part as {
            type: string;
            state?: string;
            toolCallId?: string;
            input?: unknown;
            rawInput?: unknown;
            output?: unknown;
            result?: unknown;
            errorText?: string;
          };
          if (!toolPart.toolCallId) {
            return undefined;
          }
          if (toolPart.state === "output-available" && toolPart.output === undefined) {
            if (toolPart.result !== undefined) {
              return { ...toolPart, output: toolPart.result };
            }
            return {
              ...toolPart,
              state: "output-error",
              errorText: toolPart.errorText ?? "tool output missing",
              rawInput: toolPart.rawInput ?? {},
            };
          }
          if (toolPart.state !== "input-streaming" && toolPart.input == null) {
            if (toolPart.rawInput != null) {
              return { ...toolPart, input: toolPart.rawInput };
            }
            if (toolPart.state === "output-error") {
              return { ...toolPart, rawInput: {} };
            }
            return undefined;
          }
          return toolPart;
        };

        if (Array.isArray(message.parts) && message.parts.length > 0) {
          return {
            ...message,
            parts: message.parts
              .map(normalizeToolPart)
              .filter(
                (part): part is CopilotUIMessage["parts"][number] =>
                  Boolean(part) && typeof part === "object"
              ),
          };
        }
        const content = (message as { content?: unknown }).content;
        if (typeof content === "string") {
          return {
            ...message,
            parts: [{ type: "text" as const, text: content }],
          };
        }
        return undefined;
      })
      .filter(
        (message): message is CopilotUIMessage =>
          Boolean(message) && Array.isArray(message.parts) && message.parts.length > 0
      );

    const validatedMessages = await validateUIMessages<CopilotUIMessage>({
      messages: normalizedMessages,
      metadataSchema: copilotMessageMetadataSchema,
      dataSchemas: CopilotDataPartSchemas,
      tools: toolset,
    });

    const modelMessages = await convertToModelMessages(validatedMessages, {
      tools: toolset,
      ignoreIncompleteToolCalls: true,
    });

    const result = streamText({
      model,
      messages: modelMessages,
      tools: toolset,
      stopWhen: stepCountIs(5),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "copilot.streamChat",
      },
    });

    let usage: LanguageModelUsage | undefined;
    try {

    const promptContext = buildPromptContext({
      env: this.env,
      tenantId: toolTenantId,
      workspaceKind: params.workspaceKind,
      environmentOverride: params.environment,
    });

    const promptId = params.intent === "specgate-copilot" 
      ? "specgate.copilot.system" 
      : "copilot.system";

    const systemPrompt = this.promptRegistry.render(promptId, promptContext, {
      CUSTOMER_SEARCH_TOOL: "customer_search",
      INVOICE_CREATE_FROM_CUSTOMER_TOOL: "invoice_create_from_customer",
      COLLECT_INPUTS_TOOL: "collect_inputs",
      GET_WORKSPACE_SUMMARY: "get_launchos_workspace_summary",
      REVIEW_POSITIONING: "review_launchos_positioning",
      REVIEW_ASSET: "review_launch_asset",
      GENERATE_ASSET: "generate_launch_asset",
      GET_OUTREACH_PIPELINE: "get_outreach_pipeline",
      GENERATE_OUTREACH_FOLLOW_UP: "generate_outreach_follow_up",
      SUGGEST_LEAD_SEARCHES: "suggest_lead_searches",
      ADD_SPRINT_TASK: "add_sprint_task",
    });
    this.observability.setAttributes(params.observability, {
      "prompt.id": systemPrompt.promptId,
      "prompt.version": systemPrompt.promptVersion,
      "prompt.hash": systemPrompt.promptHash,
    });
    this.promptUsageLogger.logUsage({
      promptId: systemPrompt.promptId,
      promptVersion: systemPrompt.promptVersion,
      promptHash: systemPrompt.promptHash,
      modelId,
      provider,
      tenantId: toolTenantId,
      userId: params.userId,
      runId: params.runId,
      purpose: promptId,
    });

    const collectInputsDescription = this.promptRegistry.render(
      "copilot.collect_inputs.description",
      promptContext,
      {}
    );
    this.promptUsageLogger.logUsage({
      promptId: collectInputsDescription.promptId,
      promptVersion: collectInputsDescription.promptVersion,
      promptHash: collectInputsDescription.promptHash,
      modelId,
      provider,
      tenantId: toolTenantId,
      userId: params.userId,
      runId: params.runId,
      purpose: "copilot.tool.collect_inputs",
    });

    const toolset = {
      ...aiTools,
      collect_inputs: buildCollectInputsTool(collectInputsDescription.content),
    };

    this.logger.debug(`Starting streamText with ${Object.keys(toolset).length} tools`);

    const systemMessage: CopilotUIMessage = {
      id: `copilot-system-${params.runId}`,
      role: "system",
      parts: [
        {
          type: "text" as const,
          text: systemPrompt.content,
        },
      ],
    };

    const messagesWithIds = [systemMessage, ...params.messages].map((message, index) => ({
      ...message,
      id: message.id ?? `copilot-${params.runId}-${index}`,
    }));

    const normalizedMessages = messagesWithIds
      .map((message) => {
        const normalizeToolPart = (part: CopilotUIMessage["parts"][number]) => {
          if (!part || typeof part !== "object") {
            return part;
          }
          if (typeof part.type !== "string" || !part.type.startsWith("tool-")) {
            return part;
          }
          const toolPart = part as {
            type: string;
            state?: string;
            toolCallId?: string;
            input?: unknown;
            rawInput?: unknown;
            output?: unknown;
            result?: unknown;
            errorText?: string;
          };
          if (!toolPart.toolCallId) {
            return undefined;
          }
          if (toolPart.state === "output-available" && toolPart.output === undefined) {
            if (toolPart.result !== undefined) {
              return { ...toolPart, output: toolPart.result };
            }
            return {
              ...toolPart,
              state: "output-error",
              errorText: toolPart.errorText ?? "tool output missing",
              rawInput: toolPart.rawInput ?? {},
            };
          }
          if (toolPart.state !== "input-streaming" && toolPart.input == null) {
            if (toolPart.rawInput != null) {
              return { ...toolPart, input: toolPart.rawInput };
            }
            if (toolPart.state === "output-error") {
              return { ...toolPart, rawInput: {} };
            }
            return undefined;
          }
          return toolPart;
        };

        if (Array.isArray(message.parts) && message.parts.length > 0) {
          return {
            ...message,
            parts: message.parts
              .map(normalizeToolPart)
              .filter(
                (part): part is CopilotUIMessage["parts"][number] =>
                  Boolean(part) && typeof part === "object"
              ),
          };
        }
        const content = (message as { content?: unknown }).content;
        if (typeof content === "string") {
          return {
            ...message,
            parts: [{ type: "text" as const, text: content }],
          };
        }
        return undefined;
      })
      .filter(
        (message): message is CopilotUIMessage =>
          Boolean(message) && Array.isArray(message.parts) && message.parts.length > 0
      );

    const validatedMessages = await validateUIMessages<CopilotUIMessage>({
      messages: normalizedMessages,
      metadataSchema: copilotMessageMetadataSchema,
      dataSchemas: CopilotDataPartSchemas,
      tools: toolset,
    });

    const modelMessages = await convertToModelMessages(validatedMessages, {
      tools: toolset,
      ignoreIncompleteToolCalls: true,
    });

    const result = streamText({
      model,
      messages: modelMessages,
      tools: toolset,
      stopWhen: stepCountIs(5),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "copilot.streamChat",
      },
    });

    let usage: LanguageModelUsage | undefined;
    try {
      usage = await result.usage;
    } catch (err) {
      this.logger.warn(`Failed to resolve usage: ${err}`);
    }

    return { result, usage };
  }

  async generateStructuredData<T>(params: {
    promptId: string;
    promptContext: Record<string, unknown>;
    promptVariables: Record<string, string>;
    schema: unknown;
    tenantId: string;
    userId?: string;
  }): Promise<T> {
    const provider = this.env.AI_MODEL_PROVIDER;
    const modelId = this.env.AI_MODEL_ID;

    const model =
      provider === "anthropic"
        ? this.anthropic(modelId)
        : provider === "google"
          ? this.google(modelId)
          : provider === "deepseek"
            ? this.deepseek(modelId)
            : this.openai(normalizeOpenAiModelId(modelId, this.useAiGateway));

    const systemPrompt = this.promptRegistry.render(params.promptId, params.promptContext, params.promptVariables);

    const { object } = await generateObject({
      model,
      schema: params.schema as import("zod").ZodType<T>,
      prompt: systemPrompt.content,
    });

    return object as T;
  }
}
