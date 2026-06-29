CREATE TABLE "IntegrationConnection" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "providerKey" VARCHAR(120) NOT NULL,
  "authMethod" VARCHAR(32) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "displayName" VARCHAR(120),
  "configJson" JSONB,
  "secretEncrypted" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrationConnection_tenantId_workspaceId_idx"
ON "IntegrationConnection"("tenantId", "workspaceId");

CREATE INDEX "IntegrationConnection_tenantId_providerKey_status_idx"
ON "IntegrationConnection"("tenantId", "providerKey", "status");

CREATE INDEX "IntegrationConnection_workspaceId_providerKey_status_idx"
ON "IntegrationConnection"("workspaceId", "providerKey", "status");

ALTER TABLE "IntegrationConnection"
ADD CONSTRAINT "IntegrationConnection_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IntegrationConnection"
ADD CONSTRAINT "IntegrationConnection_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
