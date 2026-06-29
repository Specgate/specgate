ALTER TABLE "specgate_specs"
ADD COLUMN "audience" TEXT,
ADD COLUMN "openQuestionsJson" JSONB;

CREATE TABLE "specgate_spec_assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_spec_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "specgate_spec_assets_tenantId_idx" ON "specgate_spec_assets"("tenantId");
CREATE INDEX "specgate_spec_assets_tenantId_projectId_idx" ON "specgate_spec_assets"("tenantId", "projectId");
CREATE INDEX "specgate_spec_assets_tenantId_specId_idx" ON "specgate_spec_assets"("tenantId", "specId");

ALTER TABLE "specgate_spec_assets"
ADD CONSTRAINT "specgate_spec_assets_specId_fkey"
FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
