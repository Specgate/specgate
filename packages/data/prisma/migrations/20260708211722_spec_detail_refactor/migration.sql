-- AlterTable
ALTER TABLE "specgate_specs" ADD COLUMN     "extractionStatus" TEXT NOT NULL DEFAULT 'dirty',
ADD COLUMN     "lastExtractedAt" TIMESTAMPTZ(6),
ADD COLUMN     "requestDocumentJson" JSONB,
ADD COLUMN     "requestMarkdown" TEXT,
ADD COLUMN     "requestPlainText" TEXT;

-- CreateTable
CREATE TABLE "specgate_copilot_proposals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "summary" TEXT NOT NULL,
    "proposedPatchJson" JSONB,
    "questionsJson" JSONB,
    "createdBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_copilot_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "specgate_copilot_proposals_tenantId_idx" ON "specgate_copilot_proposals"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_copilot_proposals_tenantId_specId_idx" ON "specgate_copilot_proposals"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_copilot_proposals_tenantId_status_idx" ON "specgate_copilot_proposals"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "specgate_copilot_proposals" ADD CONSTRAINT "specgate_copilot_proposals_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
