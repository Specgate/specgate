import { z } from "zod";
import { IntegrationConnectionDtoSchema, IntegrationProviderKeySchema } from "./integration.types";

export const ListIntegrationConnectionsInputSchema = z.object({
  workspaceId: z.string().optional(),
  providerKey: IntegrationProviderKeySchema.optional(),
});
export type ListIntegrationConnectionsInput = z.infer<typeof ListIntegrationConnectionsInputSchema>;

export const ListIntegrationConnectionsOutputSchema = z.object({
  items: z.array(IntegrationConnectionDtoSchema),
});
export type ListIntegrationConnectionsOutput = z.infer<
  typeof ListIntegrationConnectionsOutputSchema
>;
