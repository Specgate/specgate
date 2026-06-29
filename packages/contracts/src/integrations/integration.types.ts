import { z } from "zod";

export const IntegrationProviderKeySchema = z.string().min(2).max(120);
export type IntegrationProviderKey = z.infer<typeof IntegrationProviderKeySchema>;

export const IntegrationAuthMethodSchema = z.enum(["api_key", "oauth2"]);
export type IntegrationAuthMethod = z.infer<typeof IntegrationAuthMethodSchema>;

export const IntegrationConnectionStatusSchema = z.enum(["active", "invalid", "disabled"]);
export type IntegrationConnectionStatus = z.infer<typeof IntegrationConnectionStatusSchema>;

export const IntegrationConnectionDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  workspaceId: z.string(),
  providerKey: IntegrationProviderKeySchema,
  authMethod: IntegrationAuthMethodSchema,
  status: IntegrationConnectionStatusSchema,
  displayName: z.string().nullable().optional(),
  config: z.record(z.unknown()).default({}),
  hasSecret: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type IntegrationConnectionDto = z.infer<typeof IntegrationConnectionDtoSchema>;

export const IntegrationErrorCodeSchema = z.string().min(1);
export type IntegrationErrorCode = z.infer<typeof IntegrationErrorCodeSchema>;
