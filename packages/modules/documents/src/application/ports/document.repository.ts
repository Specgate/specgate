import type {
  SpecGateDocumentDto,
  SpecGateDocumentListItemDto,
  SpecGateDocumentAssetDto,
  SpecGateSpecDocumentLinkDto,
  ListSpecGateDocumentsQuery,
} from "@corely/contracts/specgate";

export interface IDocumentRepository {
  createDocument(document: Omit<SpecGateDocumentDto, "id" | "createdAt" | "updatedAt" | "assets">): Promise<SpecGateDocumentDto>;
  updateDocument(id: string, updates: Partial<SpecGateDocumentDto>): Promise<SpecGateDocumentDto>;
  getDocumentById(tenantId: string, projectId: string, id: string): Promise<SpecGateDocumentDto | null>;
  listDocuments(tenantId: string, projectId: string, query: ListSpecGateDocumentsQuery): Promise<SpecGateDocumentListItemDto[]>;
  deleteDocument(tenantId: string, projectId: string, id: string): Promise<void>;

  createAsset(asset: Omit<SpecGateDocumentAssetDto, "id" | "createdAt">): Promise<SpecGateDocumentAssetDto>;
  updateAsset(id: string, updates: Partial<SpecGateDocumentAssetDto>): Promise<SpecGateDocumentAssetDto>;
  getAssetById(tenantId: string, projectId: string, id: string): Promise<SpecGateDocumentAssetDto | null>;
  deleteAsset(tenantId: string, projectId: string, id: string): Promise<void>;

  linkDocumentToSpec(tenantId: string, projectId: string, specId: string, documentId: string, relevance?: string | null, note?: string | null, createdById?: string | null): Promise<SpecGateSpecDocumentLinkDto>;
  unlinkDocumentFromSpec(tenantId: string, projectId: string, specId: string, documentId: string): Promise<void>;
  listSpecRelatedDocuments(tenantId: string, projectId: string, specId: string): Promise<SpecGateSpecDocumentLinkDto[]>;
  
  attachAssetsToDocument(tenantId: string, projectId: string, documentId: string, assetIds: string[]): Promise<void>;
}
