-- Move all Prisma-managed enums into the public schema.
ALTER TYPE "identity"."RoleScope" SET SCHEMA "public";
ALTER TYPE "identity"."PermissionEffect" SET SCHEMA "public";
ALTER TYPE "platform"."PackInstallStatus" SET SCHEMA "public";
ALTER TYPE "platform"."MenuScope" SET SCHEMA "public";
ALTER TYPE "platform"."CustomFieldType" SET SCHEMA "public";
ALTER TYPE "platform"."WorkspaceMembershipRole" SET SCHEMA "public";
ALTER TYPE "platform"."WorkspaceMembershipStatus" SET SCHEMA "public";
ALTER TYPE "platform"."WorkspaceInviteStatus" SET SCHEMA "public";
ALTER TYPE "platform"."WorkspaceOnboardingStatus" SET SCHEMA "public";
ALTER TYPE "workflow"."OutboxStatus" SET SCHEMA "public";

-- Move all Prisma-managed tables into the public schema.
ALTER TABLE "ext"."ExtKv" SET SCHEMA "public";
ALTER TABLE "ext"."ExtEntityAttr" SET SCHEMA "public";
ALTER TABLE "ext"."ExtEntityLink" SET SCHEMA "public";

ALTER TABLE "platform"."AppCatalog" SET SCHEMA "public";
ALTER TABLE "platform"."TenantAppInstall" SET SCHEMA "public";
ALTER TABLE "platform"."TenantFeatureOverride" SET SCHEMA "public";
ALTER TABLE "platform"."TemplateCatalog" SET SCHEMA "public";
ALTER TABLE "platform"."TenantTemplateInstall" SET SCHEMA "public";
ALTER TABLE "platform"."PackCatalog" SET SCHEMA "public";
ALTER TABLE "platform"."TenantPackInstall" SET SCHEMA "public";
ALTER TABLE "platform"."TenantMenuOverride" SET SCHEMA "public";
ALTER TABLE "platform"."SeededRecordMeta" SET SCHEMA "public";
ALTER TABLE "platform"."CustomFieldDefinition" SET SCHEMA "public";
ALTER TABLE "platform"."CustomFieldIndex" SET SCHEMA "public";
ALTER TABLE "platform"."EntityLayout" SET SCHEMA "public";
ALTER TABLE "platform"."DimensionType" SET SCHEMA "public";
ALTER TABLE "platform"."DimensionValue" SET SCHEMA "public";
ALTER TABLE "platform"."EntityDimension" SET SCHEMA "public";
ALTER TABLE "platform"."LegalEntity" SET SCHEMA "public";
ALTER TABLE "platform"."Workspace" SET SCHEMA "public";
ALTER TABLE "platform"."WorkspaceDomain" SET SCHEMA "public";
ALTER TABLE "platform"."WorkspaceMembership" SET SCHEMA "public";
ALTER TABLE "platform"."WorkspaceInvite" SET SCHEMA "public";
ALTER TABLE "platform"."AgentRun" SET SCHEMA "public";
ALTER TABLE "platform"."Message" SET SCHEMA "public";
ALTER TABLE "platform"."ToolExecution" SET SCHEMA "public";

ALTER TABLE "identity"."Tenant" SET SCHEMA "public";
ALTER TABLE "identity"."User" SET SCHEMA "public";
ALTER TABLE "identity"."Membership" SET SCHEMA "public";
ALTER TABLE "identity"."Role" SET SCHEMA "public";
ALTER TABLE "identity"."Permission" SET SCHEMA "public";
ALTER TABLE "identity"."RolePermission" SET SCHEMA "public";
ALTER TABLE "identity"."RolePermissionGrant" SET SCHEMA "public";
ALTER TABLE "identity"."RefreshToken" SET SCHEMA "public";
ALTER TABLE "identity"."PasswordResetToken" SET SCHEMA "public";
ALTER TABLE "identity"."PortalOtpCode" SET SCHEMA "public";
ALTER TABLE "identity"."PortalSession" SET SCHEMA "public";
ALTER TABLE "identity"."ApiKey" SET SCHEMA "public";

ALTER TABLE "workflow"."OutboxEvent" SET SCHEMA "public";
ALTER TABLE "workflow"."DomainEvent" SET SCHEMA "public";
ALTER TABLE "workflow"."AuditLog" SET SCHEMA "public";
ALTER TABLE "workflow"."IdempotencyKey" SET SCHEMA "public";

DROP SCHEMA "ext";
DROP SCHEMA "platform";
DROP SCHEMA "identity";
DROP SCHEMA "workflow";
