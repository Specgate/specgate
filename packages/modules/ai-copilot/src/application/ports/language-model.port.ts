import { type CopilotUIMessage } from "../../domain/types/ui-message";
import { type DomainToolPort } from "./domain-tool.port";
import { type ObservabilitySpanRef } from "@corely/kernel";
import { type WorkspaceKind } from "@corely/prompts";
import { type LanguageModelUsage, type StreamTextResult } from "ai";

export interface LanguageModelPort {
  streamChat(params: {
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
  }): Promise<{ result: StreamTextResult<Record<string, unknown>, unknown>; usage?: LanguageModelUsage }>;

  generateStructuredData<T>(params: {
    promptId: string;
    promptContext: Record<string, unknown>;
    promptVariables: Record<string, string>;
    schema: unknown;
    tenantId: string;
    userId?: string;
  }): Promise<T>;
}
