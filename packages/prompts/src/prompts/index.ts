import { copilotPrompts } from "./copilot";
import { approvalPrompts } from "./approvals";
import { specgateCopilotPrompts } from "./specgate-copilot";

export const promptDefinitions = [
  ...copilotPrompts,
  ...approvalPrompts,
  ...specgateCopilotPrompts,
];
export * from './specgate-copilot';
