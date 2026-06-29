import type { PreviewChecklistDto, PreviewReviewDto } from "@corely/contracts/specgate";
import type {
  PreviewChecklistRecord,
  PreviewReviewRecord,
} from "../domain/entities/preview";

export const mapPreviewReview = (
  row: PreviewReviewRecord,
): PreviewReviewDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const mapPreviewChecklist = (
  row: PreviewChecklistRecord,
): PreviewChecklistDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});
