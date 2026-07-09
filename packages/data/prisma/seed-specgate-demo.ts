import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";


// PBKDF2 Password Hashing Helper
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `pbkdf2_sha512$1000$${salt}$${hash}`;
}

// -------------------------------------------------------------
// TEST USER & MEMBERSHIP FIXTURES (Exported for UI/API tests)
// -------------------------------------------------------------

export const specGateDemoUsers = [
  {
    id: "u-ha",
    tenantId: "tenant_demo",
    name: "Ha",
    email: "ha@example.com",
    role: "Founder",
    avatar: "H",
    membershipRole: "admin",
    type: "admin",
    status: "active"
  },
  {
    id: "u-minh",
    tenantId: "tenant_demo",
    name: "Minh",
    email: "minh@example.com",
    role: "Product Lead",
    avatar: "M",
    membershipRole: "product_lead",
    type: "product",
    status: "active"
  },
  {
    id: "u-david",
    tenantId: "tenant_demo",
    name: "David",
    email: "david@example.com",
    role: "Developer",
    avatar: "D",
    membershipRole: "developer",
    type: "developer",
    status: "active"
  },
  {
    id: "u-anna",
    tenantId: "tenant_demo",
    name: "Anna",
    email: "anna@example.com",
    role: "Stakeholder",
    avatar: "A",
    membershipRole: "stakeholder",
    type: "stakeholder",
    status: "active"
  },
  {
    id: "u-linh",
    tenantId: "tenant_demo",
    name: "Linh",
    email: "linh@example.com",
    role: "Designer",
    avatar: "L",
    membershipRole: "stakeholder",
    type: "stakeholder",
    status: "active"
  },
  {
    id: "u-sara",
    tenantId: "tenant_demo",
    name: "Sara",
    email: "sara@example.com",
    role: "Viewer",
    avatar: "S",
    membershipRole: "viewer",
    type: "viewer",
    status: "active"
  },
  {
    id: "u-noah",
    tenantId: "tenant_demo",
    name: "Noah",
    email: "noah@example.com",
    role: "Developer",
    avatar: "N",
    membershipRole: "developer",
    type: "developer",
    status: "invited"
  },
  {
    id: "u-disabled",
    tenantId: "tenant_demo",
    name: "Disabled User",
    email: "disabled@example.com",
    role: "Former Member",
    avatar: "X",
    membershipRole: "viewer",
    type: "viewer",
    status: "disabled"
  }
];

export const specGateDemoMemberships = [
  {
    id: "membership_demo_ha",
    tenantId: "tenant_demo",
    userId: "u-ha",
    role: "admin",
    status: "active"
  },
  {
    id: "membership_demo_minh",
    tenantId: "tenant_demo",
    userId: "u-minh",
    role: "product_lead",
    status: "active"
  },
  {
    id: "membership_demo_david",
    tenantId: "tenant_demo",
    userId: "u-david",
    role: "developer",
    status: "active"
  },
  {
    id: "membership_demo_anna",
    tenantId: "tenant_demo",
    userId: "u-anna",
    role: "stakeholder",
    status: "active"
  },
  {
    id: "membership_demo_linh",
    tenantId: "tenant_demo",
    userId: "u-linh",
    role: "stakeholder",
    status: "active"
  },
  {
    id: "membership_demo_sara",
    tenantId: "tenant_demo",
    userId: "u-sara",
    role: "viewer",
    status: "active"
  },
  {
    id: "membership_demo_noah",
    tenantId: "tenant_demo",
    userId: "u-noah",
    role: "developer",
    status: "invited"
  },
  {
    id: "membership_demo_disabled",
    tenantId: "tenant_demo",
    userId: "u-disabled",
    role: "viewer",
    status: "disabled"
  }
];

export const specGateOtherTenantUsers = [
  {
    id: "u-other-admin",
    tenantId: "tenant_other",
    name: "Other Admin",
    email: "other-admin@example.com",
    role: "Admin",
    avatar: "O",
    membershipRole: "admin",
    type: "admin",
    status: "active"
  },
  {
    id: "u-other-dev",
    tenantId: "tenant_other",
    name: "Other Developer",
    email: "other-dev@example.com",
    role: "Developer",
    avatar: "D",
    membershipRole: "developer",
    type: "developer",
    status: "active"
  }
];

// -------------------------------------------------------------
// SEEDING AND RESET OPERATIONS
// -------------------------------------------------------------

export async function resetSpecGateDemo(prisma: PrismaClient): Promise<void> {
  const tenants = ["tenant_demo", "tenant_other"];

  // Delete specgate models in dependency order
  await prisma.specGateActivity.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGatePreviewChecklist.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGatePreviewReview.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateDeveloperReview.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.implementationRecord.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateSpecCodeCheck.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.gitSyncRecord.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateAgentContext.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateBuildQueueItem.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateBuildCycle.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateMilestone.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateDecision.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateComment.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateSpecVersion.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateSpec.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateProject.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.specGateDocument.deleteMany({
    where: { tenantId: { in: tenants } }
  });

  // Delete tenant users & memberships
  const seededUserIds = [
    ...specGateDemoUsers.map(u => u.id),
    ...specGateOtherTenantUsers.map(u => u.id)
  ];
  await prisma.membership.deleteMany({
    where: { userId: { in: seededUserIds } }
  });
  await prisma.role.deleteMany({
    where: { tenantId: { in: tenants } }
  });
  await prisma.user.deleteMany({
    where: { id: { in: seededUserIds } }
  });
  await prisma.tenant.deleteMany({
    where: { id: { in: tenants } }
  });
}

export async function seedSpecGateDemo(prisma: PrismaClient): Promise<void> {
  const now = new Date("2026-06-29T10:00:00.000Z");

  // 1. Seed Tenants
  await prisma.tenant.upsert({
    where: { id: "tenant_demo" },
    update: { name: "SpecGate Demo Tenant" },
    create: {
      id: "tenant_demo",
      name: "SpecGate Demo Tenant",
      slug: "tenant_demo",
      status: "ACTIVE"
    }
  });

  await prisma.tenant.upsert({
    where: { id: "tenant_other" },
    update: { name: "Other Tenant" },
    create: {
      id: "tenant_other",
      name: "Other Tenant",
      slug: "tenant_other",
      status: "ACTIVE"
    }
  });

  // 2. Seed Roles
  const rolesToSeed = [
    { id: "admin", name: "Admin", systemKey: "ADMIN", tenantId: "tenant_demo" },
    { id: "product_lead", name: "Product Lead", systemKey: "PRODUCT_LEAD", tenantId: "tenant_demo" },
    { id: "developer", name: "Developer", systemKey: "DEVELOPER", tenantId: "tenant_demo" },
    { id: "stakeholder", name: "Stakeholder", systemKey: "STAKEHOLDER", tenantId: "tenant_demo" },
    { id: "viewer", name: "Viewer", systemKey: "VIEWER", tenantId: "tenant_demo" },
    { id: "other_admin", name: "Admin", systemKey: "ADMIN", tenantId: "tenant_other" },
    { id: "other_developer", name: "Developer", systemKey: "DEVELOPER", tenantId: "tenant_other" }
  ];

  for (const r of rolesToSeed) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: { name: r.name, systemKey: r.systemKey, tenantId: r.tenantId },
      create: {
        id: r.id,
        tenantId: r.tenantId,
        name: r.name,
        scope: "TENANT",
        systemKey: r.systemKey,
        isSystem: true
      }
    });
  }

  // 3. Seed Users
  const allUsers = [...specGateDemoUsers, ...specGateOtherTenantUsers];
  const credentialHash = hashPassword("111111");

  for (const u of allUsers) {
    const isNoCredential = u.id === "u-noah" || u.id === "u-disabled";
    const statusInDb = u.status === "disabled" ? "INACTIVE" : "ACTIVE";
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, status: statusInDb },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        passwordHash: isNoCredential ? "no_credential_login_disabled" : credentialHash,
        status: statusInDb
      }
    });
  }

  // 4. Seed Memberships
  const allMemberships = [
    ...specGateDemoMemberships,
    {
      id: "membership_other_admin",
      tenantId: "tenant_other",
      userId: "u-other-admin",
      role: "other_admin",
      status: "active"
    },
    {
      id: "membership_other_dev",
      tenantId: "tenant_other",
      userId: "u-other-dev",
      role: "other_developer",
      status: "active"
    }
  ];

  for (const m of allMemberships) {
    await prisma.membership.upsert({
      where: { id: m.id },
      update: { tenantId: m.tenantId, userId: m.userId, roleId: m.role },
      create: {
        id: m.id,
        tenantId: m.tenantId,
        userId: m.userId,
        roleId: m.role
      }
    });
  }

  // 4b. Seed Default Workspaces
  await prisma.workspace.upsert({
    where: { id: "workspace_demo" },
    update: { name: "Acme Corp" },
    create: {
      id: "workspace_demo",
      tenant: { connect: { id: "tenant_demo" } },
      name: "Acme Corp",
      slug: "acme-corp",
      onboardingStatus: "DONE",
    },
  });
  await prisma.workspace.upsert({
    where: { id: "workspace_other" },
    update: { name: "Other Corp" },
    create: {
      id: "workspace_other",
      tenant: { connect: { id: "tenant_other" } },
      name: "Other Corp",
      slug: "other-corp",
      onboardingStatus: "DONE",
    },
  });

  // 5. Seed Projects
  const projects = [
    {
      id: "project_launchos",
      tenantId: "tenant_demo",
      workspaceId: "workspace_demo",
      name: "LaunchOS",
      slug: "launchos",
      description: "A SaaS workspace for managing product launches, assets, audience, positioning, and outreach.",
      gitProvider: "github",
      gitRepoUrl: "github.com/acme/launchos",
      gitDefaultBranch: "main",
      requirementsPath: "/docs/requirements",
      assetsPath: "/docs/assets/requirements",
      agentContextPath: "/docs/agent-context"
    },
    {
      id: "project_talelingo",
      tenantId: "tenant_demo",
      workspaceId: "workspace_demo",
      name: "TaleLingo",
      slug: "talelingo",
      description: "A language learning product for Vietnamese adults learning German from A1 to C1.",
      gitProvider: "github",
      gitRepoUrl: "github.com/acme/talelingo",
      gitDefaultBranch: "main",
      requirementsPath: "/docs/requirements",
      assetsPath: "/docs/assets/requirements",
      agentContextPath: "/docs/agent-context"
    },
    {
      id: "project_corelynext",
      tenantId: "tenant_demo",
      workspaceId: "workspace_demo",
      name: "CorelyNext",
      slug: "corelynext",
      description: "A Next.js-based modular monolith boilerplate with DDD, hexagonal architecture, and AI-agent-ready docs.",
      gitProvider: "github",
      gitRepoUrl: "github.com/acme/corelynext",
      gitDefaultBranch: "main",
      requirementsPath: "/docs/requirements",
      assetsPath: "/docs/assets/requirements",
      agentContextPath: "/docs/agent-context"
    },
    {
      id: "project_other_private",
      tenantId: "tenant_other",
      workspaceId: "workspace_other",
      name: "Other Tenant Private Project",
      slug: "other-private-project",
      description: "This project exists to test multi-tenant isolation rules.",
      gitProvider: "github",
      gitRepoUrl: "github.com/other/private",
      gitDefaultBranch: "main",
      requirementsPath: "/docs/requirements",
      assetsPath: "/docs/assets/requirements",
      agentContextPath: "/docs/agent-context"
    }
  ];

  for (const p of projects) {
    await prisma.specGateProject.create({ data: p });
  }

  // 6. Seed Milestones
  const milestones = [
    {
      id: "milestone_launchos_mvp",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      name: "MVP",
      description: "Core launch workspace features for first internal users.",
      targetDate: new Date("2026-07-05T00:00:00.000Z"),
      status: "active"
    },
    {
      id: "milestone_launchos_beta",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      name: "Private Beta",
      description: "Audience, billing, and collaboration improvements for invited teams.",
      targetDate: new Date("2026-07-20T00:00:00.000Z"),
      status: "planned"
    },
    {
      id: "milestone_launchos_v1",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      name: "v1 Launch",
      description: "Public launch readiness with SEO and partner growth workflows.",
      targetDate: new Date("2026-08-15T00:00:00.000Z"),
      status: "planned"
    },
    {
      id: "milestone_talelingo_mvp",
      tenantId: "tenant_demo",
      projectId: "project_talelingo",
      name: "TaleLingo MVP",
      description: "Language learning platform MVP with grammar and chat practice.",
      targetDate: new Date("2026-07-15T00:00:00.000Z"),
      status: "active"
    },
    {
      id: "milestone_corelynext_docs",
      tenantId: "tenant_demo",
      projectId: "project_corelynext",
      name: "CorelyNext Docs Launch",
      description: "Consolidated documentation structure for developer onboardings.",
      targetDate: new Date("2026-07-30T00:00:00.000Z"),
      status: "planned"
    }
  ];

  for (const m of milestones) {
    await prisma.specGateMilestone.create({ data: m });
  }

  // 7. Seed Build Cycles
  const buildCycles = [
    {
      id: "cycle_launchos_mvp_week_1",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      name: "MVP Build Week 1",
      goal: "Ship team invite, asset library, and waitlist improvements.",
      startDate: new Date("2026-06-29T00:00:00.000Z"),
      endDate: new Date("2026-07-05T00:00:00.000Z"),
      status: "active"
    },
    {
      id: "cycle_launchos_beta_week_1",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      name: "Beta Build Week 1",
      goal: "Prepare audience import and billing limits.",
      startDate: new Date("2026-07-06T00:00:00.000Z"),
      endDate: new Date("2026-07-12T00:00:00.000Z"),
      status: "planned"
    },
    {
      id: "cycle_launchos_v1_growth",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      name: "v1 Growth Prep",
      goal: "Prepare partner links, SEO pages, and weekly AI reports.",
      startDate: new Date("2026-07-13T00:00:00.000Z"),
      endDate: new Date("2026-07-19T00:00:00.000Z"),
      status: "planned"
    }
  ];

  for (const c of buildCycles) {
    await prisma.specGateBuildCycle.create({ data: c });
  }

  // 8. Seed Specs
  const specs = [
    // LaunchOS
    {
      id: "spec_launchos_req_001",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-001",
      title: "Review TBS integration",
      slug: "review-tbs-integration",
      agentReadiness: "needs_clarification",
      requiresCodeChanges: "unknown",
      riskLevel: "medium",
      summary: "Review existing TBS integration",
      description: "There is an existing integration but we need to review it before making changes.",
      status: "request",
      priority: "high",
      roadmapLane: "now",
      targetMilestoneId: "milestone_launchos_mvp",
      buildCycleId: "cycle_launchos_mvp_week_1",
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Existing TBS integration entry points are identified.",
        "Related files/modules are listed with short explanations.",
        "Current data flow is documented from caller → API/service → TBS/mock/external dependency.",
        "Missing or risky parts are listed.",
        "Required follow-up tickets are proposed.",
        "If code changes are made, tests/build/typecheck commands are run and results are reported.",
        "If no code changes are made, the final output clearly says 'review only; no code changed.'"
      ],
      outOfScopeJson: ["Refactoring the integration", "Fixing bugs found during review"],
      openQuestionsJson: [
        "Who is the primary user?",
        "What does success look like?",
        "What is explicitly out of scope?"
      ],
      agentTargetsJson: ["claude_code", "codex", "cursor", "github_copilot", "generic_markdown"],
      suggestedSearchTermsJson: ["TBS", "integration"],
      verificationPlanJson: ["Run tests to ensure no regressions"],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_002",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-002",
      title: "Team Invite",
      slug: "team-invite",
      summary: "Admins can invite team members by email. Invite links expire after 14 days.",
      description: "Workspace admins need a simple way to invite team members so product, design, and engineering can collaborate on launch work.",
      status: "stakeholder_review",
      priority: "high",
      roadmapLane: "now",
      targetMilestoneId: "milestone_launchos_mvp",
      buildCycleId: "cycle_launchos_mvp_week_1",
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-25T11:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Admin can invite a user by email.",
        "Non-admin cannot invite users.",
        "Invite email is sent.",
        "Invite link expires after 14 days.",
        "Expired invite shows an error message.",
        "Bulk invite is out of scope."
      ],
      outOfScopeJson: ["Bulk invite", "SSO invite", "Role-based invite customization"],
      relatedFilesJson: ["apps/app/src/features/team", "packages/modules/identity", "packages/modules/email"],
      technicalNotes: "Use existing team permission model and email adapter.",
      uiNotes: "Success message should feel friendly and clear.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_003",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-003",
      title: "Product Asset Library",
      slug: "product-asset-library",
      summary: "Users can upload screenshots, logos, and documents for each product.",
      description: "Product teams need one place to keep launch assets such as screenshots, logos, pitch docs, and demo videos.",
      status: "in_development",
      priority: "high",
      roadmapLane: "now",
      targetMilestoneId: "milestone_launchos_mvp",
      buildCycleId: "cycle_launchos_mvp_week_1",
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-25T14:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "User can upload image or PDF.",
        "Asset appears in product asset list.",
        "User can add title and notes.",
        "User can delete an asset.",
        "Large video uploads are out of scope."
      ],
      outOfScopeJson: ["Large video upload", "Image editing", "Public asset CDN"],
      relatedFilesJson: ["apps/app/src/features/assets", "packages/storage"],
      technicalNotes: "Use ObjectStoragePort. Metadata belongs in product asset records.",
      uiNotes: "Asset grid should show file type, title, and notes.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_004",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-004",
      title: "Audience Import",
      slug: "audience-import",
      summary: "Users can import audience contacts from CSV and use them for outreach campaigns.",
      description: "Founders need to import waitlist users, early customers, and manually collected leads into one audience list.",
      status: "approved",
      priority: "high",
      roadmapLane: "next",
      targetMilestoneId: "milestone_launchos_beta",
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-27T09:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "User can upload CSV.",
        "System validates email column.",
        "Invalid rows are shown before import.",
        "Imported contacts appear in audience list.",
        "Duplicate emails are skipped."
      ],
      outOfScopeJson: ["CRM sync", "Email enrichment", "Automatic segmentation"],
      relatedFilesJson: ["apps/app/src/features/audience", "packages/modules/audience"],
      technicalNotes: "CSV parsing should be server-side. Validation should return row-level errors.",
      uiNotes: "Import preview should show valid and invalid rows separately.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_005",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-005",
      title: "Public Partner Links",
      slug: "public-partner-links",
      summary: "Users can add partner links to support SEO backlink exchange.",
      description: "Products need a simple way to manage partner links and backlink exchange relationships.",
      status: "review",
      priority: "medium",
      roadmapLane: "later",
      targetMilestoneId: "milestone_launchos_v1",
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "User can add partner name and URL.",
        "User can mark a partner link as pending, active, or rejected.",
        "Public partner links can be displayed on a generated page.",
        "Admin can remove a partner link."
      ],
      outOfScopeJson: ["Automated backlink verification", "Marketplace discovery", "Paid link tracking"],
      relatedFilesJson: ["apps/app/src/features/partner-links"],
      technicalNotes: "Need decision on dofollow/nofollow before approval.",
      uiNotes: "Make status simple and SEO-friendly.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_006",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-006",
      title: "Billing Plan Limits",
      slug: "billing-plan-limits",
      summary: "Define free and paid plan limits for projects, AI credits, and team members.",
      description: "The app needs simple plan limits before private beta invites more users.",
      status: "draft",
      priority: "medium",
      roadmapLane: "next",
      targetMilestoneId: "milestone_launchos_beta",
      buildCycleId: "cycle_launchos_beta_week_1",
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Free plan has project limit.",
        "Team plan has higher project limit.",
        "AI credits are visible.",
        "Upgrade CTA appears when user reaches a limit."
      ],
      outOfScopeJson: ["Stripe checkout", "Invoice history", "Enterprise contracts"],
      relatedFilesJson: ["apps/app/src/features/billing", "packages/modules/billing"],
      technicalNotes: "Only plan limit checks for MVP. No checkout integration.",
      uiNotes: "Show limits in a friendly non-blocking way.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_007",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-007",
      title: "AI Weekly Project Summary",
      slug: "ai-weekly-project-summary",
      summary: "Every Monday, the AI summarizes what changed in the project and what is blocked.",
      description: "Founders want a quick weekly summary of project progress without reading every activity item.",
      status: "request",
      priority: "low",
      roadmapLane: "icebox",
      targetMilestoneId: "milestone_launchos_v1",
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_008",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-008",
      title: "SpecGate Landing Page Copy",
      slug: "specgate-landing-page-copy",
      summary: "Create clear landing page copy for SpecGate positioning and demo CTA.",
      description: "The product needs simple messaging that explains spec approval before AI coding starts.",
      status: "build_queue",
      priority: "high",
      roadmapLane: "now",
      targetMilestoneId: "milestone_launchos_mvp",
      buildCycleId: "cycle_launchos_mvp_week_1",
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-28T08:30:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Hero headline explains approval before AI agents build.",
        "Subheadline mentions small teams, approved specs, Cursor, Claude Code, and preview.",
        "CTA links to interactive demo.",
        "FAQ explains that this is not a Jira replacement."
      ],
      outOfScopeJson: ["Full landing page implementation", "Pricing checkout", "Blog content"],
      relatedFilesJson: ["apps/app/app/page.tsx", "apps/app/src/components/landing"],
      technicalNotes: "Use existing landing page component structure.",
      uiNotes: "Keep copy practical and developer-trustworthy.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_009",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-009",
      title: "Developer Review Checklist",
      slug: "developer-review-checklist",
      summary: "Developers can review AI-generated implementation against the approved spec before preview.",
      description: "Before a stakeholder sees the preview, the developer should confirm the implementation matches acceptance criteria.",
      status: "developer_review",
      priority: "medium",
      roadmapLane: "now",
      targetMilestoneId: "milestone_launchos_mvp",
      buildCycleId: "cycle_launchos_mvp_week_1",
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-27T13:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Developer can see approved acceptance criteria.",
        "Developer can mark checklist items as passed.",
        "Developer can request changes.",
        "Developer can approve implementation for preview."
      ],
      outOfScopeJson: ["Automated code review", "Security scanning", "CI integration"],
      relatedFilesJson: ["apps/app/src/features/developer-review", "packages/modules/specgate-implementation"],
      technicalNotes: "Checklist data can be stored as JSON for MVP.",
      uiNotes: "Make pass/fail state obvious.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_010",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-010",
      title: "Preview Browser Modal",
      slug: "preview-browser-modal",
      summary: "Stakeholders can open a fake browser preview modal before approving or rejecting a feature.",
      description: "The demo should show a browser-like frame with preview URL, checklist, approve/comment/reject buttons.",
      status: "preview",
      priority: "medium",
      roadmapLane: "now",
      targetMilestoneId: "milestone_launchos_mvp",
      buildCycleId: "cycle_launchos_mvp_week_1",
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-27T16:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Preview opens in a modal.",
        "Modal shows fake browser URL bar.",
        "Checklist appears next to preview.",
        "Stakeholder can approve, comment, or reject."
      ],
      outOfScopeJson: ["Real deployment integration", "Screenshot comparison", "Video recording"],
      relatedFilesJson: ["apps/app/src/features/preview"],
      technicalNotes: "Preview data comes from backend preview review records.",
      uiNotes: "Make it feel like a real staging review.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_011",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-011",
      title: "Preview Feedback Email",
      slug: "preview-feedback-email",
      summary: "When stakeholders reject a preview, developers receive a clear feedback summary.",
      description: "Rejected preview feedback should be captured clearly so developers know what to fix.",
      status: "developer_review",
      priority: "low",
      roadmapLane: "later",
      targetMilestoneId: "milestone_launchos_beta",
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: "u-david",
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-26T10:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [
        "Rejection requires a reason.",
        "Reason is stored as preview feedback.",
        "Spec returns to developer review.",
        "Activity timeline records the rejection."
      ],
      outOfScopeJson: ["Real email sending", "Slack notification", "Feedback sentiment analysis"],
      relatedFilesJson: ["packages/modules/specgate-preview", "packages/modules/specgate-activity"],
      technicalNotes: "No real email in MVP; just store feedback.",
      uiNotes: "Show rejection reason prominently.",
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_req_012",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "REQ-012",
      title: "Git Markdown Export",
      slug: "git-markdown-export",
      summary: "Approved specs are exported as Markdown into the configured requirements path.",
      description: "Teams need approved specs to live in Git so coding agents and developers can use them as source-of-truth context.",
      status: "accepted",
      priority: "medium",
      roadmapLane: "next",
      targetMilestoneId: "milestone_launchos_beta",
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-28T11:00:00.000Z"),
      acceptedBy: "u-ha",
      acceptedAt: new Date("2026-06-29T10:00:00.000Z"),
      doneAt: null,
      acceptanceCriteriaJson: [
        "Only approved specs can be synced.",
        "Markdown contains frontmatter.",
        "Markdown contains acceptance criteria.",
        "Fake sync returns file path and commit SHA."
      ],
      outOfScopeJson: ["Real GitHub commit", "Pull request creation", "GitLab integration"],
      relatedFilesJson: ["packages/modules/specgate-agent", "docs/requirements"],
      technicalNotes: "Use fake GitSyncPort adapter.",
      uiNotes: "Show synced path and commit sha.",
      createdBy: "u-minh"
    },

    // Edge Cases (LaunchOS)
    {
      id: "spec_launchos_edge_missing_acceptance",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "EDGE-001",
      title: "Missing Acceptance Criteria Example",
      slug: "missing-acceptance-criteria-example",
      summary: "This spec is intentionally incomplete and should not be approvable.",
      description: "This spec is intentionally incomplete to test validation logic. Expected API behavior: approveSpec should return Validation error",
      status: "review",
      priority: "medium",
      roadmapLane: "icebox",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [],
      outOfScopeJson: ["Real implementation"],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_edge_missing_out_of_scope",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "EDGE-002",
      title: "Missing Out Of Scope Example",
      slug: "missing-out-of-scope-example",
      summary: "This spec has acceptance criteria but no out-of-scope list.",
      description: "This spec has acceptance criteria but no out-of-scope list. Expected API behavior: approveSpec should return Validation error",
      status: "review",
      priority: "medium",
      roadmapLane: "icebox",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["Basic behavior is defined."],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },
    {
      id: "spec_launchos_edge_agent_before_approval",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specNumber: "EDGE-003",
      title: "Agent Context Before Approval Example",
      slug: "agent-context-before-approval-example",
      summary: "This spec is intentionally not approved and should not allow agent context generation.",
      description: "This spec is intentionally not approved to test conflict check logic. Expected API behavior: generateAgentContext should return Conflict error",
      status: "draft",
      priority: "medium",
      roadmapLane: "icebox",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["Draft exists."],
      outOfScopeJson: ["Agent handoff"],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },

    // TaleLingo
    {
      id: "spec_talelingo_req_001",
      tenantId: "tenant_demo",
      projectId: "project_talelingo",
      specNumber: "REQ-001",
      title: "Grammar SEO API",
      slug: "grammar-seo-api",
      summary: "Expose public grammar data from SharedGrammarPoint for SEO landing pages.",
      description: "Public API wrapper around SharedGrammarPoint to query localized expressions.",
      status: "approved",
      priority: "high",
      roadmapLane: "now",
      targetMilestoneId: "milestone_talelingo_mvp",
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-28T10:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["SEO landing pages can query SharedGrammarPoint API.", "Returns correct translation details."],
      outOfScopeJson: ["Interactive grammar tests"],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },
    {
      id: "spec_talelingo_req_002",
      tenantId: "tenant_demo",
      projectId: "project_talelingo",
      specNumber: "REQ-002",
      title: "Conversation Practice Landing Copy",
      slug: "conversation-practice-landing-copy",
      summary: "Explain real-life conversation listening and role practice on the landing page.",
      description: "Copy draft showing conversational skills benefit.",
      status: "review",
      priority: "medium",
      roadmapLane: "next",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["Hero text describes roleplay feature.", "Sign up CTA linked."],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },
    {
      id: "spec_talelingo_req_003",
      tenantId: "tenant_demo",
      projectId: "project_talelingo",
      specNumber: "REQ-003",
      title: "A1-C1 Level Filter",
      slug: "a1-c1-level-filter",
      summary: "Users can filter grammar and conversations by A1 to C1 level.",
      description: "Filter dropdown to group items dynamically.",
      status: "request",
      priority: "medium",
      roadmapLane: "icebox",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-minh",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-minh"
    },

    // CorelyNext
    {
      id: "spec_corelynext_req_001",
      tenantId: "tenant_demo",
      projectId: "project_corelynext",
      specNumber: "REQ-001",
      title: "Admin Module Generator",
      slug: "admin-module-generator",
      summary: "Generate admin CRUD scaffolding for a module following DDD and hexagonal architecture.",
      description: "Scaffold generator that reads a schema file and produces files in application, domain, and infrastructure folders.",
      status: "draft",
      priority: "high",
      roadmapLane: "now",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-ha",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["CLI command outputs model boilerplate.", "Adheres to corely boundaries."],
      outOfScopeJson: ["Automatic DB migrations"],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-ha"
    },
    {
      id: "spec_corelynext_req_002",
      tenantId: "tenant_demo",
      projectId: "project_corelynext",
      specNumber: "REQ-002",
      title: "Architecture Docs Index",
      slug: "architecture-docs-index",
      summary: "Create an index page for architecture docs so AI agents can scan the correct files before coding.",
      description: "Index pointing to boundaries, error, persistence docs.",
      status: "approved",
      priority: "medium",
      roadmapLane: "next",
      targetMilestoneId: "milestone_corelynext_docs",
      buildCycleId: null,
      ownerId: "u-ha",
      assigneeId: null,
      approvedBy: "u-ha",
      approvedAt: new Date("2026-06-28T14:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["Links all architecture files.", "Agent guidelines are readable."],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-ha"
    },
    {
      id: "spec_corelynext_req_003",
      tenantId: "tenant_demo",
      projectId: "project_corelynext",
      specNumber: "REQ-003",
      title: "Module Boundary Testkit",
      slug: "module-boundary-testkit",
      summary: "Add test helpers to detect forbidden imports across module boundaries.",
      description: "Lint checks or dependency graphs to enforce Hexagonal boundary imports.",
      status: "request",
      priority: "medium",
      roadmapLane: "later",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-ha",
      assigneeId: null,
      approvedBy: null,
      approvedAt: null,
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: [],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-ha"
    },

    // Other Tenant (Private Spec)
    {
      id: "spec_other_req_001",
      tenantId: "tenant_other",
      projectId: "project_other_private",
      specNumber: "REQ-001",
      title: "Private Other Tenant Spec",
      slug: "private-other-tenant-spec",
      summary: "This spec exists only to verify tenant isolation.",
      description: "This spec belongs to tenant_other and must not be visible to tenant_demo.",
      status: "approved",
      priority: "medium",
      roadmapLane: "now",
      targetMilestoneId: null,
      buildCycleId: null,
      ownerId: "u-other-admin",
      assigneeId: null,
      approvedBy: "u-other-admin",
      approvedAt: new Date("2026-06-28T12:00:00.000Z"),
      acceptedBy: null,
      acceptedAt: null,
      doneAt: null,
      acceptanceCriteriaJson: ["Accessible only via tenant_other."],
      outOfScopeJson: [],
      relatedFilesJson: [],
      technicalNotes: null,
      uiNotes: null,
      createdBy: "u-other-admin"
    }
  ];

  for (const s of specs) {
    await prisma.specGateSpec.create({ data: s });
  }

  // 9. Seed Spec Versions
  const versions = [
    // REQ-002 multiple versions
    {
      id: "version_launchos_req_002_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      versionNumber: 1,
      summarySnapshot: "Admins can invite team members by email. Invite links expire after 7 days.",
      markdownSnapshot: "# Team Invite (v1)\n\nExpired in 7 days.",
      createdBy: "u-ha",
      changeSummary: "Initial draft used 7-day invite expiry.",
      createdAt: new Date("2026-06-24T11:00:00.000Z")
    },
    {
      id: "version_launchos_req_002_v2",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      versionNumber: 2,
      summarySnapshot: "Admins can invite team members by email. Invite links expire after 14 days.",
      markdownSnapshot: "# Team Invite (v2)\n\nExpired in 14 days.",
      createdBy: "u-ha",
      changeSummary: "Approved version changed invite expiry to 14 days.",
      createdAt: new Date("2026-06-25T11:00:00.000Z")
    },
    // Single version (v1) for other approved+ specs
    {
      id: "version_launchos_req_001_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_001",
      versionNumber: 1,
      summarySnapshot: "Visitors can join the waitlist from the landing page using only their email address.",
      markdownSnapshot: "# Waitlist Signup\n\nVisitors join waitlist via email.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-24T09:00:00.000Z")
    },
    {
      id: "version_launchos_req_003_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_003",
      versionNumber: 1,
      summarySnapshot: "Users can upload screenshots, logos, and documents for each product.",
      markdownSnapshot: "# Product Asset Library\n\nStore logos and PDF documents.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-25T14:00:00.000Z")
    },
    {
      id: "version_launchos_req_004_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_004",
      versionNumber: 1,
      summarySnapshot: "Users can import audience contacts from CSV and use them for outreach campaigns.",
      markdownSnapshot: "# Audience Import\n\nCSV upload validations.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-27T09:00:00.000Z")
    },
    {
      id: "version_launchos_req_008_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_008",
      versionNumber: 1,
      summarySnapshot: "Create clear landing page copy for SpecGate positioning and demo CTA.",
      markdownSnapshot: "# SpecGate Landing Copy\n\nHero copy details.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-28T08:30:00.000Z")
    },
    {
      id: "version_launchos_req_009_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_009",
      versionNumber: 1,
      summarySnapshot: "Developers can review AI-generated implementation against the approved spec before preview.",
      markdownSnapshot: "# Developer Review Checklist\n\nManual confirmation criteria.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-27T13:00:00.000Z")
    },
    {
      id: "version_launchos_req_010_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_010",
      versionNumber: 1,
      summarySnapshot: "Stakeholders can open a fake browser preview modal before approving or rejecting a feature.",
      markdownSnapshot: "# Preview Browser Modal\n\nModal iframe representation.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-27T16:00:00.000Z")
    },
    {
      id: "version_launchos_req_011_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_011",
      versionNumber: 1,
      summarySnapshot: "When stakeholders reject a preview, developers receive a clear feedback summary.",
      markdownSnapshot: "# Preview Feedback Email\n\nFeedback loop logic.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-26T10:00:00.000Z")
    },
    {
      id: "version_launchos_req_012_v1",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_012",
      versionNumber: 1,
      summarySnapshot: "Approved specs are exported as Markdown into the configured requirements path.",
      markdownSnapshot: "# Git Markdown Export\n\nMarkdown sync details.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-28T11:00:00.000Z")
    },
    {
      id: "version_talelingo_req_001_v1",
      tenantId: "tenant_demo",
      specId: "spec_talelingo_req_001",
      versionNumber: 1,
      summarySnapshot: "Expose public grammar data from SharedGrammarPoint for SEO landing pages.",
      markdownSnapshot: "# Grammar SEO API\n\nGrammar translations.",
      createdBy: "u-minh",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-28T10:00:00.000Z")
    },
    {
      id: "version_corelynext_req_002_v1",
      tenantId: "tenant_demo",
      specId: "spec_corelynext_req_002",
      versionNumber: 1,
      summarySnapshot: "Create an index page for architecture docs so AI agents can scan the correct files before coding.",
      markdownSnapshot: "# Architecture Docs Index\n\nArchitect files index.",
      createdBy: "u-ha",
      changeSummary: "Initial approved scope.",
      createdAt: new Date("2026-06-28T14:00:00.000Z")
    }
  ];

  for (const v of versions) {
    await prisma.specGateSpecVersion.create({ data: v });
  }

  // Update approvedVersionId fields in SpecGateSpec records
  const specVersionsToLink = [
    { specId: "spec_launchos_req_001", versionId: "version_launchos_req_001_v1" },
    { specId: "spec_launchos_req_002", versionId: "version_launchos_req_002_v2" },
    { specId: "spec_launchos_req_003", versionId: "version_launchos_req_003_v1" },
    { specId: "spec_launchos_req_004", versionId: "version_launchos_req_004_v1" },
    { specId: "spec_launchos_req_008", versionId: "version_launchos_req_008_v1" },
    { specId: "spec_launchos_req_009", versionId: "version_launchos_req_009_v1" },
    { specId: "spec_launchos_req_010", versionId: "version_launchos_req_010_v1" },
    { specId: "spec_launchos_req_011", versionId: "version_launchos_req_011_v1" },
    { specId: "spec_launchos_req_012", versionId: "version_launchos_req_012_v1" },
    { specId: "spec_talelingo_req_001", versionId: "version_talelingo_req_001_v1" },
    { specId: "spec_corelynext_req_002", versionId: "version_corelynext_req_002_v1" }
  ];

  for (const item of specVersionsToLink) {
    await prisma.specGateSpec.update({
      where: { id: item.specId },
      data: { approvedVersionId: item.versionId }
    });
  }

  // 10. Seed Comments
  const comments = [
    {
      id: "comment_req_002_anna_success_message",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      userId: "u-anna",
      body: "Can the success message be friendlier?",
      sectionReference: "uiNotes",
      status: "open",
      createdAt: new Date("2026-06-25T10:00:00.000Z"),
      updatedAt: new Date("2026-06-25T10:00:00.000Z")
    },
    {
      id: "comment_req_002_david_email_service",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      userId: "u-david",
      body: "Email service already exists, we can reuse the current adapter.",
      sectionReference: "technicalNotes",
      status: "resolved",
      resolvedBy: "u-ha",
      resolvedAt: new Date("2026-06-25T10:30:00.000Z"),
      createdAt: new Date("2026-06-25T10:15:00.000Z"),
      updatedAt: new Date("2026-06-25T10:30:00.000Z")
    },
    {
      id: "comment_req_002_ha_bulk_invite",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      userId: "u-ha",
      body: "Bulk invite is not needed for MVP.",
      sectionReference: "outOfScope",
      status: "resolved",
      resolvedBy: "u-ha",
      resolvedAt: new Date("2026-06-25T10:35:00.000Z"),
      createdAt: new Date("2026-06-25T10:20:00.000Z"),
      updatedAt: new Date("2026-06-25T10:35:00.000Z")
    },
    // REQ-005 comments (open questions)
    {
      id: "comment_req_005_question_approval",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_005",
      userId: "u-minh",
      body: "Should partner links require approval?",
      sectionReference: "technicalNotes",
      status: "open",
      createdAt: new Date("2026-06-27T10:00:00.000Z"),
      updatedAt: new Date("2026-06-27T10:00:00.000Z")
    },
    {
      id: "comment_req_005_question_nofollow",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_005",
      userId: "u-david",
      body: "Should links be nofollow or dofollow?",
      sectionReference: "technicalNotes",
      status: "open",
      createdAt: new Date("2026-06-27T10:15:00.000Z"),
      updatedAt: new Date("2026-06-27T10:15:00.000Z")
    },
    {
      id: "comment_req_005_question_directory",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_005",
      userId: "u-anna",
      body: "Should we expose a public partner directory?",
      sectionReference: "technicalNotes",
      status: "open",
      createdAt: new Date("2026-06-27T10:30:00.000Z"),
      updatedAt: new Date("2026-06-27T10:30:00.000Z")
    },
    // REQ-006 comments (draft improvement)
    {
      id: "comment_req_006_free_tier",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_006",
      userId: "u-linh",
      body: "Let's ensure the free tier project limit is clearly communicated to the user.",
      sectionReference: "uiNotes",
      status: "open",
      createdAt: new Date("2026-06-28T09:00:00.000Z"),
      updatedAt: new Date("2026-06-28T09:00:00.000Z")
    },
    // REQ-011 comments (rejection feedback)
    {
      id: "comment_req_011_rejection_visibility",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_011",
      userId: "u-linh",
      body: "The rejection reason is stored, but it is not visible enough for the developer.",
      sectionReference: "uiNotes",
      status: "open",
      createdAt: new Date("2026-06-28T16:05:00.000Z"),
      updatedAt: new Date("2026-06-28T16:05:00.000Z")
    }
  ];

  for (const c of comments) {
    await prisma.specGateComment.create({ data: c });
  }

  // 11. Seed Decisions
  const decisions = [
    // REQ-002 Decisions
    {
      id: "decision_req_002_invite_expiry",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      question: "Should invite links expire after 7 or 14 days?",
      decision: "Use 14 days for MVP.",
      decidedBy: "u-ha",
      createdAt: new Date("2026-06-25T10:50:00.000Z")
    },
    {
      id: "decision_req_002_bulk_invite",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      question: "Should bulk invite be included in MVP?",
      decision: "No. Bulk invite is out of scope for MVP.",
      decidedBy: "u-ha",
      createdAt: new Date("2026-06-25T10:55:00.000Z")
    },
    {
      id: "decision_req_002_email_provider",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_002",
      question: "Which email provider should Team Invite use?",
      decision: "Reuse the existing email service adapter.",
      decidedBy: "u-david",
      createdAt: new Date("2026-06-25T11:00:00.000Z")
    },
    // REQ-005 Decisions
    {
      id: "decision_req_005_approval",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_005",
      question: "Should partner links require approval?",
      decision: "Yes, partner links should require admin approval.",
      decidedBy: "u-ha",
      createdAt: new Date("2026-06-27T11:00:00.000Z")
    },
    {
      id: "decision_req_005_nofollow",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_005",
      question: "Should links be nofollow or dofollow?",
      decision: "Use nofollow by default until user explicitly marks a partner as trusted.",
      decidedBy: "u-david",
      createdAt: new Date("2026-06-27T11:15:00.000Z")
    },
    {
      id: "decision_req_005_directory",
      tenantId: "tenant_demo",
      specId: "spec_launchos_req_005",
      question: "Should we expose a public partner directory?",
      decision: "No. Public partner directory is out of scope for MVP.",
      decidedBy: "u-ha",
      createdAt: new Date("2026-06-27T11:30:00.000Z")
    }
  ];

  for (const d of decisions) {
    await prisma.specGateDecision.create({ data: d });
  }

  // 12. Seed Build Queue Items
  const queueItems = [
    {
      id: "queue_item_req_008",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_008",
      assignedTo: "u-david",
      buildCycleId: "cycle_launchos_mvp_week_1",
      priorityRank: 1
    },
    {
      id: "queue_item_req_003",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_003",
      assignedTo: "u-david",
      buildCycleId: "cycle_launchos_mvp_week_1",
      priorityRank: 2
    },
    {
      id: "queue_item_req_009",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_009",
      assignedTo: "u-david",
      buildCycleId: "cycle_launchos_mvp_week_1",
      priorityRank: 3
    },
    {
      id: "queue_item_req_010",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_010",
      assignedTo: "u-david",
      buildCycleId: "cycle_launchos_mvp_week_1",
      priorityRank: 4
    }
  ];

  for (const q of queueItems) {
    await prisma.specGateBuildQueueItem.create({ data: q });
  }

  // 13. Seed Agent Contexts
  const agentContexts = [
    {
      id: "agent_context_req_002_cursor",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_002",
      targetAgent: "cursor",
      markdown: `# Agent Context: REQ-002 Team Invite\n\n## Goal\nImplement the approved Team Invite feature.\n\n## Acceptance criteria\n- Admin can create invite.\n- Non-admin cannot invite.\n- Expire in 14 days.`,
      createdBy: "u-david",
      createdAt: new Date("2026-06-25T11:20:00.000Z")
    },
    {
      id: "agent_context_req_003_claude",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_003",
      targetAgent: "claude_code",
      markdown: `# Agent Context: REQ-003 Product Asset Library\n\nStore screenshots, logos, and documents.`,
      createdBy: "u-david",
      createdAt: new Date("2026-06-26T10:05:00.000Z")
    },
    {
      id: "agent_context_req_008_generic",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_008",
      targetAgent: "generic",
      markdown: `# Agent Context: REQ-008 SpecGate Landing Page Copy\n\nCopy drafting.`,
      createdBy: "u-david",
      createdAt: new Date("2026-06-28T09:00:00.000Z")
    },
    {
      id: "agent_context_req_012_generic",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_012",
      targetAgent: "generic",
      markdown: `# Agent Context: REQ-012 Git Markdown Export\n\nExport markdown files.`,
      createdBy: "u-david",
      createdAt: new Date("2026-06-28T11:20:00.000Z")
    }
  ];

  for (const ac of agentContexts) {
    await prisma.specGateAgentContext.create({ data: ac });
  }

  // 14. Seed Git Sync Records
  const gitSyncRecords = [
    {
      id: "git_sync_req_001",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_001",
      provider: "github",
      fakeCommitSha: "demo_req001_initial",
      path: "/docs/requirements/REQ-001-waitlist-signup.md",
      status: "success",
      createdBy: "u-ha",
      createdAt: new Date("2026-06-24T09:15:00.000Z")
    },
    {
      id: "git_sync_req_002",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_002",
      provider: "github",
      fakeCommitSha: "demo_req002_14days",
      path: "/docs/requirements/REQ-002-team-invite.md",
      status: "success",
      createdBy: "u-ha",
      createdAt: new Date("2026-06-25T11:15:00.000Z")
    },
    {
      id: "git_sync_req_012",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_012",
      provider: "github",
      fakeCommitSha: "demo_req012_markdown",
      path: "/docs/requirements/REQ-012-git-markdown-export.md",
      status: "success",
      createdBy: "u-ha",
      createdAt: new Date("2026-06-28T11:15:00.000Z")
    }
  ];

  for (const gs of gitSyncRecords) {
    await prisma.gitSyncRecord.create({ data: gs });
  }

  // 15. Seed Spec Code Checks
  const codeChecks = [
    {
      id: "check_req_002_invite_expiry_mismatch",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_002",
      status: "warning",
      summary: "Potential mismatch: approved spec says invite links expire after 14 days, but one test fixture still uses 7 days.",
      mismatchFindingsJson: {
        findings: [
          {
            severity: "warning",
            title: "Invite expiry mismatch",
            expected: "Invite links expire after 14 days.",
            actual: "One test fixture uses 7 days.",
            suggestedFix: "Update invite expiration test data and confirm backend token expiry uses 14 days."
          }
        ]
      },
      createdBy: "u-david",
      createdAt: new Date("2026-06-28T13:00:00.000Z")
    },
    {
      id: "check_req_003_passed",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_003",
      status: "passed",
      summary: "No obvious mismatch found in demo check.",
      mismatchFindingsJson: {},
      createdBy: "u-david",
      createdAt: new Date("2026-06-28T13:10:00.000Z")
    },
    {
      id: "check_req_010_passed",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_010",
      status: "passed",
      summary: "Preview modal implementation appears to match approved checklist.",
      mismatchFindingsJson: {},
      createdBy: "u-david",
      createdAt: new Date("2026-06-28T13:20:00.000Z")
    }
  ];

  for (const cc of codeChecks) {
    await prisma.specGateSpecCodeCheck.create({ data: cc });
  }

  // 16. Seed Implementation Records
  const implementations = [
    {
      id: "impl_req_002",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_002",
      status: "approved_for_preview",
      branchName: "feature/req-002-team-invite",
      pullRequestUrl: "https://github.com/acme/launchos/pull/42",
      developerId: "u-david",
      createdAt: new Date("2026-06-26T09:00:00.000Z"),
      updatedAt: new Date("2026-06-28T14:00:00.000Z")
    },
    {
      id: "impl_req_003",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_003",
      status: "in_progress",
      branchName: "feature/req-003-asset-library",
      pullRequestUrl: null,
      developerId: "u-david",
      createdAt: new Date("2026-06-26T10:00:00.000Z"),
      updatedAt: new Date("2026-06-26T10:00:00.000Z")
    },
    {
      id: "impl_req_009",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_009",
      status: "ready_for_developer_review",
      branchName: "feature/req-009-dev-review-checklist",
      pullRequestUrl: "https://github.com/acme/launchos/pull/44",
      developerId: "u-david",
      createdAt: new Date("2026-06-27T12:00:00.000Z"),
      updatedAt: new Date("2026-06-27T12:00:00.000Z")
    },
    {
      id: "impl_req_010",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_010",
      status: "approved_for_preview",
      branchName: "feature/req-010-preview-browser-modal",
      pullRequestUrl: "https://github.com/acme/launchos/pull/46",
      developerId: "u-david",
      createdAt: new Date("2026-06-27T15:00:00.000Z"),
      updatedAt: new Date("2026-06-27T15:00:00.000Z")
    },
    {
      id: "impl_req_011",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_011",
      status: "changes_requested",
      branchName: "feature/req-011-preview-feedback",
      pullRequestUrl: "https://github.com/acme/launchos/pull/45",
      developerId: "u-david",
      createdAt: new Date("2026-06-26T10:30:00.000Z"),
      updatedAt: new Date("2026-06-28T16:00:00.000Z")
    }
  ];

  for (const impl of implementations) {
    await prisma.implementationRecord.create({ data: impl });
  }

  // 17. Seed Developer Reviews
  const devReviews = [
    {
      id: "dev_review_req_009",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_009",
      reviewerId: "u-david",
      status: "pending",
      notes: "Checking checklist persistence and status transitions.",
      createdAt: new Date("2026-06-27T13:30:00.000Z"),
      updatedAt: new Date("2026-06-27T13:30:00.000Z")
    },
    {
      id: "dev_review_req_010",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_010",
      reviewerId: "u-david",
      status: "approved_for_preview",
      notes: "Implementation matches approved preview flow.",
      createdAt: new Date("2026-06-27T16:30:00.000Z"),
      updatedAt: new Date("2026-06-27T16:30:00.000Z")
    },
    {
      id: "dev_review_req_011",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_011",
      reviewerId: "u-david",
      status: "changes_requested",
      notes: "Returned from stakeholder rejection. Need clearer feedback display.",
      createdAt: new Date("2026-06-28T16:15:00.000Z"),
      updatedAt: new Date("2026-06-28T16:15:00.000Z")
    }
  ];

  for (const dr of devReviews) {
    await prisma.specGateDeveloperReview.create({ data: dr });
  }

  // 18. Seed Preview Reviews
  const previewReviews = [
    {
      id: "preview_req_002_waiting",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_002",
      previewUrl: "https://staging.launchos.dev/team/invites",
      environment: "staging",
      status: "waiting_for_review",
      feedback: null,
      rejectionReason: null,
      reviewedBy: "u-anna",
      createdAt: new Date("2026-06-28T14:30:00.000Z"),
      updatedAt: new Date("2026-06-28T14:30:00.000Z")
    },
    {
      id: "preview_req_001_approved",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_001",
      previewUrl: "https://preview.launchos.dev/waitlist",
      environment: "preview",
      status: "approved",
      feedback: "Looks good. The success message is clear.",
      rejectionReason: null,
      reviewedBy: "u-anna",
      createdAt: new Date("2026-06-26T14:00:00.000Z"),
      updatedAt: new Date("2026-06-26T15:30:00.000Z")
    },
    {
      id: "preview_req_011_rejected",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_011",
      previewUrl: "https://staging.launchos.dev/preview-feedback-email",
      environment: "staging",
      status: "rejected",
      feedback: "The rejection reason is stored, but it is not visible enough for the developer.",
      rejectionReason: "The rejection reason is stored, but it is not visible enough for the developer.",
      reviewedBy: "u-linh",
      createdAt: new Date("2026-06-28T15:00:00.000Z"),
      updatedAt: new Date("2026-06-28T16:00:00.000Z")
    },
    {
      id: "preview_req_010_waiting",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_010",
      previewUrl: "https://staging.launchos.dev/preview-browser",
      environment: "staging",
      status: "waiting_for_review",
      feedback: null,
      rejectionReason: null,
      reviewedBy: "u-anna",
      createdAt: new Date("2026-06-27T17:00:00.000Z"),
      updatedAt: new Date("2026-06-27T17:00:00.000Z")
    }
  ];

  for (const pr of previewReviews) {
    await prisma.specGatePreviewReview.create({ data: pr });
  }

  // 19. Seed Preview Checklists
  const previewChecklists = [
    {
      id: "checklist_req_002",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_002",
      itemsJson: [
        { id: "checklist_req_002_1", label: "Admin can open invite form.", status: "passed" },
        { id: "checklist_req_002_2", label: "Invite email can be submitted.", status: "passed" },
        { id: "checklist_req_002_3", label: "Success message is friendly.", status: "needs_review" },
        { id: "checklist_req_002_4", label: "Expired invite error is visible.", status: "needs_review" }
      ],
      createdAt: new Date("2026-06-28T14:30:00.000Z")
    },
    {
      id: "checklist_req_001",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_001",
      itemsJson: [
        { id: "checklist_req_001_1", label: "Email form validation.", status: "passed" },
        { id: "checklist_req_001_2", label: "Confirmation message visible.", status: "passed" }
      ],
      createdAt: new Date("2026-06-26T14:00:00.000Z")
    },
    {
      id: "checklist_req_010",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_010",
      itemsJson: [
        { id: "checklist_req_010_1", label: "Preview opens in modal.", status: "passed" },
        { id: "checklist_req_010_2", label: "Fake URL bar is shown.", status: "passed" }
      ],
      createdAt: new Date("2026-06-27T17:00:00.000Z")
    },
    {
      id: "checklist_req_011",
      tenantId: "tenant_demo",
      projectId: "project_launchos",
      specId: "spec_launchos_req_011",
      itemsJson: [
        { id: "checklist_req_011_1", label: "Feedback text is saved.", status: "passed" }
      ],
      createdAt: new Date("2026-06-28T15:00:00.000Z")
    }
  ];

  for (const pc of previewChecklists) {
    await prisma.specGatePreviewChecklist.create({ data: pc });
  }

  // 20. Seed Activity Timeline (41 Chronological Items)
  const activities = [
    { specId: "spec_launchos_req_001", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-001 Waitlist Signup.", createdAt: "2026-06-24T08:00:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-001 Waitlist Signup.", createdAt: "2026-06-24T09:00:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "specgate", type: "spec_synced_to_git", message: "SpecGate synced REQ-001 Waitlist Signup to /docs/requirements/REQ-001-waitlist-signup.md.", createdAt: "2026-06-24T09:15:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-david", type: "development_started", message: "David started development on REQ-001 Waitlist Signup.", createdAt: "2026-06-24T10:00:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-david", type: "pull_request_linked", message: "David linked PR #41 to REQ-001.", createdAt: "2026-06-25T09:00:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "specgate", type: "spec_check_completed", message: "SpecGate completed spec check for REQ-001: passed.", createdAt: "2026-06-25T09:30:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-david", type: "developer_review_started", message: "David started developer review for REQ-001.", createdAt: "2026-06-25T10:00:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-david", type: "approved_for_preview", message: "David approved REQ-001 for preview.", createdAt: "2026-06-25T10:30:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-david", type: "preview_url_added", message: "David added preview URL for REQ-001.", createdAt: "2026-06-25T11:00:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-david", type: "sent_to_stakeholder_review", message: "David sent REQ-001 to stakeholder review.", createdAt: "2026-06-25T11:30:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-anna", type: "preview_approved", message: "Anna approved preview for REQ-001.", createdAt: "2026-06-26T15:30:00.000Z" },
    { specId: "spec_launchos_req_001", actorId: "u-anna", type: "marked_done", message: "Anna marked REQ-001 as Done.", createdAt: "2026-06-27T10:00:00.000Z" },
    
    { specId: "spec_launchos_req_002", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-002 Team Invite.", createdAt: "2026-06-24T12:00:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-anna", type: "spec_comment_added", message: "Anna commented: \"Can the success message be friendlier?\"", createdAt: "2026-06-25T10:00:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-david", type: "spec_comment_added", message: "David commented: \"Email service already exists, we can reuse the current adapter.\"", createdAt: "2026-06-25T10:15:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-ha", type: "spec_comment_added", message: "Ha commented: \"Bulk invite is not needed for MVP.\"", createdAt: "2026-06-25T10:20:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-002 Team Invite.", createdAt: "2026-06-25T11:00:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "specgate", type: "spec_synced_to_git", message: "SpecGate synced REQ-002 Team Invite to /docs/requirements/REQ-002-team-invite.md.", createdAt: "2026-06-25T11:15:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "specgate", type: "agent_context_generated", message: "SpecGate generated Cursor context for REQ-002 Team Invite.", createdAt: "2026-06-25T11:20:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-david", type: "development_started", message: "David started development on REQ-002 Team Invite.", createdAt: "2026-06-26T09:00:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-david", type: "pull_request_linked", message: "David linked PR #42 to REQ-002 Team Invite.", createdAt: "2026-06-27T14:00:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "specgate", type: "spec_check_completed", message: "SpecGate detected a possible invite expiry mismatch in REQ-002.", createdAt: "2026-06-28T13:00:00.000Z" },
    { specId: "spec_launchos_req_002", actorId: "u-david", type: "sent_to_stakeholder_review", message: "David sent REQ-002 Team Invite to stakeholder review.", createdAt: "2026-06-28T14:30:00.000Z" },
    
    { specId: "spec_launchos_req_003", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-003 Product Asset Library.", createdAt: "2026-06-25T13:00:00.000Z" },
    { specId: "spec_launchos_req_003", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-003 Product Asset Library.", createdAt: "2026-06-25T14:00:00.000Z" },
    { specId: "spec_launchos_req_003", actorId: "u-david", type: "development_started", message: "David started development on REQ-003 Product Asset Library.", createdAt: "2026-06-26T10:00:00.000Z" },
    
    { specId: "spec_launchos_req_004", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-004 Audience Import.", createdAt: "2026-06-27T08:00:00.000Z" },
    { specId: "spec_launchos_req_004", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-004 Audience Import.", createdAt: "2026-06-27T09:00:00.000Z" },
    
    { specId: "spec_launchos_req_005", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-005 Public Partner Links.", createdAt: "2026-06-27T09:30:00.000Z" },
    { specId: "spec_launchos_req_006", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-006 Billing Plan Limits.", createdAt: "2026-06-27T10:00:00.000Z" },
    
    { specId: "spec_launchos_req_008", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-008 SpecGate Landing Page Copy.", createdAt: "2026-06-28T08:00:00.000Z" },
    { specId: "spec_launchos_req_008", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-008 SpecGate Landing Page Copy.", createdAt: "2026-06-28T08:30:00.000Z" },
    
    { specId: "spec_launchos_req_009", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-009 Developer Review Checklist.", createdAt: "2026-06-27T12:00:00.000Z" },
    { specId: "spec_launchos_req_009", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-009 Developer Review Checklist.", createdAt: "2026-06-27T13:00:00.000Z" },
    
    { specId: "spec_launchos_req_010", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-010 Preview Browser Modal.", createdAt: "2026-06-27T15:00:00.000Z" },
    { specId: "spec_launchos_req_010", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-010 Preview Browser Modal.", createdAt: "2026-06-27T16:00:00.000Z" },
    
    { specId: "spec_launchos_req_011", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-011 Preview Feedback Email.", createdAt: "2026-06-26T09:00:00.000Z" },
    { specId: "spec_launchos_req_011", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-011 Preview Feedback Email.", createdAt: "2026-06-26T10:00:00.000Z" },
    { specId: "spec_launchos_req_011", actorId: "u-linh", type: "preview_rejected", message: "Linh rejected preview for REQ-011: Rejection reason stored.", createdAt: "2026-06-28T16:00:00.000Z" },
    
    { specId: "spec_launchos_req_012", actorId: "u-minh", type: "spec_created", message: "Minh created REQ-012 Git Markdown Export.", createdAt: "2026-06-28T10:00:00.000Z" },
    { specId: "spec_launchos_req_012", actorId: "u-ha", type: "spec_approved", message: "Ha approved REQ-012 Git Markdown Export.", createdAt: "2026-06-28T11:00:00.000Z" }
  ];

  let activityIndex = 1;
  for (const act of activities) {
    const paddedIndex = String(activityIndex++).padStart(3, "0");
    await prisma.specGateActivity.create({
      data: {
        id: `activity_${paddedIndex}`,
        tenantId: "tenant_demo",
        projectId: "project_launchos",
        specId: act.specId,
        actorId: act.actorId,
        type: act.type,
        message: act.message,
        metadataJson: {},
        createdAt: new Date(act.createdAt)
      }
    });
  }

  console.log("Seeding engineering context...");
  await seedEngineeringContext(prisma, "tenant_demo", "project_launchos", "u-ha");

  console.log("Seeding documents...");
  await seedDocuments(prisma, "tenant_demo", "project_launchos", "u-ha");
}

// -------------------------------------------------------------
// STANDALONE EXECUTION ENTRYPOINT (tsx CLI)
// -------------------------------------------------------------

async function main() {
  const isReset = process.argv.includes("--reset");
  console.log(`[Seed Script] Running SpecGate seed (isReset=${isReset})...`);

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL environment variable must be defined.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 15000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    if (isReset) {
      console.log("[Seed Script] Resetting demo data for tenant_demo and tenant_other...");
      await resetSpecGateDemo(prisma);
      console.log("[Seed Script] Reset complete.");
    } else {
      // Idempotency: Always reset before inserting new records to prevent duplicate key errors
      console.log("[Seed Script] Resetting existing demo data to ensure clean seeding...");
      await resetSpecGateDemo(prisma);
    }

    console.log("[Seed Script] Seeding demo data...");
    await seedSpecGateDemo(prisma);
    console.log("[Seed Script] Seeding complete.");

    // Print summary report
    console.log("\n=======================================================");
    console.log("SpecGate demo seed completed.");
    console.log("=======================================================");
    console.log("Tenant: tenant_demo");
    console.log("Demo users: 8");
    console.log("Other tenant users: 2");
    console.log("Projects: 4");
    console.log("Specs: 19");
    console.log("Milestones: 5");
    console.log("Build cycles: 3");
    console.log("Build queue items: 4");
    console.log("Spec versions: 12");
    console.log("Comments: 8");
    console.log("Decisions: 6");
    console.log("Agent contexts: 4");
    console.log("Git sync records: 3");
    console.log("Spec checks: 3");
    console.log("Implementation records: 5");
    console.log("Developer reviews: 3");
    console.log("Preview reviews: 4");
    console.log("Preview checklists: 4");
    console.log("Activities: 41");
    console.log("=======================================================");

    if (process.env.NODE_ENV !== "production") {
      console.log("\nLocal demo login accounts (Passwordless Login):");
      console.log("  Founder (Admin):       ha@example.com");
      console.log("  Product Lead (Product): minh@example.com");
      console.log("  Developer (Dev):        david@example.com");
      console.log("  Stakeholder (Anna):    anna@example.com");
      console.log("  Designer (Linh):       linh@example.com");
      console.log("  Viewer (Sara):         sara@example.com");
      console.log("\n  Credentials are NOT enabled for:");
      console.log("    Invited Developer (Noah): noah@example.com");
      console.log("    Disabled (Former):       disabled@example.com");
      console.log("=======================================================");
    }

    console.log("\nUseful API endpoints for validation:");
    console.log("  - Projects: /api/specgate/projects");
    console.log("  - Specs:    /api/specgate/specs?projectId=project_launchos");
    console.log("  - Status:   /api/specgate/specs?status=stakeholder_review");
    console.log("  - Roadmap:  /api/specgate/planning/roadmap?projectId=project_launchos");
    console.log("  - Context:  /api/specgate/agent/specs/spec_launchos_req_002/contexts/latest");
    console.log("  - Preview:  /api/specgate/preview/specs/spec_launchos_req_002/reviews");
    console.log("  - Activity: /api/specgate/specs/spec_launchos_req_002/activity");
    console.log("=======================================================\n");

  } catch (error) {
    console.error("[Seed Script] Error encountered during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Detect if this file is run directly with tsx/node
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main();
}

async function seedEngineeringContext(prisma: PrismaClient, tenantId: string, projectId: string, userId: string) {
  const context = await prisma.specGateEngineeringContext.create({
    data: {
      tenantId,
      projectId,
      status: "APPROVED",
      version: 1,
      projectSummaryMarkdown: "SpecGate is a spec-first workflow for small software teams using coding agents.",
      architectureMarkdown: "Corely modular monolith.\nNext.js App Router in apps/app.\nBusiness modules in packages/modules.\nContracts in packages/contracts.\nPrisma in packages/data.\nStorage through packages/storage.",
      codingConventionsMarkdown: "Use TypeScript.\nKeep route handlers thin.\nUse use cases for business logic.\nKeep Prisma behind repository adapters.\nDo not import Next.js into shared modules.\nUse contracts for API boundaries.",
      testingStrategyMarkdown: "Use Vitest for unit tests.",
      securityRulesMarkdown: "Ensure tenantId is always filtered.",
      createdBy: userId,
      approvedBy: userId,
      approvedAt: new Date(),
    }
  });

  await prisma.specGateProjectValidationCommand.createMany({
    data: [
      { tenantId, projectId, contextId: context.id, label: "Install", command: "pnpm install", commandType: "INSTALL", required: true, sortOrder: 1 },
      { tenantId, projectId, contextId: context.id, label: "Typecheck", command: "pnpm tsc --noEmit", commandType: "TYPECHECK", required: true, sortOrder: 2 },
      { tenantId, projectId, contextId: context.id, label: "Lint", command: "pnpm lint", commandType: "LINT", required: true, sortOrder: 3 },
      { tenantId, projectId, contextId: context.id, label: "Test", command: "pnpm test", commandType: "TEST", required: true, sortOrder: 4 },
      { tenantId, projectId, contextId: context.id, label: "Build", command: "pnpm build", commandType: "BUILD", required: true, sortOrder: 5 },
    ]
  });

  await prisma.specGateProjectAdr.createMany({
    data: [
      { tenantId, projectId, contextId: context.id, number: 1, title: "Use Corely modular monolith", status: "ACCEPTED", contextMarkdown: "We need a modular architecture.", decisionMarkdown: "Use Corely modular monolith.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, number: 2, title: "Use Engineering Context as project-level source of truth for agent behavior", status: "ACCEPTED", contextMarkdown: "Agents need context.", decisionMarkdown: "Use Engineering Context.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, number: 3, title: "Use AGENTS.md as canonical cross-agent export", status: "ACCEPTED", contextMarkdown: "Many agents.", decisionMarkdown: "Use AGENTS.md.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, number: 4, title: "Use fake export/sync adapters for MVP", status: "ACCEPTED", contextMarkdown: "MVP constraints.", decisionMarkdown: "Fake sync.", createdBy: userId },
    ]
  });

  await prisma.specGateProjectContextRule.createMany({
    data: [
      { tenantId, projectId, contextId: context.id, title: "Architecture Boundary Rules", category: "ARCHITECTURE", scopeType: "GLOBAL", severity: "REQUIRED", contentMarkdown: "Do not import Next.js into shared modules.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, title: "Backend Module Rules", category: "BACKEND", scopeType: "PATH", pathGlob: "packages/modules/**/*.ts", severity: "REQUIRED", contentMarkdown: "Use use cases for business logic.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, title: "Frontend UI Rules", category: "FRONTEND", scopeType: "PATH", pathGlob: "apps/app/**/*.tsx", severity: "REQUIRED", contentMarkdown: "Keep route handlers thin.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, title: "Prisma/Data Access Rules", category: "DATABASE", scopeType: "GLOBAL", severity: "REQUIRED", contentMarkdown: "Keep Prisma behind repository adapters.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, title: "Testing Rules", category: "TESTING", scopeType: "GLOBAL", severity: "REQUIRED", contentMarkdown: "Use Vitest.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, title: "Security Rules", category: "SECURITY", scopeType: "GLOBAL", severity: "REQUIRED", contentMarkdown: "Ensure tenantId is checked.", createdBy: userId },
      { tenantId, projectId, contextId: context.id, title: "Agent Behavior Rules", category: "AGENT", scopeType: "GLOBAL", severity: "REQUIRED", contentMarkdown: "Do not mark done until preview accepted.", createdBy: userId },
    ]
  });
}

async function seedDocuments(prisma: PrismaClient, tenantId: string, projectId: string, userId: string) {
  const documents = [
    {
      id: "doc_launchos_product_brief",
      tenantId,
      projectId,
      title: "LaunchOS Product Brief",
      type: "product_brief",
      summary: "High-level overview of LaunchOS, its target audience, and key value propositions.",
      contentJson: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "LaunchOS Product Brief" }] },
          { type: "paragraph", content: [{ type: "text", text: "LaunchOS is a unified workspace for SaaS founders and indie hackers to manage their product launches." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Target Audience" }] },
          { type: "paragraph", content: [{ type: "text", text: "Solo founders, small cross-functional teams (Product, Design, Engineering) building SaaS applications." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Core Value Proposition" }] },
          { type: "paragraph", content: [{ type: "text", text: "Bridge the gap between product requirements and engineering execution using AI coding agents." }] }
        ]
      },
      tags: ["brief", "overview", "vision"],
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      updatedAt: new Date("2026-06-01T10:00:00.000Z")
    },
    {
      id: "doc_launchos_user_personas",
      tenantId,
      projectId,
      title: "Target User Personas",
      type: "customer_research",
      summary: "Detailed profiles of our core users: The Founder, The Product Lead, and The Developer.",
      contentJson: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "User Personas" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "1. The Founder (Admin)" }] },
          { type: "paragraph", content: [{ type: "text", text: "Needs visibility into project progress. Approves specs and reviews staging previews before production deployment." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "2. The Product Lead" }] },
          { type: "paragraph", content: [{ type: "text", text: "Writes specs, links related documents, and manages the build queue. Focuses on 'what' to build." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "3. The Developer" }] },
          { type: "paragraph", content: [{ type: "text", text: "Uses Agent Handoff context to prompt their AI coding tools (e.g., Cursor, Claude). Focuses on 'how' to build." }] }
        ]
      },
      tags: ["research", "personas", "users"],
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date("2026-06-05T14:30:00.000Z"),
      updatedAt: new Date("2026-06-05T14:30:00.000Z")
    },
    {
      id: "doc_launchos_billing_rules",
      tenantId,
      projectId,
      title: "Billing Limits Business Rules",
      type: "business_rules",
      summary: "Definitions of limits for Free vs Team plans.",
      contentJson: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Billing Plan Limits" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Free Plan" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "1 Workspace" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "1 Project" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Max 3 team members" }] }] }
          ]},
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Team Plan" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Unlimited Workspaces" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Unlimited Projects" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Unlimited team members ($20/user/mo)" }] }] }
          ]}
        ]
      },
      tags: ["billing", "rules", "monetization"],
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date("2026-06-10T09:15:00.000Z"),
      updatedAt: new Date("2026-06-10T09:15:00.000Z")
    }
  ];

  for (const doc of documents) {
    await prisma.specGateDocument.create({ data: doc });
  }

  // Link doc_launchos_billing_rules to REQ-006 Billing Plan Limits
  await prisma.specGateSpecDocumentLink.create({
    data: {
      tenantId,
      projectId,
      specId: "spec_launchos_req_006",
      documentId: "doc_launchos_billing_rules",
      createdById: userId,
    }
  });
}

