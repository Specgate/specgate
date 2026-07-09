-- CreateTable
CREATE TABLE "specgate_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "summary" TEXT,
    "contentJson" JSONB,
    "contentMarkdown" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "archivedAt" TIMESTAMPTZ(6),

    CONSTRAINT "specgate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_document_assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucket" TEXT,
    "checksum" TEXT,
    "kind" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_document_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_spec_document_links" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "relevance" TEXT,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_spec_document_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "specgate_documents_tenantId_projectId_idx" ON "specgate_documents"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_documents_tenantId_projectId_type_idx" ON "specgate_documents"("tenantId", "projectId", "type");

-- CreateIndex
CREATE INDEX "specgate_documents_tenantId_projectId_status_idx" ON "specgate_documents"("tenantId", "projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_documents_tenantId_projectId_slug_key" ON "specgate_documents"("tenantId", "projectId", "slug");

-- CreateIndex
CREATE INDEX "specgate_document_assets_tenantId_projectId_idx" ON "specgate_document_assets"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_document_assets_tenantId_projectId_documentId_idx" ON "specgate_document_assets"("tenantId", "projectId", "documentId");

-- CreateIndex
CREATE INDEX "specgate_spec_document_links_tenantId_projectId_specId_idx" ON "specgate_spec_document_links"("tenantId", "projectId", "specId");

-- CreateIndex
CREATE INDEX "specgate_spec_document_links_tenantId_projectId_documentId_idx" ON "specgate_spec_document_links"("tenantId", "projectId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_spec_document_links_tenantId_projectId_specId_docu_key" ON "specgate_spec_document_links"("tenantId", "projectId", "specId", "documentId");

-- AddForeignKey
ALTER TABLE "specgate_documents" ADD CONSTRAINT "specgate_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "specgate_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_document_assets" ADD CONSTRAINT "specgate_document_assets_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "specgate_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_spec_document_links" ADD CONSTRAINT "specgate_spec_document_links_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_spec_document_links" ADD CONSTRAINT "specgate_spec_document_links_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "specgate_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
