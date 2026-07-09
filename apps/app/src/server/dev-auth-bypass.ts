export type DevAuthBypassScope = "specgate" | "corely";

const configByScope: Record<
  DevAuthBypassScope,
  { enabledFlag: string; tenantFlag: string; userFlag?: string; workspaceFlag?: string }
> = {
  specgate: {
    enabledFlag: "SPECGATE_DEV_AUTH_BYPASS",
    tenantFlag: "SPECGATE_DEV_TENANT_ID",
    userFlag: "SPECGATE_DEV_USER_ID",
  },
  corely: {
    enabledFlag: "CORELY_DEV_AUTH_BYPASS",
    tenantFlag: "CORELY_DEV_TENANT_ID",
    workspaceFlag: "CORELY_DEV_WORKSPACE_ID",
  },
};

export function isDevAuthBypassEnabled(scope: DevAuthBypassScope): boolean {
  // Local development and E2E can opt into header-based auth context explicitly.
  // NODE_ENV=production always disables this path, even if an env flag is set.
  return process.env.NODE_ENV !== "production" && process.env[configByScope[scope].enabledFlag] === "true";
}

export function getDevAuthBypassConfig(scope: DevAuthBypassScope) {
  return configByScope[scope];
}
