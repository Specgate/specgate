import type { AgentTarget } from "@corely/contracts/specgate";

export type AgentContextRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  targetAgent: AgentTarget;
  markdown: string;
  contextJson: unknown | null;
  createdBy: string;
  createdAt: Date;
};

export type GitSyncRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  provider: string;
  fakeCommitSha: string;
  path: string;
  status: string;
  createdBy: string;
  createdAt: Date;
};

export type SpecCodeCheckRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  status: string;
  summary: string;
  mismatchFindings: Array<{
    severity: string;
    message: string;
    file: string | null;
  }>;
  createdBy: string;
  createdAt: Date;
};
