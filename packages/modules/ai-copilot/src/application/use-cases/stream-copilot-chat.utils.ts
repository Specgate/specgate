import { type JsonValue, type NormalizedMessageSnapshot } from "@corely/kernel";

import { type CopilotUIMessage } from "../../domain/types/ui-message";

export const isUniqueConstraintError = (error: unknown): boolean =>
  Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as Record<string, unknown>).code === "P2002"
  );

export const extractAssistantText = (message: CopilotUIMessage): string | undefined => {
  const textPart = message.parts?.find((part) => part.type === "text");
  if (textPart && "text" in textPart && typeof textPart.text === "string") {
    return textPart.text;
  }
  return undefined;
};

export const toolNameFromType = (type: string): string | undefined => {
  if (type.startsWith("tool-")) {
    return type.replace("tool-", "");
  }
  return undefined;
};

export const normalizeMessages = (messages: CopilotUIMessage[]): NormalizedMessageSnapshot[] =>
  messages.map((msg) => {
    const parts =
      msg.parts?.map((part) => {
        const partObj = part as Record<string, unknown>;
        if (part.type === "text") {
          return { type: "text", text: partObj.text as string } as const;
        }
        if (String(part.type).startsWith("tool-")) {
          return {
            type: "tool-call",
            toolCallId: partObj.toolCallId as string,
            toolName: partObj.toolName as string,
            input: partObj.input as JsonValue,
          } as const;
        }
        if (String(part.type).startsWith("data-")) {
          return {
            type: "data",
            text: typeof partObj.data === "string" ? partObj.data : undefined,
          } as const;
        }
        return { type: "text", text: "" } as const;
      }) ?? [];

    return {
      role: msg.role as NormalizedMessageSnapshot["role"],
      parts: parts.length ? parts : undefined,
    };
  });

export const extractLatestUserInput = (
  messages: NormalizedMessageSnapshot[]
): string | undefined => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }
    const textPart = message.parts?.find((part) => part.type === "text" && part.text);
    if (textPart && textPart.text) {
      return textPart.text;
    }
  }
  return undefined;
};
