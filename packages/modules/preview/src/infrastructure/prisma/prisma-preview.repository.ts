import type {
  PreviewChecklistRecord,
  PreviewReviewRecord,
} from "../../domain/entities/preview";
import type { PreviewRepositoryPort } from "../../application/ports/preview-repository.port";

type ModelClient = {
  findMany(args?: unknown): Promise<Record<string, unknown>[]>;
  findFirst(args?: unknown): Promise<Record<string, unknown> | null>;
  create(args: unknown): Promise<Record<string, unknown>>;
  update(args: unknown): Promise<Record<string, unknown>>;
};

export class PrismaPreviewRepository implements PreviewRepositoryPort {
  constructor(
    private readonly prisma: {
      specGatePreviewReview: ModelClient;
      specGatePreviewChecklist: ModelClient;
    },
  ) {}
  listReviews(tenantId: string, projectId?: string) {
    return this.prisma.specGatePreviewReview
      .findMany({
        where: { tenantId, ...(projectId ? { projectId } : {}) },
        orderBy: { updatedAt: "desc" },
      })
      .then((rows) => rows as PreviewReviewRecord[]);
  }
  listReviewsForSpec(tenantId: string, specId: string) {
    return this.prisma.specGatePreviewReview
      .findMany({ where: { tenantId, specId }, orderBy: { updatedAt: "desc" } })
      .then((rows) => rows as PreviewReviewRecord[]);
  }
  latestReview(tenantId: string, specId: string) {
    return this.prisma.specGatePreviewReview
      .findFirst({
        where: { tenantId, specId },
        orderBy: { updatedAt: "desc" },
      })
      .then((row) => (row ? (row as PreviewReviewRecord) : null));
  }
  async createReview(review: PreviewReviewRecord) {
    await this.prisma.specGatePreviewReview.create({ data: review });
  }
  async updateReview(
    tenantId: string,
    reviewId: string,
    patch: Partial<PreviewReviewRecord>,
  ) {
    const existing = await this.prisma.specGatePreviewReview.findFirst({
      where: { tenantId, id: reviewId },
    });
    if (!existing) return null;
    return this.prisma.specGatePreviewReview
      .update({ where: { id: reviewId }, data: patch })
      .then((row) => row as PreviewReviewRecord);
  }
  async createChecklist(checklist: PreviewChecklistRecord) {
    const { items, ...data } = checklist;
    await this.prisma.specGatePreviewChecklist.create({
      data: { ...data, itemsJson: items },
    });
  }
}
