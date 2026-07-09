import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { LanguageModelPort } from "../../application/ports/language-model.port";
import { PromptRegistry } from "@corely/prompts";
import { normalizeOpenAiModelId } from "../../shared/ai/openai-config";

export class LightweightAiSdkAdapter implements LanguageModelPort {
  private readonly openai: ReturnType<typeof createOpenAI>;
  private readonly anthropic: ReturnType<typeof createAnthropic>;
  private readonly google: ReturnType<typeof createGoogleGenerativeAI>;
  private readonly deepseek: ReturnType<typeof createDeepSeek>;

  constructor(
    private readonly env: Record<string, string | undefined>,
    private readonly promptRegistry: PromptRegistry
  ) {
    const useAiGateway = !!this.env.AI_GATEWAY_API_KEY;
    this.openai = createOpenAI({
      apiKey: useAiGateway ? this.env.AI_GATEWAY_API_KEY || "" : this.env.OPENAI_API_KEY || "",
      ...(useAiGateway ? { baseURL: this.env.AI_GATEWAY_BASE_URL } : {}),
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

  async streamChat(): Promise<unknown> {
    throw new Error("streamChat is not supported in LightweightAiSdkAdapter");
  }

  async generateStructuredData<T>(params: {
    promptId: string;
    promptContext: Record<string, unknown>;
    promptVariables: Record<string, string>;
    schema: unknown;
    tenantId: string;
    userId?: string;
  }): Promise<T> {
    const provider = this.env.AI_MODEL_PROVIDER || "openai";
    const modelId = this.env.AI_MODEL_ID || "gpt-4o";

    const useAiGateway = !!this.env.AI_GATEWAY_API_KEY;

    const model =
      provider === "anthropic"
        ? this.anthropic(modelId)
        : provider === "google"
          ? this.google(modelId)
          : provider === "deepseek"
            ? this.deepseek(modelId)
            : this.openai(normalizeOpenAiModelId(modelId, useAiGateway));

    const systemPrompt = this.promptRegistry.render(params.promptId, params.promptContext, params.promptVariables);

    const { object } = await generateObject({
      model,
      schema: params.schema as import("zod").ZodType<T>,
      prompt: systemPrompt.content,
    });

    return object as T;
  }
}
