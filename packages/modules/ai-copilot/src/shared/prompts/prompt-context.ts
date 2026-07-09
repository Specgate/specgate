export const buildPromptContext = (params: { env?: Record<string, unknown>; [key: string]: unknown }) => ({ ...(params.env ?? {}), ...params });
