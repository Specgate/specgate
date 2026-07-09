import { randomUUID } from "node:crypto";
import type { ObjectStoragePort } from "@corely/kernel";
import type {
  CreateSpecGateDocumentRequest,
  UpdateSpecGateDocumentRequest,
  SpecGateDocumentDto,
  SpecGateDocumentListItemDto,
  SpecGateDocumentAssetDto,
  SpecGateSpecDocumentLinkDto,
  LinkSpecGateDocumentToSpecRequest,
  ListSpecGateDocumentsQuery,
} from "@corely/contracts/specgate";
import type { IDocumentRepository } from "../ports/document.repository";
import type { ActivityPublisherPort } from "../ports/activity.port";
import { DocumentNotFoundError, AssetNotFoundError } from "../../domain/errors";

export type RequestContext = { tenantId: string; userId: string };

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export class DocumentsUseCases {
  constructor(
    private readonly repository: IDocumentRepository,
    private readonly activity?: ActivityPublisherPort,
    private readonly storage?: ObjectStoragePort,
  ) {}

  async createDocument(
    ctx: RequestContext,
    projectId: string,
    input: CreateSpecGateDocumentRequest
  ): Promise<{ data: SpecGateDocumentDto }> {
    const id = randomUUID();
    const document = await this.repository.createDocument({
      tenantId: ctx.tenantId,
      projectId,
      title: input.title,
      slug: slugify(input.title),
      type: input.type,
      status: input.status || "draft",
      summary: input.summary || null,
      contentJson: input.contentJson || null,
      contentMarkdown: null,
      tags: input.tags || [],
      createdById: ctx.userId,
      updatedById: ctx.userId,
      archivedAt: null,
    });

    if (input.assetIds && input.assetIds.length > 0) {
      await this.repository.attachAssetsToDocument(ctx.tenantId, projectId, id, input.assetIds);
    }

    await this.publish(ctx, projectId, null, "document_created", `${ctx.userId} created document ${input.title}.`);

    return { data: await this.repository.getDocumentById(ctx.tenantId, projectId, document.id) as SpecGateDocumentDto };
  }

  async updateDocument(
    ctx: RequestContext,
    projectId: string,
    documentId: string,
    input: UpdateSpecGateDocumentRequest
  ): Promise<{ data: SpecGateDocumentDto }> {
    const existing = await this.requireDocument(ctx.tenantId, projectId, documentId);
    
    const patch: Partial<SpecGateDocumentDto> = {
      ...input,
      summary: input.summary === undefined ? undefined : input.summary || null,
      contentJson: input.contentJson === undefined ? undefined : input.contentJson || null,
      updatedById: ctx.userId,
    };
    if (input.title && existing.title !== input.title) {
      patch.slug = slugify(input.title);
    }

    const updated = await this.repository.updateDocument(documentId, patch);
    await this.publish(ctx, projectId, null, "document_updated", `${ctx.userId} updated document ${updated.title}.`);

    return { data: await this.repository.getDocumentById(ctx.tenantId, projectId, documentId) as SpecGateDocumentDto };
  }

  async getDocument(
    ctx: RequestContext,
    projectId: string,
    documentId: string
  ): Promise<{ data: SpecGateDocumentDto }> {
    const document = await this.requireDocument(ctx.tenantId, projectId, documentId);
    
    if (document.assets && this.storage) {
      const assetsWithUrls = await Promise.all(
        document.assets.map((asset) => this.mapAssetWithUrl(ctx, asset))
      );
      document.assets = assetsWithUrls;
    }
    
    return { data: document };
  }

  async listDocuments(
    ctx: RequestContext,
    projectId: string,
    query: ListSpecGateDocumentsQuery
  ): Promise<{ data: SpecGateDocumentListItemDto[] }> {
    const documents = await this.repository.listDocuments(ctx.tenantId, projectId, query);
    return { data: documents };
  }

  async deleteDocument(
    ctx: RequestContext,
    projectId: string,
    documentId: string
  ): Promise<{ data: { deleted: true } }> {
    const document = await this.requireDocument(ctx.tenantId, projectId, documentId);
    await this.repository.deleteDocument(ctx.tenantId, projectId, documentId);
    await this.publish(ctx, projectId, null, "document_deleted", `${ctx.userId} deleted document ${document.title}.`);
    return { data: { deleted: true } };
  }

  async uploadDocumentAsset(
    ctx: RequestContext,
    projectId: string,
    documentId: string | null,
    input: {
      fileName: string;
      contentType: string;
      sizeBytes: number;
      bytes: Buffer;
      altText?: string | null;
      caption?: string | null;
    }
  ): Promise<{ data: { asset: SpecGateDocumentAssetDto } }> {
    const storage = this.storage;
    if (!storage) throw new Error("Object storage is not configured.");

    const allowedTypes = new Set([
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf"
    ]);
    if (!allowedTypes.has(input.contentType)) {
      throw new Error("Unsupported file type. Please upload PNG, JPG, WebP, or PDF.");
    }
    if (input.sizeBytes > 25 * 1024 * 1024) {
      throw new Error("File is too large.");
    }

    let document: SpecGateDocumentDto | null = null;
    if (documentId) {
      document = await this.requireDocument(ctx.tenantId, projectId, documentId);
    }

    const now = new Date();
    const assetId = randomUUID();
    const safeFileName = input.fileName.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "file";
    
    let storageKey = `specgate/${ctx.tenantId}/${projectId}/documents/drafts/${assetId}-${safeFileName}`;
    if (documentId) {
      storageKey = `specgate/${ctx.tenantId}/${projectId}/documents/${documentId}/${assetId}-${safeFileName}`;
    }

    await storage.putObject({
      tenantId: ctx.tenantId,
      objectKey: storageKey,
      contentType: input.contentType,
      bytes: input.bytes,
    });

    const kind = input.contentType === "application/pdf" ? "pdf" : "image";

    const asset = await this.repository.createAsset({
      tenantId: ctx.tenantId,
      projectId,
      documentId: documentId || null,
      fileName: input.fileName,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      storageKey,
      bucket: storage.provider() === "gcs" ? "gcp" : "local",
      checksum: null,
      kind,
      altText: input.altText || null,
      caption: input.caption || null,
      createdById: ctx.userId,
    });

    if (documentId && document) {
      await this.publish(ctx, projectId, null, "document_asset_uploaded", `${ctx.userId} uploaded an asset to document ${document.title}.`);
    }

    return {
      data: {
        asset: await this.mapAssetWithUrl(ctx, asset),
      },
    };
  }

  async deleteDocumentAsset(
    ctx: RequestContext,
    projectId: string,
    documentId: string,
    assetId: string
  ): Promise<{ data: { deleted: true } }> {
    const asset = await this.repository.getAssetById(ctx.tenantId, projectId, assetId);
    if (!asset) throw new AssetNotFoundError(assetId);

    await this.repository.deleteAsset(ctx.tenantId, projectId, assetId);
    await this.publish(ctx, projectId, null, "document_asset_deleted", `${ctx.userId} deleted an asset.`);
    
    return { data: { deleted: true } };
  }

  async linkDocumentToSpec(
    ctx: RequestContext,
    projectId: string,
    specId: string,
    input: LinkSpecGateDocumentToSpecRequest
  ): Promise<{ data: SpecGateSpecDocumentLinkDto }> {
    const document = await this.requireDocument(ctx.tenantId, projectId, input.documentId);
    const link = await this.repository.linkDocumentToSpec(
      ctx.tenantId,
      projectId,
      specId,
      input.documentId,
      input.relevance,
      input.note,
      ctx.userId
    );

    await this.publish(ctx, projectId, specId, "document_linked_to_spec", `${ctx.userId} linked document ${document.title} to spec.`);
    return { data: link };
  }

  async unlinkDocumentFromSpec(
    ctx: RequestContext,
    projectId: string,
    specId: string,
    documentId: string
  ): Promise<{ data: { deleted: true } }> {
    await this.repository.unlinkDocumentFromSpec(ctx.tenantId, projectId, specId, documentId);
    await this.publish(ctx, projectId, specId, "document_unlinked_from_spec", `${ctx.userId} unlinked a document from spec.`);
    return { data: { deleted: true } };
  }

  async listSpecRelatedDocuments(
    ctx: RequestContext,
    projectId: string,
    specId: string
  ): Promise<{ data: SpecGateSpecDocumentLinkDto[] }> {
    const links = await this.repository.listSpecRelatedDocuments(ctx.tenantId, projectId, specId);
    // Resolve URLs for assets
    if (this.storage) {
      for (const link of links) {
        if (link.document?.assets) {
          link.document.assets = await Promise.all(
            link.document.assets.map(asset => this.mapAssetWithUrl(ctx, asset))
          );
        }
      }
    }
    return { data: links };
  }

  async getDocumentsForAgentContext(
    ctx: RequestContext,
    projectId: string,
    specId: string
  ): Promise<{ markdown: string }> {
    const links = await this.repository.listSpecRelatedDocuments(ctx.tenantId, projectId, specId);
    
    if (links.length === 0) {
      return { markdown: "" };
    }

    const markdownParts: string[] = [];
    markdownParts.push("## Related Documents");

    for (const link of links) {
      if (!link.document) continue;
      const doc = link.document;
      
      markdownParts.push(`\n### ${doc.type === "product_brief" ? "Product Brief" : "Document"}: ${doc.title}`);
      if (doc.summary) {
        markdownParts.push(`Summary: ${doc.summary}`);
      }
      if (link.relevance) {
        markdownParts.push(`Why relevant: ${link.relevance}`);
      }

      if (doc.contentMarkdown || doc.contentJson) {
        markdownParts.push("\nKey content:");
        markdownParts.push(doc.contentMarkdown || JSON.stringify(doc.contentJson));
      }

      if (doc.assets && doc.assets.length > 0) {
        markdownParts.push("\nAttachments:");
        for (const asset of doc.assets) {
          markdownParts.push(`- ${asset.kind}: ${asset.fileName}`);
        }
      }
    }

    return { markdown: markdownParts.join("\n") };
  }

  private async requireDocument(tenantId: string, projectId: string, documentId: string) {
    const document = await this.repository.getDocumentById(tenantId, projectId, documentId);
    if (!document) throw new DocumentNotFoundError(documentId);
    return document;
  }

  private async mapAssetWithUrl(ctx: RequestContext, asset: SpecGateDocumentAssetDto): Promise<SpecGateDocumentAssetDto> {
    if (!this.storage) return asset;
    try {
      const signedDownload = await this.storage.createSignedDownloadUrl({
        tenantId: ctx.tenantId,
        objectKey: asset.storageKey,
        expiresInSeconds: 900,
      });
      return { ...asset, url: signedDownload.url };
    } catch {
      return asset;
    }
  }

  private async publish(
    ctx: RequestContext,
    projectId: string,
    specId: string | null,
    type: string,
    message: string
  ) {
    if (!this.activity) return;
    await this.activity.publish({
      tenantId: ctx.tenantId,
      projectId,
      specId,
      actorId: ctx.userId,
      type,
      message,
    });
  }
}
