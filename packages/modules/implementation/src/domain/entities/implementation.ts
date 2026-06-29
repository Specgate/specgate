import type { ImplementationStatus } from "@corely/contracts/specgate";

export type ImplementationRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  status: ImplementationStatus;
  branchName: string | null;
  pullRequestUrl: string | null;
  developerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DeveloperReviewRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  reviewerId: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
