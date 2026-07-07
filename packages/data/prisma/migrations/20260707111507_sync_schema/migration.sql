-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "legalEntityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "specgate_projects" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "specgate_specs" ADD COLUMN     "agentReadiness" TEXT NOT NULL DEFAULT 'needs_clarification',
ADD COLUMN     "agentTargetsJson" JSONB,
ADD COLUMN     "requiresCodeChanges" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "riskLevel" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "suggestedSearchTermsJson" JSONB,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'feature',
ADD COLUMN     "verificationPlanJson" JSONB;

-- CreateIndex
CREATE INDEX "specgate_projects_workspaceId_idx" ON "specgate_projects"("workspaceId");

-- AddForeignKey
ALTER TABLE "specgate_projects" ADD CONSTRAINT "specgate_projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
