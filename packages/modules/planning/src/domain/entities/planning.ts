import type { BuildCycleStatus, MilestoneStatus } from "@corely/contracts/specgate";

export type MilestoneRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  description: string | null;
  targetDate: Date | null;
  status: MilestoneStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type BuildCycleRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  goal: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: BuildCycleStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type BuildQueueItemRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  priorityRank: number;
  assignedTo: string | null;
  buildCycleId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
