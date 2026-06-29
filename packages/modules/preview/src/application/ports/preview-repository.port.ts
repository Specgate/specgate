import type {
  PreviewChecklistRecord,
  PreviewReviewRecord,
} from "../../domain/entities/preview";

export interface PreviewRepositoryPort {
  listReviews(
    tenantId: string,
    projectId?: string,
  ): Promise<PreviewReviewRecord[]>;
  listReviewsForSpec(
    tenantId: string,
    specId: string,
  ): Promise<PreviewReviewRecord[]>;
  latestReview(
    tenantId: string,
    specId: string,
  ): Promise<PreviewReviewRecord | null>;
  createReview(review: PreviewReviewRecord): Promise<void>;
  updateReview(
    tenantId: string,
    reviewId: string,
    patch: Partial<PreviewReviewRecord>,
  ): Promise<PreviewReviewRecord | null>;
  createChecklist(checklist: PreviewChecklistRecord): Promise<void>;
}
