-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ext";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- CreateEnum
CREATE TYPE "platform"."PackInstallStatus" AS ENUM ('PENDING', 'RUNNING', 'FAILED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "platform"."MenuScope" AS ENUM ('WEB', 'POS');

-- CreateEnum
CREATE TYPE "identity"."RoleScope" AS ENUM ('HOST', 'TENANT');

-- CreateEnum
CREATE TYPE "identity"."PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "platform"."CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'MONEY');

-- CreateEnum
CREATE TYPE "platform"."WorkspaceMembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'ACCOUNTANT', 'VIEWER');

-- CreateEnum
CREATE TYPE "platform"."WorkspaceMembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "platform"."WorkspaceInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "platform"."WorkspaceOnboardingStatus" AS ENUM ('NEW', 'PROFILE', 'DONE');

-- DropForeignKey
ALTER TABLE "vibeguard_findings" DROP CONSTRAINT "vibeguard_findings_scan_run_fk";

-- DropForeignKey
ALTER TABLE "vibeguard_fix_plans" DROP CONSTRAINT "vibeguard_fix_plans_scan_run_fk";

-- DropForeignKey
ALTER TABLE "vibeguard_pull_requests" DROP CONSTRAINT "vibeguard_pull_requests_fix_plan_fk";

-- DropForeignKey
ALTER TABLE "vibeguard_scan_runs" DROP CONSTRAINT "vibeguard_scan_runs_repo_connection_fk";

-- CreateTable
CREATE TABLE "ext"."ExtKv" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExtKv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ext"."ExtEntityAttr" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "attrKey" TEXT NOT NULL,
    "attrValue" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExtEntityAttr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ext"."ExtEntityLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "fromEntityType" TEXT NOT NULL,
    "fromEntityId" TEXT NOT NULL,
    "toEntityType" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtEntityLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."AppCatalog" (
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "depsJson" TEXT NOT NULL,
    "permissionsJson" TEXT NOT NULL,
    "capabilitiesJson" TEXT NOT NULL,
    "menuJson" TEXT NOT NULL,
    "settingsSchemaJson" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AppCatalog_pkey" PRIMARY KEY ("appId")
);

-- CreateTable
CREATE TABLE "platform"."TenantAppInstall" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "installed_version" TEXT NOT NULL,
    "config_json" TEXT,
    "enabled_at" TIMESTAMPTZ(6),
    "enabled_by_user_id" TEXT,
    "disabled_at" TIMESTAMPTZ(6),
    "disabled_by_user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TenantAppInstall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."TenantFeatureOverride" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "value_json" TEXT NOT NULL,
    "updated_by" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "TenantFeatureOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."TemplateCatalog" (
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "requires_apps_json" TEXT NOT NULL,
    "params_schema_json" TEXT NOT NULL,
    "upgrade_policy_json" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TemplateCatalog_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "platform"."TenantTemplateInstall" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "params_json" TEXT NOT NULL,
    "applied_by_user_id" TEXT,
    "applied_at" TIMESTAMPTZ(6) NOT NULL,
    "result_summary_json" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TenantTemplateInstall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."PackCatalog" (
    "pack_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "definition_json" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PackCatalog_pkey" PRIMARY KEY ("pack_id")
);

-- CreateTable
CREATE TABLE "platform"."TenantPackInstall" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "platform"."PackInstallStatus" NOT NULL DEFAULT 'PENDING',
    "params_json" TEXT,
    "log_json" TEXT NOT NULL DEFAULT '[]',
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "installed_by_user_id" TEXT,
    "error_json" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TenantPackInstall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."TenantMenuOverride" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "scope" "platform"."MenuScope" NOT NULL,
    "overrides_json" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TenantMenuOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."SeededRecordMeta" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "target_table" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "source_template_id" TEXT NOT NULL,
    "source_template_version" TEXT NOT NULL,
    "is_customized" BOOLEAN NOT NULL DEFAULT false,
    "customized_at" TIMESTAMPTZ(6),
    "customized_by_user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SeededRecordMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Membership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "scope" "identity"."RoleScope" NOT NULL DEFAULT 'TENANT',
    "systemKey" TEXT,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "identity"."RolePermissionGrant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "roleId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    "effect" "identity"."PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "RolePermissionGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."PortalOtpCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastSentAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PortalOtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."PortalSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "lastUsedAt" TIMESTAMPTZ(6),
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "platform"."CustomFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL,
    "defaultValue" JSONB,
    "options" JSONB,
    "validation" JSONB,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."CustomFieldIndex" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueDate" TIMESTAMP(3),
    "valueBool" BOOLEAN,
    "valueJson" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."EntityLayout" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."DimensionType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appliesTo" TEXT[],
    "requiredFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DimensionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."DimensionValue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DimensionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."EntityDimension" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "valueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityDimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."LegalEntity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "taxId" TEXT,
    "vatId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "address" JSONB,
    "bankAccount" JSONB,

    CONSTRAINT "LegalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."Workspace" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "publicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "publicModules" JSONB,
    "onboardingStatus" "platform"."WorkspaceOnboardingStatus" NOT NULL DEFAULT 'NEW',
    "onboardingCompletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."WorkspaceDomain" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."WorkspaceMembership" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "platform"."WorkspaceMembershipRole" NOT NULL,
    "status" "platform"."WorkspaceMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."WorkspaceInvite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "platform"."WorkspaceMembershipRole" NOT NULL,
    "status" "platform"."WorkspaceInviteStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."AgentRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "title" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "traceId" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."Message" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "partsJson" TEXT NOT NULL,
    "contentText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traceId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."ToolExecution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "toolCallId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "inputJson" TEXT NOT NULL,
    "outputJson" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorJson" TEXT,
    "traceId" TEXT,

    CONSTRAINT "ToolExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtKv_tenantId_moduleId_idx" ON "ext"."ExtKv"("tenantId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtKv_tenantId_moduleId_scope_key_key" ON "ext"."ExtKv"("tenantId", "moduleId", "scope", "key");

-- CreateIndex
CREATE INDEX "ExtEntityAttr_tenantId_entityType_entityId_idx" ON "ext"."ExtEntityAttr"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ExtEntityAttr_tenantId_moduleId_idx" ON "ext"."ExtEntityAttr"("tenantId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtEntityAttr_tenantId_moduleId_entityType_entityId_attrKey_key" ON "ext"."ExtEntityAttr"("tenantId", "moduleId", "entityType", "entityId", "attrKey");

-- CreateIndex
CREATE INDEX "ExtEntityLink_tenantId_fromEntityType_fromEntityId_idx" ON "ext"."ExtEntityLink"("tenantId", "fromEntityType", "fromEntityId");

-- CreateIndex
CREATE INDEX "ExtEntityLink_tenantId_toEntityType_toEntityId_idx" ON "ext"."ExtEntityLink"("tenantId", "toEntityType", "toEntityId");

-- CreateIndex
CREATE INDEX "ExtEntityLink_tenantId_moduleId_linkType_idx" ON "ext"."ExtEntityLink"("tenantId", "moduleId", "linkType");

-- CreateIndex
CREATE UNIQUE INDEX "ExtEntityLink_tenantId_moduleId_fromEntityType_fromEntityId_key" ON "ext"."ExtEntityLink"("tenantId", "moduleId", "fromEntityType", "fromEntityId", "toEntityType", "toEntityId", "linkType");

-- CreateIndex
CREATE INDEX "AppCatalog_tier_idx" ON "platform"."AppCatalog"("tier");

-- CreateIndex
CREATE INDEX "AppCatalog_updatedAt_idx" ON "platform"."AppCatalog"("updatedAt");

-- CreateIndex
CREATE INDEX "TenantAppInstall_tenant_id_enabled_idx" ON "platform"."TenantAppInstall"("tenant_id", "enabled");

-- CreateIndex
CREATE INDEX "TenantAppInstall_tenant_id_created_at_idx" ON "platform"."TenantAppInstall"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAppInstall_tenant_id_app_id_key" ON "platform"."TenantAppInstall"("tenant_id", "app_id");

-- CreateIndex
CREATE INDEX "TenantFeatureOverride_tenant_id_idx" ON "platform"."TenantFeatureOverride"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantFeatureOverride_tenant_id_feature_key_key" ON "platform"."TenantFeatureOverride"("tenant_id", "feature_key");

-- CreateIndex
CREATE INDEX "TemplateCatalog_category_idx" ON "platform"."TemplateCatalog"("category");

-- CreateIndex
CREATE INDEX "TemplateCatalog_updated_at_idx" ON "platform"."TemplateCatalog"("updated_at");

-- CreateIndex
CREATE INDEX "TenantTemplateInstall_tenant_id_created_at_idx" ON "platform"."TenantTemplateInstall"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TenantTemplateInstall_tenant_id_template_id_key" ON "platform"."TenantTemplateInstall"("tenant_id", "template_id");

-- CreateIndex
CREATE INDEX "PackCatalog_updated_at_idx" ON "platform"."PackCatalog"("updated_at");

-- CreateIndex
CREATE INDEX "TenantPackInstall_tenant_id_status_idx" ON "platform"."TenantPackInstall"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "TenantPackInstall_tenant_id_created_at_idx" ON "platform"."TenantPackInstall"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPackInstall_tenant_id_pack_id_version_key" ON "platform"."TenantPackInstall"("tenant_id", "pack_id", "version");

-- CreateIndex
CREATE INDEX "TenantMenuOverride_tenant_id_idx" ON "platform"."TenantMenuOverride"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMenuOverride_tenant_id_scope_key" ON "platform"."TenantMenuOverride"("tenant_id", "scope");

-- CreateIndex
CREATE INDEX "SeededRecordMeta_tenant_id_source_template_id_idx" ON "platform"."SeededRecordMeta"("tenant_id", "source_template_id");

-- CreateIndex
CREATE INDEX "SeededRecordMeta_tenant_id_target_table_is_customized_idx" ON "platform"."SeededRecordMeta"("tenant_id", "target_table", "is_customized");

-- CreateIndex
CREATE UNIQUE INDEX "SeededRecordMeta_tenant_id_target_table_target_id_key" ON "platform"."SeededRecordMeta"("tenant_id", "target_table", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "identity"."Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_createdAt_idx" ON "identity"."Tenant"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "identity"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "identity"."User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "identity"."User"("createdAt");

-- CreateIndex
CREATE INDEX "Membership_tenantId_idx" ON "identity"."Membership"("tenantId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "identity"."Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_roleId_idx" ON "identity"."Membership"("roleId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_createdAt_idx" ON "identity"."Membership"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_tenantId_userId_key" ON "identity"."Membership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "identity"."Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_tenantId_systemKey_idx" ON "identity"."Role"("tenantId", "systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_systemKey_key" ON "identity"."Role"("tenantId", "systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "identity"."Role"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "identity"."Permission"("key");

-- CreateIndex
CREATE INDEX "Permission_key_idx" ON "identity"."Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "identity"."RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "identity"."RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "identity"."RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "RolePermissionGrant_tenantId_roleId_idx" ON "identity"."RolePermissionGrant"("tenantId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermissionGrant_permissionKey_idx" ON "identity"."RolePermissionGrant"("permissionKey");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissionGrant_tenantId_roleId_permissionKey_key" ON "identity"."RolePermissionGrant"("tenantId", "roleId", "permissionKey");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "identity"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tenantId_idx" ON "identity"."RefreshToken"("tenantId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "identity"."RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "identity"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "identity"."PasswordResetToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "identity"."PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PortalOtpCode_tenantId_workspaceId_emailNormalized_idx" ON "identity"."PortalOtpCode"("tenantId", "workspaceId", "emailNormalized");

-- CreateIndex
CREATE INDEX "PortalOtpCode_tenantId_workspaceId_emailNormalized_expiresA_idx" ON "identity"."PortalOtpCode"("tenantId", "workspaceId", "emailNormalized", "expiresAt");

-- CreateIndex
CREATE INDEX "PortalOtpCode_expiresAt_idx" ON "identity"."PortalOtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "PortalSession_tenantId_workspaceId_userId_idx" ON "identity"."PortalSession"("tenantId", "workspaceId", "userId");

-- CreateIndex
CREATE INDEX "PortalSession_refreshTokenHash_idx" ON "identity"."PortalSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "PortalSession_expiresAt_idx" ON "identity"."PortalSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "identity"."ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "identity"."ApiKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_tenantId_name_key" ON "identity"."ApiKey"("tenantId", "name");

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_tenantId_entityType_idx" ON "platform"."CustomFieldDefinition"("tenantId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDefinition_tenantId_entityType_key_key" ON "platform"."CustomFieldDefinition"("tenantId", "entityType", "key");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_fieldId_idx" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "fieldId");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_fieldKey_idx" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "fieldKey");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueText_idx" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "valueText");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueNumber_idx" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "valueNumber");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueDate_idx" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "valueDate");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueBool_idx" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "valueBool");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldIndex_tenantId_entityType_entityId_fieldId_key" ON "platform"."CustomFieldIndex"("tenantId", "entityType", "entityId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityLayout_tenantId_entityType_key" ON "platform"."EntityLayout"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "DimensionType_tenantId_isActive_sortOrder_idx" ON "platform"."DimensionType"("tenantId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionType_tenantId_code_key" ON "platform"."DimensionType"("tenantId", "code");

-- CreateIndex
CREATE INDEX "DimensionValue_tenantId_typeId_isActive_sortOrder_idx" ON "platform"."DimensionValue"("tenantId", "typeId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionValue_tenantId_typeId_code_key" ON "platform"."DimensionValue"("tenantId", "typeId", "code");

-- CreateIndex
CREATE INDEX "EntityDimension_tenantId_entityType_entityId_idx" ON "platform"."EntityDimension"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityDimension_tenantId_entityType_typeId_valueId_idx" ON "platform"."EntityDimension"("tenantId", "entityType", "typeId", "valueId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityDimension_tenantId_entityType_entityId_typeId_valueId_key" ON "platform"."EntityDimension"("tenantId", "entityType", "entityId", "typeId", "valueId");

-- CreateIndex
CREATE INDEX "LegalEntity_tenantId_idx" ON "platform"."LegalEntity"("tenantId");

-- CreateIndex
CREATE INDEX "LegalEntity_tenantId_kind_idx" ON "platform"."LegalEntity"("tenantId", "kind");

-- CreateIndex
CREATE INDEX "LegalEntity_tenantId_createdAt_idx" ON "platform"."LegalEntity"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "platform"."Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_idx" ON "platform"."Workspace"("tenantId");

-- CreateIndex
CREATE INDEX "Workspace_legalEntityId_idx" ON "platform"."Workspace"("legalEntityId");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_createdAt_idx" ON "platform"."Workspace"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_onboardingStatus_idx" ON "platform"."Workspace"("tenantId", "onboardingStatus");

-- CreateIndex
CREATE INDEX "Workspace_deletedAt_idx" ON "platform"."Workspace"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_tenantId_name_key" ON "platform"."Workspace"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceDomain_domain_key" ON "platform"."WorkspaceDomain"("domain");

-- CreateIndex
CREATE INDEX "WorkspaceDomain_workspaceId_idx" ON "platform"."WorkspaceDomain"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_idx" ON "platform"."WorkspaceMembership"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_userId_idx" ON "platform"."WorkspaceMembership"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_status_idx" ON "platform"."WorkspaceMembership"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_userId_status_idx" ON "platform"."WorkspaceMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_workspaceId_userId_key" ON "platform"."WorkspaceMembership"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvite_token_key" ON "platform"."WorkspaceInvite"("token");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_idx" ON "platform"."WorkspaceInvite"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "platform"."WorkspaceInvite"("email");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_token_idx" ON "platform"."WorkspaceInvite"("token");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_status_expiresAt_idx" ON "platform"."WorkspaceInvite"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_status_idx" ON "platform"."WorkspaceInvite"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "todos_tenantId_idx" ON "todos"("tenantId");

-- CreateIndex
CREATE INDEX "todos_workspaceId_idx" ON "todos"("workspaceId");

-- CreateIndex
CREATE INDEX "todos_tenantId_status_idx" ON "todos"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdAt_idx" ON "platform"."AgentRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdByUserId_lastMessageAt_idx" ON "platform"."AgentRun"("tenantId", "createdByUserId", "lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdByUserId_createdAt_idx" ON "platform"."AgentRun"("tenantId", "createdByUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_tenantId_runId_createdAt_idx" ON "platform"."Message"("tenantId", "runId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_tenantId_createdAt_idx" ON "platform"."Message"("tenantId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ToolExecution_tenantId_runId_toolCallId_key" ON "platform"."ToolExecution"("tenantId", "runId", "toolCallId");

-- AddForeignKey
ALTER TABLE "platform"."TenantAppInstall" ADD CONSTRAINT "TenantAppInstall_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."TenantFeatureOverride" ADD CONSTRAINT "TenantFeatureOverride_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."TenantTemplateInstall" ADD CONSTRAINT "TenantTemplateInstall_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."TenantPackInstall" ADD CONSTRAINT "TenantPackInstall_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."TenantMenuOverride" ADD CONSTRAINT "TenantMenuOverride_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."SeededRecordMeta" ADD CONSTRAINT "SeededRecordMeta_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."Membership" ADD CONSTRAINT "Membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "identity"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "identity"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "identity"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermissionGrant" ADD CONSTRAINT "RolePermissionGrant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermissionGrant" ADD CONSTRAINT "RolePermissionGrant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "identity"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermissionGrant" ADD CONSTRAINT "RolePermissionGrant_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "identity"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RefreshToken" ADD CONSTRAINT "RefreshToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."DimensionValue" ADD CONSTRAINT "DimensionValue_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "platform"."DimensionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."EntityDimension" ADD CONSTRAINT "EntityDimension_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "platform"."DimensionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."EntityDimension" ADD CONSTRAINT "EntityDimension_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "platform"."DimensionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."LegalEntity" ADD CONSTRAINT "LegalEntity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."Workspace" ADD CONSTRAINT "Workspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "identity"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."Workspace" ADD CONSTRAINT "Workspace_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "platform"."LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."WorkspaceDomain" ADD CONSTRAINT "WorkspaceDomain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "platform"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "platform"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "platform"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vibeguard_scan_runs" ADD CONSTRAINT "vibeguard_scan_runs_repoConnectionId_fkey" FOREIGN KEY ("repoConnectionId") REFERENCES "vibeguard_repo_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vibeguard_findings" ADD CONSTRAINT "vibeguard_findings_scanRunId_fkey" FOREIGN KEY ("scanRunId") REFERENCES "vibeguard_scan_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vibeguard_fix_plans" ADD CONSTRAINT "vibeguard_fix_plans_scanRunId_fkey" FOREIGN KEY ("scanRunId") REFERENCES "vibeguard_scan_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vibeguard_pull_requests" ADD CONSTRAINT "vibeguard_pull_requests_fixPlanId_fkey" FOREIGN KEY ("fixPlanId") REFERENCES "vibeguard_fix_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."Message" ADD CONSTRAINT "Message_runId_fkey" FOREIGN KEY ("runId") REFERENCES "platform"."AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."ToolExecution" ADD CONSTRAINT "ToolExecution_runId_fkey" FOREIGN KEY ("runId") REFERENCES "platform"."AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "vibeguard_findings_scan_run_idx" RENAME TO "vibeguard_findings_scanRunId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_fix_plans_scan_run_idx" RENAME TO "vibeguard_fix_plans_scanRunId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_fix_plans_tenant_idx" RENAME TO "vibeguard_fix_plans_tenantId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_fix_plans_workspace_idx" RENAME TO "vibeguard_fix_plans_workspaceId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_pull_requests_fix_plan_idx" RENAME TO "vibeguard_pull_requests_fixPlanId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_repo_connections_tenant_idx" RENAME TO "vibeguard_repo_connections_tenantId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_repo_connections_tenant_workspace_idx" RENAME TO "vibeguard_repo_connections_tenantId_workspaceId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_repo_connections_workspace_idx" RENAME TO "vibeguard_repo_connections_workspaceId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_scan_runs_repo_connection_idx" RENAME TO "vibeguard_scan_runs_repoConnectionId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_scan_runs_tenant_idx" RENAME TO "vibeguard_scan_runs_tenantId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_scan_runs_tenant_workspace_idx" RENAME TO "vibeguard_scan_runs_tenantId_workspaceId_idx";

-- RenameIndex
ALTER INDEX "vibeguard_scan_runs_workspace_idx" RENAME TO "vibeguard_scan_runs_workspaceId_idx";
