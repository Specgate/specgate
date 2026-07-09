import { copilotPrompts } from "./copilot";
import { approvalPrompts } from "./approvals";
import { crmPrompts } from "./crm";
import { inventoryPrompts } from "./inventory";
import { specgateCopilotPrompts } from "./specgate-copilot";

export const promptDefinitions = [
  ...copilotPrompts,
  ...approvalPrompts,
  ...crmPrompts,
  ...inventoryPrompts,
  ...specgateCopilotPrompts,
];
export * from './specgate-copilot';
