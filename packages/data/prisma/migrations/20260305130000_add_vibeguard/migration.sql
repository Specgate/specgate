CREATE TABLE IF NOT EXISTS public.vibeguard_repo_connections (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "workspaceId" TEXT,
  provider TEXT NOT NULL,
  "repoUrl" TEXT NOT NULL,
  "defaultBranch" TEXT,
  "authRef" TEXT,
  "snapshotRef" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vibeguard_repo_connections_tenant_idx
  ON public.vibeguard_repo_connections ("tenantId");
CREATE INDEX IF NOT EXISTS vibeguard_repo_connections_workspace_idx
  ON public.vibeguard_repo_connections ("workspaceId");
CREATE INDEX IF NOT EXISTS vibeguard_repo_connections_tenant_workspace_idx
  ON public.vibeguard_repo_connections ("tenantId", "workspaceId");

CREATE TABLE IF NOT EXISTS public.vibeguard_scan_runs (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "workspaceId" TEXT,
  "repoConnectionId" TEXT,
  "targetType" TEXT NOT NULL,
  "targetRef" TEXT NOT NULL,
  status TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ(6) NOT NULL,
  "finishedAt" TIMESTAMPTZ(6),
  "securityScore" INTEGER,
  "scoreBreakdown" JSONB,
  "scoreWeightsVersion" TEXT,
  "repoIndexSummary" JSONB,
  artifacts JSONB,
  "launchBlockersCount" INTEGER NOT NULL DEFAULT 0,
  "highRiskCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT vibeguard_scan_runs_repo_connection_fk
    FOREIGN KEY ("repoConnectionId") REFERENCES public.vibeguard_repo_connections(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS vibeguard_scan_runs_tenant_idx
  ON public.vibeguard_scan_runs ("tenantId");
CREATE INDEX IF NOT EXISTS vibeguard_scan_runs_workspace_idx
  ON public.vibeguard_scan_runs ("workspaceId");
CREATE INDEX IF NOT EXISTS vibeguard_scan_runs_tenant_workspace_idx
  ON public.vibeguard_scan_runs ("tenantId", "workspaceId");
CREATE INDEX IF NOT EXISTS vibeguard_scan_runs_repo_connection_idx
  ON public.vibeguard_scan_runs ("repoConnectionId");
CREATE INDEX IF NOT EXISTS vibeguard_scan_runs_status_idx
  ON public.vibeguard_scan_runs (status);

CREATE TABLE IF NOT EXISTS public.vibeguard_findings (
  id TEXT PRIMARY KEY,
  "scanRunId" TEXT NOT NULL,
  source TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  why TEXT NOT NULL,
  abuse TEXT NOT NULL,
  fix TEXT NOT NULL,
  "ruleId" TEXT,
  "detectorId" TEXT,
  evidence JSONB NOT NULL,
  "relatedRoute" JSONB,
  "additionalSources" JSONB,
  "filePath" TEXT,
  "lineStart" INTEGER,
  "lineEnd" INTEGER,
  fingerprint TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT vibeguard_findings_scan_run_fk
    FOREIGN KEY ("scanRunId") REFERENCES public.vibeguard_scan_runs(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS vibeguard_findings_scan_run_idx
  ON public.vibeguard_findings ("scanRunId");
CREATE INDEX IF NOT EXISTS vibeguard_findings_category_idx
  ON public.vibeguard_findings (category);
CREATE INDEX IF NOT EXISTS vibeguard_findings_severity_idx
  ON public.vibeguard_findings (severity);
CREATE INDEX IF NOT EXISTS vibeguard_findings_fingerprint_idx
  ON public.vibeguard_findings (fingerprint);

CREATE TABLE IF NOT EXISTS public.vibeguard_fix_plans (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "workspaceId" TEXT,
  "scanRunId" TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  "patchPreview" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT vibeguard_fix_plans_scan_run_fk
    FOREIGN KEY ("scanRunId") REFERENCES public.vibeguard_scan_runs(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS vibeguard_fix_plans_tenant_idx
  ON public.vibeguard_fix_plans ("tenantId");
CREATE INDEX IF NOT EXISTS vibeguard_fix_plans_workspace_idx
  ON public.vibeguard_fix_plans ("workspaceId");
CREATE INDEX IF NOT EXISTS vibeguard_fix_plans_scan_run_idx
  ON public.vibeguard_fix_plans ("scanRunId");

CREATE TABLE IF NOT EXISTS public.vibeguard_pull_requests (
  id TEXT PRIMARY KEY,
  "fixPlanId" TEXT NOT NULL,
  provider TEXT NOT NULL,
  "repoUrl" TEXT NOT NULL,
  "prUrl" TEXT,
  branch TEXT,
  status TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT vibeguard_pull_requests_fix_plan_fk
    FOREIGN KEY ("fixPlanId") REFERENCES public.vibeguard_fix_plans(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS vibeguard_pull_requests_fix_plan_idx
  ON public.vibeguard_pull_requests ("fixPlanId");
CREATE INDEX IF NOT EXISTS vibeguard_pull_requests_status_idx
  ON public.vibeguard_pull_requests (status);
