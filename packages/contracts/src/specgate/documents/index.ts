import { z } from "zod";

export const SpecGateDocumentStatusSchema = z.enum(["draft", "published", "archived"]);
export const SpecGateDocumentTypeSchema = z.enum([
  "product_brief",
  "research",
  "business_rule",
  "customer_feedback",
  "ux_note",
  "api_note",
  "meeting_note",
  "release_note",
  "general",
]);
export const SpecGateDocumentAssetKindSchema = z.enum(["image", "pdf"]);

export const SpecGateDocumentAssetDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  projectId: z.string(),
  documentId: z.string().nullable(),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number(),
  storageKey: z.string(),
  bucket: z.string().nullable(),
  checksum: z.string().nullable(),
  kind: SpecGateDocumentAssetKindSchema,
  altText: z.string().nullable(),
  caption: z.string().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.string().datetime(),
  url: z.string().optional(),
});

export const SpecGateDocumentDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  projectId: z.string(),
  title: z.string(),
  slug: z.string().nullable(),
  type: SpecGateDocumentTypeSchema,
  status: SpecGateDocumentStatusSchema,
  summary: z.string().nullable(),
  contentJson: z.any().nullable(),
  contentMarkdown: z.string().nullable(),
  tags: z.array(z.string()),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  archivedAt: z.string().datetime().nullable(),
  assets: z.array(SpecGateDocumentAssetDtoSchema).optional(),
});

export const SpecGateDocumentListItemDtoSchema = SpecGateDocumentDtoSchema.omit({
  contentJson: true,
  contentMarkdown: true,
  assets: true,
}).extend({
  linkedSpecCount: z.number().optional(),
  assetCount: z.number().optional(),
});

export const CreateSpecGateDocumentRequestSchema = z.object({
  title: z.string(),
  type: SpecGateDocumentTypeSchema,
  status: SpecGateDocumentStatusSchema.optional(),
  summary: z.string().optional().nullable(),
  contentJson: z.any().optional().nullable(),
  tags: z.array(z.string()).optional(),
  assetIds: z.array(z.string()).optional(),
});

export const UpdateSpecGateDocumentRequestSchema = z.object({
  title: z.string().optional(),
  type: SpecGateDocumentTypeSchema.optional(),
  status: SpecGateDocumentStatusSchema.optional(),
  summary: z.string().optional().nullable(),
  contentJson: z.any().optional().nullable(),
  tags: z.array(z.string()).optional(),
  archivedAt: z.string().datetime().nullable().optional(),
});

export const SpecGateSpecDocumentLinkDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  projectId: z.string(),
  specId: z.string(),
  documentId: z.string(),
  relevance: z.string().nullable(),
  note: z.string().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.string().datetime(),
  document: SpecGateDocumentDtoSchema.optional(),
});

export const LinkSpecGateDocumentToSpecRequestSchema = z.object({
  documentId: z.string(),
  relevance: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const ListSpecGateDocumentsQuerySchema = z.object({
  type: SpecGateDocumentTypeSchema.optional(),
  status: SpecGateDocumentStatusSchema.optional(),
  query: z.string().optional(),
  tag: z.string().optional(),
});

export const UploadSpecGateDocumentAssetResponseSchema = z.object({
  asset: SpecGateDocumentAssetDtoSchema,
});

export type SpecGateDocumentStatus = z.infer<typeof SpecGateDocumentStatusSchema>;
export type SpecGateDocumentType = z.infer<typeof SpecGateDocumentTypeSchema>;
export type SpecGateDocumentAssetKind = z.infer<typeof SpecGateDocumentAssetKindSchema>;
export type SpecGateDocumentAssetDto = z.infer<typeof SpecGateDocumentAssetDtoSchema>;
export type SpecGateDocumentDto = z.infer<typeof SpecGateDocumentDtoSchema>;
export type SpecGateDocumentListItemDto = z.infer<typeof SpecGateDocumentListItemDtoSchema>;
export type CreateSpecGateDocumentRequest = z.infer<typeof CreateSpecGateDocumentRequestSchema>;
export type UpdateSpecGateDocumentRequest = z.infer<typeof UpdateSpecGateDocumentRequestSchema>;
export type SpecGateSpecDocumentLinkDto = z.infer<typeof SpecGateSpecDocumentLinkDtoSchema>;
export type LinkSpecGateDocumentToSpecRequest = z.infer<typeof LinkSpecGateDocumentToSpecRequestSchema>;
export type ListSpecGateDocumentsQuery = z.infer<typeof ListSpecGateDocumentsQuerySchema>;
export type UploadSpecGateDocumentAssetResponse = z.infer<typeof UploadSpecGateDocumentAssetResponseSchema>;
