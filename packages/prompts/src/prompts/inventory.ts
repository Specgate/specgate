import { z } from "zod";
import { type PromptDefinition } from "../types";

export const inventoryPrompts: PromptDefinition[] = [
  {
    id: "inventory.extract_product_proposal",
    description: "Extract a product proposal from source text.",
    defaultVersion: "v1",
    versions: [
      {
        version: "v1",
        template:
          "Extract a structured product proposal from the following source text:\n\n{{{SOURCE_TEXT}}}",
        variablesSchema: z.object({
          SOURCE_TEXT: z.string().min(1),
        }),
        variables: [{ key: "SOURCE_TEXT", kind: "block" }],
      },
    ],
    tags: ["inventory", "extraction"],
  },
];
