-- CreateTable
CREATE TABLE "specgate_projects" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
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
    "summary" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "roadmapLane" TEXT NOT NULL,
    "targetMilestoneId" TEXT,
    "buildCycleId" TEXT,
    "ownerId" TEXT,
    "assigneeId" TEXT,
    "approvedVersionId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMPTZ(6),
    "acceptedBy" TEXT,
    "acceptedAt" TIMESTAMPTZ(6),
    "doneAt" TIMESTAMPTZ(6),
    "acceptanceCriteriaJson" JSONB,
    "outOfScopeJson" JSONB,
    "relatedFilesJson" JSONB,
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

-- CreateIndex
CREATE INDEX "specgate_projects_tenantId_idx" ON "specgate_projects"("tenantId");

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

-- AddForeignKey
ALTER TABLE "specgate_specs" ADD CONSTRAINT "specgate_specs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "specgate_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_spec_versions" ADD CONSTRAINT "specgate_spec_versions_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_comments" ADD CONSTRAINT "specgate_comments_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specgate_decisions" ADD CONSTRAINT "specgate_decisions_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specgate_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "BillingUsageCounter_tenantId_productKey_metricKey_periodStart_p" RENAME TO "BillingUsageCounter_tenantId_productKey_metricKey_periodSta_key";
