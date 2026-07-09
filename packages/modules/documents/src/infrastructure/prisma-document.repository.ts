import type {
  SpecGateDocumentDto,
  SpecGateDocumentListItemDto,
  SpecGateDocumentAssetDto,
  SpecGateSpecDocumentLinkDto,
  ListSpecGateDocumentsQuery,
} from "@corely/contracts/specgate";
import type { IDocumentRepository } from "../application/ports/document.repository";
import { DocumentNotFoundError, AssetNotFoundError } from "../domain/errors";

type PrismaDocumentRow = {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  summary: string | null;
  contentJson: unknown;
  contentMarkdown: string | null;
  tags: string[];
  createdById: string | null;
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  assets?: PrismaAssetRow[];
  _count?: { specLinks: number; assets: number };
};

type PrismaAssetRow = {
  id: string;
  tenantId: string;
  projectId: string;
  documentId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  bucket: string;
  checksum: string | null;
  kind: string | null;
  altText: string | null;
  caption: string | null;
  createdById: string | null;
  createdAt: Date;
};

type PrismaLinkRow = {
  id: string;
  tenantId: string;
  projectId: string;
  specId: string;
  documentId: string;
  relevance: string | null;
  note: string | null;
  createdById: string | null;
  createdAt: Date;
  document?: PrismaDocumentRow;
};

type ModelClient<T> = {
  findMany(args?: unknown): Promise<T[]>;
  findFirst(args?: unknown): Promise<T | null>;
  create(args: unknown): Promise<T>;
  update(args: unknown): Promise<T>;
  delete(args: unknown): Promise<T>;
  count(args?: unknown): Promise<number>;
  updateMany?(args: unknown): Promise<{ count: number }>;
  deleteMany?(args: unknown): Promise<{ count: number }>;
};

type PrismaClientShape = {
  specGateDocument: ModelClient<PrismaDocumentRow>;
  specGateDocumentAsset: ModelClient<PrismaAssetRow>;
  specGateSpecDocumentLink: ModelClient<PrismaLinkRow>;
  $transaction: (args: unknown[]) => Promise<unknown[]>;
};

export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClientShape) {}

  async createDocument(document: Omit<SpecGateDocumentDto, "id" | "createdAt" | "updatedAt" | "assets">): Promise<SpecGateDocumentDto> {
    const row = await this.prisma.specGateDocument.create({
      data: document,
    });
    return this.mapDocument(row);
  }

  async updateDocument(id: string, updates: Partial<SpecGateDocumentDto>): Promise<SpecGateDocumentDto> {
    const row = await this.prisma.specGateDocument.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
    });
    return this.mapDocument(row);
  }

  async getDocumentById(tenantId: string, projectId: string, id: string): Promise<SpecGateDocumentDto | null> {
    const row = await this.prisma.specGateDocument.findFirst({
      where: { id, tenantId, projectId },
      include: {
        assets: true,
      },
    });
    return row ? this.mapDocument(row) : null;
  }

  async listDocuments(tenantId: string, projectId: string, query: ListSpecGateDocumentsQuery): Promise<SpecGateDocumentListItemDto[]> {
    const where: Record<string, unknown> = { tenantId, projectId };
    
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.tag) where.tags = { has: query.tag };
    
    if (query.query) {
      where.OR = [
        { title: { contains: query.query, mode: "insensitive" } },
        { summary: { contains: query.query, mode: "insensitive" } },
      ];
    }

    const rows = await this.prisma.specGateDocument.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { specLinks: true, assets: true },
        },
      },
    });

    return rows.map((row: PrismaDocumentRow) => ({
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      title: row.title,
      slug: row.slug,
      type: row.type as SpecGateDocumentListItemDto["type"],
      status: row.status as SpecGateDocumentListItemDto["status"],
      summary: row.summary,
      tags: row.tags,
      createdById: row.createdById,
      updatedById: row.updatedById,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      archivedAt: row.archivedAt?.toISOString() || null,
      linkedSpecCount: row._count?.specLinks || 0,
      assetCount: row._count?.assets || 0,
    }));
  }

  async deleteDocument(tenantId: string, projectId: string, id: string): Promise<void> {
    await this.prisma.specGateDocument.delete({
      where: { id },
    });
  }

  async createAsset(asset: Omit<SpecGateDocumentAssetDto, "id" | "createdAt">): Promise<SpecGateDocumentAssetDto> {
    const row = await this.prisma.specGateDocumentAsset.create({
      data: asset,
    });
    return this.mapAsset(row);
  }

  async updateAsset(id: string, updates: Partial<SpecGateDocumentAssetDto>): Promise<SpecGateDocumentAssetDto> {
    const row = await this.prisma.specGateDocumentAsset.update({
      where: { id },
      data: updates,
    });
    return this.mapAsset(row);
  }

  async getAssetById(tenantId: string, projectId: string, id: string): Promise<SpecGateDocumentAssetDto | null> {
    const row = await this.prisma.specGateDocumentAsset.findFirst({
      where: { id, tenantId, projectId },
    });
    return row ? this.mapAsset(row) : null;
  }

  async deleteAsset(tenantId: string, projectId: string, id: string): Promise<void> {
    await this.prisma.specGateDocumentAsset.delete({
      where: { id },
    });
  }

  async attachAssetsToDocument(tenantId: string, projectId: string, documentId: string, assetIds: string[]): Promise<void> {
    if (assetIds.length === 0) return;
    // Prisma client allows updateMany but we only have basic shape here. We can just use it with any cast or loop.
    await this.prisma.specGateDocumentAsset.updateMany!({
      where: { tenantId, projectId, id: { in: assetIds } },
      data: { documentId },
    });
  }

  async linkDocumentToSpec(tenantId: string, projectId: string, specId: string, documentId: string, relevance?: string | null, note?: string | null, createdById?: string | null): Promise<SpecGateSpecDocumentLinkDto> {
    const row = await this.prisma.specGateSpecDocumentLink.create({
      data: { tenantId, projectId, specId, documentId, relevance, note, createdById },
    });
    return this.mapLink(row);
  }

  async unlinkDocumentFromSpec(tenantId: string, projectId: string, specId: string, documentId: string): Promise<void> {
    await this.prisma.specGateSpecDocumentLink.deleteMany!({
      where: { tenantId, projectId, specId, documentId },
    });
  }

  async listSpecRelatedDocuments(tenantId: string, projectId: string, specId: string): Promise<SpecGateSpecDocumentLinkDto[]> {
    const rows = await this.prisma.specGateSpecDocumentLink.findMany({
      where: { tenantId, projectId, specId },
      include: {
        document: {
          include: {
            assets: true,
          }
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row: PrismaLinkRow) => ({
      ...this.mapLink(row),
      document: row.document ? this.mapDocument(row.document) : undefined,
    }));
  }

  private mapDocument(row: PrismaDocumentRow): SpecGateDocumentDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      title: row.title,
      slug: row.slug,
      type: row.type as SpecGateDocumentDto["type"],
      status: row.status as SpecGateDocumentDto["status"],
      summary: row.summary,
      contentJson: row.contentJson,
      contentMarkdown: row.contentMarkdown,
      tags: row.tags || [],
      createdById: row.createdById,
      updatedById: row.updatedById,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      archivedAt: row.archivedAt?.toISOString() || null,
      assets: row.assets ? row.assets.map((a: PrismaAssetRow) => this.mapAsset(a)) : undefined,
    };
  }

  private mapAsset(row: PrismaAssetRow): SpecGateDocumentAssetDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      documentId: row.documentId,
      fileName: row.fileName,
      contentType: row.contentType,
      sizeBytes: row.sizeBytes,
      storageKey: row.storageKey,
      bucket: row.bucket,
      checksum: row.checksum,
      kind: row.kind as SpecGateDocumentAssetDto["kind"],
      altText: row.altText,
      caption: row.caption,
      createdById: row.createdById,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private mapLink(row: PrismaLinkRow): SpecGateSpecDocumentLinkDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      specId: row.specId,
      documentId: row.documentId,
      relevance: row.relevance,
      note: row.note,
      createdById: row.createdById,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
