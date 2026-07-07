-- CreateEnum
CREATE TYPE "PackInstallStatus" AS ENUM ('PENDING', 'RUNNING', 'FAILED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MenuScope" AS ENUM ('WEB', 'POS');

-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('HOST', 'TENANT');

-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'MONEY');

-- CreateEnum
CREATE TYPE "WorkspaceMembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'ACCOUNTANT', 'VIEWER');

-- CreateEnum
CREATE TYPE "WorkspaceMembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "WorkspaceInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WorkspaceOnboardingStatus" AS ENUM ('NEW', 'PROFILE', 'DONE');

-- CreateEnum
CREATE TYPE "BillingProviderKind" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "BillingSubscriptionStatus" AS ENUM ('FREE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'UNPAID');

-- CreateEnum
CREATE TYPE "BillingTrialStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUPERSEDED_BY_SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "BillingProviderEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "SpecGateEngineeringContextStatus" AS ENUM ('DRAFT', 'APPROVED', 'STALE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SpecGateContextRuleCategory" AS ENUM ('ARCHITECTURE', 'FRONTEND', 'BACKEND', 'DATABASE', 'API', 'STORAGE', 'AUTH', 'TESTING', 'SECURITY', 'UI', 'AGENT', 'RELEASE', 'DOCUMENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecGateContextRuleScopeType" AS ENUM ('GLOBAL', 'PATH', 'MODULE', 'SPEC_AREA');

-- CreateEnum
CREATE TYPE "SpecGateContextRuleSeverity" AS ENUM ('GUIDANCE', 'REQUIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "SpecGateAdrStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'SUPERSEDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SpecGateValidationCommandType" AS ENUM ('INSTALL', 'DEV', 'LINT', 'TYPECHECK', 'TEST', 'BUILD', 'E2E', 'DB_MIGRATION', 'SEED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SpecGateAgentExportKind" AS ENUM ('CANONICAL', 'TOOL_SPECIFIC', 'RULE', 'WORKFLOW', 'SKILL', 'TASK_CONTEXT');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ExtKv" (
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
CREATE TABLE "ExtEntityAttr" (
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
CREATE TABLE "ExtEntityLink" (
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
CREATE TABLE "AppCatalog" (
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
CREATE TABLE "TenantAppInstall" (
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
CREATE TABLE "TenantFeatureOverride" (
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
CREATE TABLE "TemplateCatalog" (
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
CREATE TABLE "TenantTemplateInstall" (
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
CREATE TABLE "PackCatalog" (
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
CREATE TABLE "TenantPackInstall" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "PackInstallStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "TenantMenuOverride" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "scope" "MenuScope" NOT NULL,
    "overrides_json" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TenantMenuOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeededRecordMeta" (
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
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "partyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "scope" "RoleScope" NOT NULL DEFAULT 'TENANT',
    "systemKey" TEXT,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RolePermissionGrant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "roleId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "RolePermissionGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
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
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalOtpCode" (
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
CREATE TABLE "PortalSession" (
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
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "CustomFieldType" NOT NULL,
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
CREATE TABLE "CustomFieldIndex" (
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
CREATE TABLE "EntityLayout" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DimensionType" (
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
CREATE TABLE "DimensionValue" (
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
CREATE TABLE "EntityDimension" (
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
CREATE TABLE "LegalEntity" (
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
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "publicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "publicModules" JSONB,
    "onboardingStatus" "WorkspaceOnboardingStatus" NOT NULL DEFAULT 'NEW',
    "onboardingCompletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceDomain" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceMembershipRole" NOT NULL,
    "status" "WorkspaceMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceInvite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkspaceMembershipRole" NOT NULL,
    "status" "WorkspaceInviteStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" "BillingProviderKind",
    "providerCustomerRef" TEXT,
    "billingCurrency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "email" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BillingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "provider" "BillingProviderKind",
    "providerSubscriptionRef" TEXT,
    "providerPriceRef" TEXT,
    "status" "BillingSubscriptionStatus" NOT NULL DEFAULT 'FREE',
    "currentPeriodStart" TIMESTAMPTZ(6),
    "currentPeriodEnd" TIMESTAMPTZ(6),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMPTZ(6),
    "trialEndsAt" TIMESTAMPTZ(6),
    "rawSnapshotJson" JSONB,
    "lastSyncedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingTrial" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "status" "BillingTrialStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "expiredAt" TIMESTAMPTZ(6),
    "supersededAt" TIMESTAMPTZ(6),
    "activatedByUserId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BillingTrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingUsageCounter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "periodStart" TIMESTAMPTZ(6) NOT NULL,
    "periodEnd" TIMESTAMPTZ(6) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BillingUsageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProviderEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "provider" "BillingProviderKind" NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" "BillingProviderEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BillingProviderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
CREATE TABLE "AgentRun" (
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
CREATE TABLE "Message" (
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
CREATE TABLE "ToolExecution" (
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

-- CreateTable
CREATE TABLE "specgate_projects" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "gitProvider" TEXT,
    "gitRepoUrl" TEXT,
    "gitDefaultBranch" TEXT,
    "requirementsPath" TEXT,
    "assetsPath" TEXT,
    "agentContextPath" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_specs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'feature',
    "summary" TEXT,
    "audience" TEXT,
    "description" TEXT,
    "background" TEXT,
    "currentBehavior" TEXT,
    "desiredOutcome" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "agentReadiness" TEXT NOT NULL DEFAULT 'needs_clarification',
    "roadmapLane" TEXT NOT NULL,
    "targetMilestoneId" TEXT,
    "buildCycleId" TEXT,
    "ownerId" TEXT,
    "requiresCodeChanges" TEXT NOT NULL DEFAULT 'unknown',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "assigneeId" TEXT,
    "approvedVersionId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMPTZ(6),
    "acceptedBy" TEXT,
    "acceptedAt" TIMESTAMPTZ(6),
    "doneAt" TIMESTAMPTZ(6),
    "acceptanceCriteriaJson" JSONB,
    "outOfScopeJson" JSONB,
    "openQuestionsJson" JSONB,
    "relatedFilesJson" JSONB,
    "agentTargetsJson" JSONB,
    "edgeCasesJson" JSONB,
    "securityNotes" TEXT,
    "suggestedSearchTermsJson" JSONB,
    "verificationPlanJson" JSONB,
    "technicalNotes" TEXT,
    "uiNotes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_spec_versions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "summarySnapshot" TEXT,
    "markdownSnapshot" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "changeSummary" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_spec_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_comments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sectionReference" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedBy" TEXT,

    CONSTRAINT "specgate_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_decisions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "decidedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "specgate_milestones" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_build_cycles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMPTZ(6),
    "endDate" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_build_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_build_queue_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "priorityRank" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "buildCycleId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_build_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_agent_contexts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "targetAgent" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "contextJson" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_agent_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_git_sync_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "fakeCommitSha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_git_sync_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_spec_code_checks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mismatchFindingsJson" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_spec_code_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_implementation_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "branchName" TEXT,
    "pullRequestUrl" TEXT,
    "developerId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_implementation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_developer_reviews" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_developer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_preview_reviews" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "previewUrl" TEXT,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "feedback" TEXT,
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_preview_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_preview_checklists" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "itemsJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_preview_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_activities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specId" TEXT,
    "actorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specgate_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_engineering_contexts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "SpecGateEngineeringContextStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "projectSummaryMarkdown" TEXT,
    "architectureMarkdown" TEXT,
    "codingConventionsMarkdown" TEXT,
    "testingStrategyMarkdown" TEXT,
    "securityRulesMarkdown" TEXT,
    "validationNotesMarkdown" TEXT,
    "approvedAt" TIMESTAMPTZ(6),
    "approvedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_engineering_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_project_context_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SpecGateContextRuleCategory" NOT NULL,
    "scopeType" "SpecGateContextRuleScopeType" NOT NULL DEFAULT 'GLOBAL',
    "pathGlob" TEXT,
    "moduleName" TEXT,
    "severity" "SpecGateContextRuleSeverity" NOT NULL DEFAULT 'GUIDANCE',
    "contentMarkdown" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "targetAgentIds" TEXT[],
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_project_context_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_project_adrs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "SpecGateAdrStatus" NOT NULL DEFAULT 'PROPOSED',
    "contextMarkdown" TEXT NOT NULL,
    "decisionMarkdown" TEXT NOT NULL,
    "alternativesMarkdown" TEXT,
    "consequencesMarkdown" TEXT,
    "supersedesAdrId" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "decidedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_project_adrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_project_validation_commands" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "commandType" "SpecGateValidationCommandType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specgate_project_validation_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specgate_project_agent_exports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "targetAgentId" TEXT NOT NULL,
    "exportKind" "SpecGateAgentExportKind" NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentMarkdown" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "generatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "copiedAt" TIMESTAMPTZ(6),
    "syncedAt" TIMESTAMPTZ(6),
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "specgate_project_agent_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedBy" TEXT,
    "lockedUntil" TIMESTAMP(3),
    "lastError" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "actionKey" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT,
    "requestHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "responseJson" TEXT,
    "responseStatus" INTEGER,
    "statusCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtKv_tenantId_moduleId_idx" ON "ExtKv"("tenantId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtKv_tenantId_moduleId_scope_key_key" ON "ExtKv"("tenantId", "moduleId", "scope", "key");

-- CreateIndex
CREATE INDEX "ExtEntityAttr_tenantId_entityType_entityId_idx" ON "ExtEntityAttr"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ExtEntityAttr_tenantId_moduleId_idx" ON "ExtEntityAttr"("tenantId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtEntityAttr_tenantId_moduleId_entityType_entityId_attrKey_key" ON "ExtEntityAttr"("tenantId", "moduleId", "entityType", "entityId", "attrKey");

-- CreateIndex
CREATE INDEX "ExtEntityLink_tenantId_fromEntityType_fromEntityId_idx" ON "ExtEntityLink"("tenantId", "fromEntityType", "fromEntityId");

-- CreateIndex
CREATE INDEX "ExtEntityLink_tenantId_toEntityType_toEntityId_idx" ON "ExtEntityLink"("tenantId", "toEntityType", "toEntityId");

-- CreateIndex
CREATE INDEX "ExtEntityLink_tenantId_moduleId_linkType_idx" ON "ExtEntityLink"("tenantId", "moduleId", "linkType");

-- CreateIndex
CREATE UNIQUE INDEX "ExtEntityLink_tenantId_moduleId_fromEntityType_fromEntityId_key" ON "ExtEntityLink"("tenantId", "moduleId", "fromEntityType", "fromEntityId", "toEntityType", "toEntityId", "linkType");

-- CreateIndex
CREATE INDEX "AppCatalog_tier_idx" ON "AppCatalog"("tier");

-- CreateIndex
CREATE INDEX "AppCatalog_updatedAt_idx" ON "AppCatalog"("updatedAt");

-- CreateIndex
CREATE INDEX "TenantAppInstall_tenant_id_enabled_idx" ON "TenantAppInstall"("tenant_id", "enabled");

-- CreateIndex
CREATE INDEX "TenantAppInstall_tenant_id_created_at_idx" ON "TenantAppInstall"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAppInstall_tenant_id_app_id_key" ON "TenantAppInstall"("tenant_id", "app_id");

-- CreateIndex
CREATE INDEX "TenantFeatureOverride_tenant_id_idx" ON "TenantFeatureOverride"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantFeatureOverride_tenant_id_feature_key_key" ON "TenantFeatureOverride"("tenant_id", "feature_key");

-- CreateIndex
CREATE INDEX "TemplateCatalog_category_idx" ON "TemplateCatalog"("category");

-- CreateIndex
CREATE INDEX "TemplateCatalog_updated_at_idx" ON "TemplateCatalog"("updated_at");

-- CreateIndex
CREATE INDEX "TenantTemplateInstall_tenant_id_created_at_idx" ON "TenantTemplateInstall"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TenantTemplateInstall_tenant_id_template_id_key" ON "TenantTemplateInstall"("tenant_id", "template_id");

-- CreateIndex
CREATE INDEX "PackCatalog_updated_at_idx" ON "PackCatalog"("updated_at");

-- CreateIndex
CREATE INDEX "TenantPackInstall_tenant_id_status_idx" ON "TenantPackInstall"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "TenantPackInstall_tenant_id_created_at_idx" ON "TenantPackInstall"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPackInstall_tenant_id_pack_id_version_key" ON "TenantPackInstall"("tenant_id", "pack_id", "version");

-- CreateIndex
CREATE INDEX "TenantMenuOverride_tenant_id_idx" ON "TenantMenuOverride"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMenuOverride_tenant_id_scope_key" ON "TenantMenuOverride"("tenant_id", "scope");

-- CreateIndex
CREATE INDEX "SeededRecordMeta_tenant_id_source_template_id_idx" ON "SeededRecordMeta"("tenant_id", "source_template_id");

-- CreateIndex
CREATE INDEX "SeededRecordMeta_tenant_id_target_table_is_customized_idx" ON "SeededRecordMeta"("tenant_id", "target_table", "is_customized");

-- CreateIndex
CREATE UNIQUE INDEX "SeededRecordMeta_tenant_id_target_table_target_id_key" ON "SeededRecordMeta"("tenant_id", "target_table", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_createdAt_idx" ON "Tenant"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_partyId_idx" ON "User"("partyId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_idx" ON "Membership"("tenantId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_roleId_idx" ON "Membership"("roleId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_createdAt_idx" ON "Membership"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_tenantId_userId_key" ON "Membership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_tenantId_systemKey_idx" ON "Role"("tenantId", "systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_systemKey_key" ON "Role"("tenantId", "systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "Role"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Permission_key_idx" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "RolePermissionGrant_tenantId_roleId_idx" ON "RolePermissionGrant"("tenantId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermissionGrant_permissionKey_idx" ON "RolePermissionGrant"("permissionKey");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissionGrant_tenantId_roleId_permissionKey_key" ON "RolePermissionGrant"("tenantId", "roleId", "permissionKey");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tenantId_idx" ON "RefreshToken"("tenantId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "PasswordResetToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PortalOtpCode_tenantId_workspaceId_emailNormalized_idx" ON "PortalOtpCode"("tenantId", "workspaceId", "emailNormalized");

-- CreateIndex
CREATE INDEX "PortalOtpCode_tenantId_workspaceId_emailNormalized_expiresA_idx" ON "PortalOtpCode"("tenantId", "workspaceId", "emailNormalized", "expiresAt");

-- CreateIndex
CREATE INDEX "PortalOtpCode_expiresAt_idx" ON "PortalOtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "PortalSession_tenantId_workspaceId_userId_idx" ON "PortalSession"("tenantId", "workspaceId", "userId");

-- CreateIndex
CREATE INDEX "PortalSession_refreshTokenHash_idx" ON "PortalSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "PortalSession_expiresAt_idx" ON "PortalSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_tenantId_name_key" ON "ApiKey"("tenantId", "name");

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_tenantId_entityType_idx" ON "CustomFieldDefinition"("tenantId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDefinition_tenantId_entityType_key_key" ON "CustomFieldDefinition"("tenantId", "entityType", "key");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_fieldId_idx" ON "CustomFieldIndex"("tenantId", "entityType", "fieldId");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_fieldKey_idx" ON "CustomFieldIndex"("tenantId", "entityType", "fieldKey");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueText_idx" ON "CustomFieldIndex"("tenantId", "entityType", "valueText");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueNumber_idx" ON "CustomFieldIndex"("tenantId", "entityType", "valueNumber");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueDate_idx" ON "CustomFieldIndex"("tenantId", "entityType", "valueDate");

-- CreateIndex
CREATE INDEX "CustomFieldIndex_tenantId_entityType_valueBool_idx" ON "CustomFieldIndex"("tenantId", "entityType", "valueBool");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldIndex_tenantId_entityType_entityId_fieldId_key" ON "CustomFieldIndex"("tenantId", "entityType", "entityId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityLayout_tenantId_entityType_key" ON "EntityLayout"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "DimensionType_tenantId_isActive_sortOrder_idx" ON "DimensionType"("tenantId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionType_tenantId_code_key" ON "DimensionType"("tenantId", "code");

-- CreateIndex
CREATE INDEX "DimensionValue_tenantId_typeId_isActive_sortOrder_idx" ON "DimensionValue"("tenantId", "typeId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionValue_tenantId_typeId_code_key" ON "DimensionValue"("tenantId", "typeId", "code");

-- CreateIndex
CREATE INDEX "EntityDimension_tenantId_entityType_entityId_idx" ON "EntityDimension"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityDimension_tenantId_entityType_typeId_valueId_idx" ON "EntityDimension"("tenantId", "entityType", "typeId", "valueId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityDimension_tenantId_entityType_entityId_typeId_valueId_key" ON "EntityDimension"("tenantId", "entityType", "entityId", "typeId", "valueId");

-- CreateIndex
CREATE INDEX "LegalEntity_tenantId_idx" ON "LegalEntity"("tenantId");

-- CreateIndex
CREATE INDEX "LegalEntity_tenantId_kind_idx" ON "LegalEntity"("tenantId", "kind");

-- CreateIndex
CREATE INDEX "LegalEntity_tenantId_createdAt_idx" ON "LegalEntity"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_idx" ON "Workspace"("tenantId");

-- CreateIndex
CREATE INDEX "Workspace_legalEntityId_idx" ON "Workspace"("legalEntityId");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_createdAt_idx" ON "Workspace"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_onboardingStatus_idx" ON "Workspace"("tenantId", "onboardingStatus");

-- CreateIndex
CREATE INDEX "Workspace_deletedAt_idx" ON "Workspace"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_tenantId_name_key" ON "Workspace"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceDomain_domain_key" ON "WorkspaceDomain"("domain");

-- CreateIndex
CREATE INDEX "WorkspaceDomain_workspaceId_idx" ON "WorkspaceDomain"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_idx" ON "WorkspaceMembership"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_userId_idx" ON "WorkspaceMembership"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_status_idx" ON "WorkspaceMembership"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_userId_status_idx" ON "WorkspaceMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_workspaceId_userId_key" ON "WorkspaceMembership"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvite_token_key" ON "WorkspaceInvite"("token");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_idx" ON "WorkspaceInvite"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "WorkspaceInvite"("email");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_token_idx" ON "WorkspaceInvite"("token");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_status_expiresAt_idx" ON "WorkspaceInvite"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_status_idx" ON "WorkspaceInvite"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BillingAccount_tenantId_key" ON "BillingAccount"("tenantId");

-- CreateIndex
CREATE INDEX "BillingAccount_provider_providerCustomerRef_idx" ON "BillingAccount"("provider", "providerCustomerRef");

-- CreateIndex
CREATE INDEX "BillingSubscription_accountId_idx" ON "BillingSubscription"("accountId");

-- CreateIndex
CREATE INDEX "BillingSubscription_tenantId_productKey_status_idx" ON "BillingSubscription"("tenantId", "productKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BillingSubscription_tenantId_productKey_key" ON "BillingSubscription"("tenantId", "productKey");

-- CreateIndex
CREATE UNIQUE INDEX "BillingSubscription_provider_providerSubscriptionRef_key" ON "BillingSubscription"("provider", "providerSubscriptionRef");

-- CreateIndex
CREATE INDEX "BillingTrial_status_endsAt_idx" ON "BillingTrial"("status", "endsAt");

-- CreateIndex
CREATE INDEX "BillingTrial_accountId_idx" ON "BillingTrial"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingTrial_tenantId_productKey_key" ON "BillingTrial"("tenantId", "productKey");

-- CreateIndex
CREATE INDEX "BillingUsageCounter_tenantId_productKey_metricKey_idx" ON "BillingUsageCounter"("tenantId", "productKey", "metricKey");

-- CreateIndex
CREATE UNIQUE INDEX "BillingUsageCounter_tenantId_productKey_metricKey_periodSta_key" ON "BillingUsageCounter"("tenantId", "productKey", "metricKey", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "BillingProviderEvent_tenantId_createdAt_idx" ON "BillingProviderEvent"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingProviderEvent_accountId_idx" ON "BillingProviderEvent"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderEvent_provider_externalEventId_key" ON "BillingProviderEvent"("provider", "externalEventId");

-- CreateIndex
CREATE INDEX "IntegrationConnection_tenantId_workspaceId_idx" ON "IntegrationConnection"("tenantId", "workspaceId");

-- CreateIndex
CREATE INDEX "IntegrationConnection_tenantId_providerKey_status_idx" ON "IntegrationConnection"("tenantId", "providerKey", "status");

-- CreateIndex
CREATE INDEX "IntegrationConnection_workspaceId_providerKey_status_idx" ON "IntegrationConnection"("workspaceId", "providerKey", "status");

-- CreateIndex
CREATE INDEX "todos_tenantId_idx" ON "todos"("tenantId");

-- CreateIndex
CREATE INDEX "todos_workspaceId_idx" ON "todos"("workspaceId");

-- CreateIndex
CREATE INDEX "todos_tenantId_status_idx" ON "todos"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdAt_idx" ON "AgentRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdByUserId_lastMessageAt_idx" ON "AgentRun"("tenantId", "createdByUserId", "lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdByUserId_createdAt_idx" ON "AgentRun"("tenantId", "createdByUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_tenantId_runId_createdAt_idx" ON "Message"("tenantId", "runId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_tenantId_createdAt_idx" ON "Message"("tenantId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ToolExecution_tenantId_runId_toolCallId_key" ON "ToolExecution"("tenantId", "runId", "toolCallId");

-- CreateIndex
CREATE INDEX "specgate_projects_tenantId_idx" ON "specgate_projects"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_projects_workspaceId_idx" ON "specgate_projects"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_projects_tenantId_slug_key" ON "specgate_projects"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "specgate_specs_tenantId_idx" ON "specgate_specs"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_specs_tenantId_projectId_idx" ON "specgate_specs"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_specs_tenantId_status_idx" ON "specgate_specs"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_specs_tenantId_roadmapLane_idx" ON "specgate_specs"("tenantId", "roadmapLane");

-- CreateIndex
CREATE INDEX "specgate_specs_tenantId_buildCycleId_idx" ON "specgate_specs"("tenantId", "buildCycleId");

-- CreateIndex
CREATE INDEX "specgate_specs_tenantId_targetMilestoneId_idx" ON "specgate_specs"("tenantId", "targetMilestoneId");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_specs_tenantId_projectId_specNumber_key" ON "specgate_specs"("tenantId", "projectId", "specNumber");

-- CreateIndex
CREATE INDEX "specgate_spec_versions_tenantId_idx" ON "specgate_spec_versions"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_spec_versions_tenantId_specId_idx" ON "specgate_spec_versions"("tenantId", "specId");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_spec_versions_tenantId_specId_versionNumber_key" ON "specgate_spec_versions"("tenantId", "specId", "versionNumber");

-- CreateIndex
CREATE INDEX "specgate_comments_tenantId_idx" ON "specgate_comments"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_comments_tenantId_specId_idx" ON "specgate_comments"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_comments_tenantId_status_idx" ON "specgate_comments"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_decisions_tenantId_idx" ON "specgate_decisions"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_decisions_tenantId_specId_idx" ON "specgate_decisions"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_spec_assets_tenantId_idx" ON "specgate_spec_assets"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_spec_assets_tenantId_projectId_idx" ON "specgate_spec_assets"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_spec_assets_tenantId_specId_idx" ON "specgate_spec_assets"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_milestones_tenantId_idx" ON "specgate_milestones"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_milestones_tenantId_projectId_idx" ON "specgate_milestones"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_milestones_tenantId_status_idx" ON "specgate_milestones"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_build_cycles_tenantId_idx" ON "specgate_build_cycles"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_build_cycles_tenantId_projectId_idx" ON "specgate_build_cycles"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_build_cycles_tenantId_status_idx" ON "specgate_build_cycles"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_build_queue_items_tenantId_idx" ON "specgate_build_queue_items"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_build_queue_items_tenantId_projectId_idx" ON "specgate_build_queue_items"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_build_queue_items_tenantId_buildCycleId_idx" ON "specgate_build_queue_items"("tenantId", "buildCycleId");

-- CreateIndex
CREATE INDEX "specgate_build_queue_items_tenantId_specId_idx" ON "specgate_build_queue_items"("tenantId", "specId");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_build_queue_items_tenantId_specId_key" ON "specgate_build_queue_items"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_agent_contexts_tenantId_idx" ON "specgate_agent_contexts"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_agent_contexts_tenantId_projectId_idx" ON "specgate_agent_contexts"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_agent_contexts_tenantId_specId_idx" ON "specgate_agent_contexts"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_agent_contexts_tenantId_specId_createdAt_idx" ON "specgate_agent_contexts"("tenantId", "specId", "createdAt");

-- CreateIndex
CREATE INDEX "specgate_git_sync_records_tenantId_idx" ON "specgate_git_sync_records"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_git_sync_records_tenantId_projectId_idx" ON "specgate_git_sync_records"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_git_sync_records_tenantId_specId_idx" ON "specgate_git_sync_records"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_git_sync_records_tenantId_specId_createdAt_idx" ON "specgate_git_sync_records"("tenantId", "specId", "createdAt");

-- CreateIndex
CREATE INDEX "specgate_spec_code_checks_tenantId_idx" ON "specgate_spec_code_checks"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_spec_code_checks_tenantId_projectId_idx" ON "specgate_spec_code_checks"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_spec_code_checks_tenantId_specId_idx" ON "specgate_spec_code_checks"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_spec_code_checks_tenantId_specId_createdAt_idx" ON "specgate_spec_code_checks"("tenantId", "specId", "createdAt");

-- CreateIndex
CREATE INDEX "specgate_implementation_records_tenantId_idx" ON "specgate_implementation_records"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_implementation_records_tenantId_projectId_idx" ON "specgate_implementation_records"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_implementation_records_tenantId_developerId_idx" ON "specgate_implementation_records"("tenantId", "developerId");

-- CreateIndex
CREATE INDEX "specgate_implementation_records_tenantId_status_idx" ON "specgate_implementation_records"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_implementation_records_tenantId_specId_key" ON "specgate_implementation_records"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_developer_reviews_tenantId_idx" ON "specgate_developer_reviews"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_developer_reviews_tenantId_projectId_idx" ON "specgate_developer_reviews"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_developer_reviews_tenantId_specId_idx" ON "specgate_developer_reviews"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_developer_reviews_tenantId_reviewerId_idx" ON "specgate_developer_reviews"("tenantId", "reviewerId");

-- CreateIndex
CREATE INDEX "specgate_developer_reviews_tenantId_status_idx" ON "specgate_developer_reviews"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_preview_reviews_tenantId_idx" ON "specgate_preview_reviews"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_preview_reviews_tenantId_projectId_idx" ON "specgate_preview_reviews"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_preview_reviews_tenantId_specId_idx" ON "specgate_preview_reviews"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_preview_reviews_tenantId_status_idx" ON "specgate_preview_reviews"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_preview_checklists_tenantId_idx" ON "specgate_preview_checklists"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_preview_checklists_tenantId_projectId_idx" ON "specgate_preview_checklists"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_preview_checklists_tenantId_specId_idx" ON "specgate_preview_checklists"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_activities_tenantId_idx" ON "specgate_activities"("tenantId");

-- CreateIndex
CREATE INDEX "specgate_activities_tenantId_projectId_idx" ON "specgate_activities"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_activities_tenantId_specId_idx" ON "specgate_activities"("tenantId", "specId");

-- CreateIndex
CREATE INDEX "specgate_activities_tenantId_type_idx" ON "specgate_activities"("tenantId", "type");

-- CreateIndex
CREATE INDEX "specgate_activities_tenantId_createdAt_idx" ON "specgate_activities"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "specgate_engineering_contexts_tenantId_projectId_idx" ON "specgate_engineering_contexts"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_engineering_contexts_tenantId_status_idx" ON "specgate_engineering_contexts"("tenantId", "status");

-- CreateIndex
CREATE INDEX "specgate_project_context_rules_tenantId_projectId_idx" ON "specgate_project_context_rules"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_project_context_rules_tenantId_contextId_idx" ON "specgate_project_context_rules"("tenantId", "contextId");

-- CreateIndex
CREATE INDEX "specgate_project_context_rules_tenantId_category_idx" ON "specgate_project_context_rules"("tenantId", "category");

-- CreateIndex
CREATE INDEX "specgate_project_adrs_tenantId_projectId_idx" ON "specgate_project_adrs"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_project_adrs_tenantId_status_idx" ON "specgate_project_adrs"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_project_adrs_tenantId_projectId_number_key" ON "specgate_project_adrs"("tenantId", "projectId", "number");

-- CreateIndex
CREATE INDEX "specgate_project_validation_commands_tenantId_projectId_idx" ON "specgate_project_validation_commands"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_project_validation_commands_tenantId_contextId_idx" ON "specgate_project_validation_commands"("tenantId", "contextId");

-- CreateIndex
CREATE INDEX "specgate_project_agent_exports_tenantId_projectId_idx" ON "specgate_project_agent_exports"("tenantId", "projectId");

-- CreateIndex
CREATE INDEX "specgate_project_agent_exports_tenantId_targetAgentId_idx" ON "specgate_project_agent_exports"("tenantId", "targetAgentId");

-- CreateIndex
CREATE UNIQUE INDEX "specgate_project_agent_exports_tenantId_projectId_targetAge_key" ON "specgate_project_agent_exports"("tenantId", "projectId", "targetAgentId", "filePath");

-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_availableAt_idx" ON "OutboxEvent"("tenantId", "status", "availableAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_availableAt_lockedUntil_createdAt_idx" ON "OutboxEvent"("status", "availableAt", "lockedUntil", "createdAt");

-- CreateIndex
CREATE INDEX "DomainEvent_tenantId_eventType_idx" ON "DomainEvent"("tenantId", "eventType");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entity_entityId_idx" ON "AuditLog"("tenantId", "entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "IdempotencyKey_tenantId_actionKey_idx" ON "IdempotencyKey"("tenantId", "actionKey");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_tenantId_actionKey_key_key" ON "IdempotencyKey"("tenantId", "actionKey", "key");

-- AddForeignKey
ALTER TABLE "TenantAppInstall" ADD CONSTRAINT "TenantAppInstall_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantFeatureOverride" ADD CONSTRAINT "TenantFeatureOverride_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplateInstall" ADD CONSTRAINT "TenantTemplateInstall_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPackInstall" ADD CONSTRAINT "TenantPackInstall_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMenuOverride" ADD CONSTRAINT "TenantMenuOverride_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeededRecordMeta" ADD CONSTRAINT "SeededRecordMeta_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissionGrant" ADD CONSTRAINT "RolePermissionGrant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissionGrant" ADD CONSTRAINT "RolePermissionGrant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissionGrant" ADD CONSTRAINT "RolePermissionGrant_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionValue" ADD CONSTRAINT "DimensionValue_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DimensionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityDimension" ADD CONSTRAINT "EntityDimension_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DimensionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityDimension" ADD CONSTRAINT "EntityDimension_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "DimensionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalEntity" ADD CONSTRAINT "LegalEntity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDomain" ADD CONSTRAINT "WorkspaceDomain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAccount" ADD CONSTRAINT "BillingAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingTrial" ADD CONSTRAINT "BillingTrial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingTrial" ADD CONSTRAINT "BillingTrial_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingUsageCounter" ADD CONSTRAINT "BillingUsageCounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderEvent" ADD CONSTRAINT "BillingProviderEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderEvent" ADD CONSTRAINT "BillingProviderEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolExecution" ADD CONSTRAINT "ToolExecution_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_projects" ADD CONSTRAINT "specgate_projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_specs" ADD CONSTRAINT "specgate_specs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "specgate_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_spec_versions" ADD CONSTRAINT "specgate_spec_versions_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_comments" ADD CONSTRAINT "specgate_comments_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_decisions" ADD CONSTRAINT "specgate_decisions_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_spec_assets" ADD CONSTRAINT "specgate_spec_assets_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_engineering_contexts" ADD CONSTRAINT "specgate_engineering_contexts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "specgate_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_project_context_rules" ADD CONSTRAINT "specgate_project_context_rules_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "specgate_engineering_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_project_adrs" ADD CONSTRAINT "specgate_project_adrs_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "specgate_engineering_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_project_validation_commands" ADD CONSTRAINT "specgate_project_validation_commands_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "specgate_engineering_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_project_agent_exports" ADD CONSTRAINT "specgate_project_agent_exports_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "specgate_engineering_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
