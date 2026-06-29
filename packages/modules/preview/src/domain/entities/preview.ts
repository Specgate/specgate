import type {
  PreviewEnvironment,
  PreviewReviewStatus,
} from "@corely/contracts/specgate";

export type PreviewReviewRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  previewUrl: string | null;
  environment: PreviewEnvironment;
  status: PreviewReviewStatus;
  feedback: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PreviewChecklistRecord = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  items: string[];
  createdAt: Date;
};
