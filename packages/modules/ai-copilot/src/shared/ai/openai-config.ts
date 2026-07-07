export const hasAiGatewayApiKey = (env: Record<string, string | undefined>) => !!env.AI_GATEWAY_API_KEY;
export const normalizeOpenAiModelId = (modelId: string, useGateway?: boolean) => {
  return useGateway && !modelId.includes('/') ? `openai/${modelId}` : modelId;
};
