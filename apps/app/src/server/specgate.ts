import {
  PrismaSpecsRepository,
  SpecsUseCases,
  type RequestContext,
} from "@corely/modules-specs";
import {
  PrismaPlanningRepository,
  PlanningUseCases,
} from "@corely/modules-planning";
import { PrismaAgentRepository, AgentUseCases } from "@corely/modules-agent";
import {
  PrismaImplementationRepository,
  ImplementationUseCases,
} from "@corely/modules-implementation";
import {
  PrismaPreviewRepository,
  PreviewUseCases,
} from "@corely/modules-preview";
import {
  InProcessActivityPublisher,
  PrismaActivityRepository,
  ActivityUseCases,
} from "@corely/modules-activity";
import { getPrisma } from "./prisma";

export function createRuntime() {
  const prisma = getPrisma() as any;
  const activity = new ActivityUseCases(new PrismaActivityRepository(prisma));
  const activityPublisher = new InProcessActivityPublisher(activity);
  const specs = new SpecsUseCases(
    new PrismaSpecsRepository(prisma),
    activityPublisher,
  );

  return {
    specs,
    planning: new PlanningUseCases(new PrismaPlanningRepository(prisma), specs),
    agent: new AgentUseCases(new PrismaAgentRepository(prisma), specs),
    implementation: new ImplementationUseCases(
      new PrismaImplementationRepository(prisma),
      specs,
    ),
    preview: new PreviewUseCases(new PrismaPreviewRepository(prisma), specs),
    activity,
    demo: createDemoRuntime(prisma),
  };
}

export function getDemoRequestContext(request: Request): RequestContext {
  return {
    tenantId: request.headers.get("x-tenant-id") || "tenant_demo",
    userId: request.headers.get("x-user-id") || "u-ha",
  };
}

function createDemoRuntime(prisma: any) {
  return {
    async reset() {
      await prisma.specGateActivity.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGatePreviewChecklist.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGatePreviewReview.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateDeveloperReview.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.implementationRecord.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateSpecCodeCheck.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.gitSyncRecord.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateAgentContext.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateBuildQueueItem.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateBuildCycle.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateMilestone.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateDecision.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateComment.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateSpecVersion.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateSpec.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      await prisma.specGateProject.deleteMany({
        where: { tenantId: "tenant_demo" },
      });
      return { data: { reset: true } };
    },

    async seed() {
      await this.reset();
      const now = new Date("2026-06-29T10:00:00.000Z");
      const projectId = "sg_project_launchos";
      await prisma.specGateProject.create({
        data: {
          id: projectId,
          tenantId: "tenant_demo",
          name: "LaunchOS",
          slug: "launchos",
          description: "SpecGate demo product workspace.",
          gitProvider: "github",
          gitRepoUrl: "https://github.com/example/launchos",
          gitDefaultBranch: "main",
          requirementsPath: "requirements",
          assetsPath: "assets",
          agentContextPath: ".agent/context",
          createdAt: now,
          updatedAt: now,
        },
      });

      const milestones = [
        ["sg_mvp", "MVP", "2026-07-05"],
        ["sg_private_beta", "Private Beta", "2026-07-20"],
        ["sg_v1_launch", "v1 Launch", "2026-08-15"],
      ];
      for (const [id, name, targetDate] of milestones) {
        await prisma.specGateMilestone.create({
          data: {
            id,
            tenantId: "tenant_demo",
            projectId,
            name,
            description: null,
            targetDate: new Date(`${targetDate}T00:00:00.000Z`),
            status: "planned",
            createdAt: now,
            updatedAt: now,
          },
        });
      }

      const specs = [
        [
          "sg_req_001",
          "REQ-001",
          "Waitlist Signup",
          "done",
          "now",
          "sg_mvp",
          "medium",
          "Visitors can join the waitlist from the landing page using only their email address.",
          [
            "Email field appears in hero section.",
            "Invalid email shows validation error.",
            "Successful signup shows confirmation message.",
            "Email is stored for later export.",
            "Admin list is out of scope.",
          ],
          ["Admin list"],
        ],
        [
          "sg_req_002",
          "REQ-002",
          "Team Invite",
          "stakeholder_review",
          "now",
          "sg_mvp",
          "high",
          "Admins can invite team members by email. Invite links expire after 14 days.",
          [
            "Admin can invite a user by email.",
            "Non-admin cannot invite users.",
            "Invite email is sent.",
            "Invite link expires after 14 days.",
            "Expired invite shows an error message.",
            "Bulk invite is out of scope.",
          ],
          ["Bulk invite", "SSO invite", "Role-based invite customization"],
        ],
        [
          "sg_req_003",
          "REQ-003",
          "Product Asset Library",
          "in_development",
          "now",
          "sg_mvp",
          "high",
          "Users can upload screenshots, logos, and documents for each product.",
          ["Users can upload product assets."],
          ["Advanced DAM workflows"],
        ],
        [
          "sg_req_004",
          "REQ-004",
          "Audience Import",
          "approved",
          "next",
          "sg_private_beta",
          "high",
          "Users can import audience contacts from CSV and use them for outreach campaigns.",
          ["CSV contacts can be imported."],
          ["CRM sync"],
        ],
        [
          "sg_req_005",
          "REQ-005",
          "Public Partner Links",
          "review",
          "later",
          "sg_v1_launch",
          "medium",
          "Users can add partner links to support SEO backlink exchange.",
          ["Partner links can be added."],
          ["Automated outreach"],
        ],
        [
          "sg_req_006",
          "REQ-006",
          "Billing Plan Limits",
          "draft",
          "next",
          "sg_private_beta",
          "medium",
          "Define free and paid plan limits for projects, AI credits, and team members.",
          ["Plan limits are visible."],
          ["Billing provider integration"],
        ],
        [
          "sg_req_007",
          "REQ-007",
          "AI Weekly Project Summary",
          "request",
          "icebox",
          "sg_v1_launch",
          "low",
          "Every Monday, the AI summarizes what changed in the project and what is blocked.",
          ["Weekly summary can be generated."],
          ["Daily summaries"],
        ],
      ] as const;

      for (const [
        id,
        specNumber,
        title,
        status,
        roadmapLane,
        targetMilestoneId,
        priority,
        summary,
        acceptanceCriteria,
        outOfScope,
      ] of specs) {
        await prisma.specGateSpec.create({
          data: {
            id,
            tenantId: "tenant_demo",
            projectId,
            specNumber,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            summary,
            description: summary,
            status,
            priority,
            roadmapLane,
            targetMilestoneId,
            buildCycleId: null,
            approvedVersionId: [
              "approved",
              "build_queue",
              "in_development",
              "developer_review",
              "preview",
              "stakeholder_review",
              "accepted",
              "done",
            ].includes(status)
              ? `${id}_v1`
              : null,
            approvedBy: [
              "approved",
              "build_queue",
              "in_development",
              "developer_review",
              "preview",
              "stakeholder_review",
              "accepted",
              "done",
            ].includes(status)
              ? "u-ha"
              : null,
            approvedAt: [
              "approved",
              "build_queue",
              "in_development",
              "developer_review",
              "preview",
              "stakeholder_review",
              "accepted",
              "done",
            ].includes(status)
              ? now
              : null,
            acceptedBy: status === "done" ? "u-anna" : null,
            acceptedAt: status === "done" ? now : null,
            doneAt: status === "done" ? now : null,
            acceptanceCriteriaJson: acceptanceCriteria,
            outOfScopeJson: outOfScope,
            relatedFilesJson:
              specNumber === "REQ-002"
                ? [
                    "apps/web/src/features/team",
                    "services/api/src/modules/invite",
                    "services/api/src/modules/email",
                  ]
                : [],
            technicalNotes:
              specNumber === "REQ-002"
                ? "Use existing email service and team permission model."
                : null,
            uiNotes: null,
            createdBy: "u-ha",
            createdAt: now,
            updatedAt: now,
          },
        });
      }

      await prisma.specGateBuildCycle.create({
        data: {
          id: "sg_cycle_mvp_w1",
          tenantId: "tenant_demo",
          projectId,
          name: "MVP Build Week 1",
          goal: "Ship team invite, asset library, and waitlist improvements",
          startDate: new Date("2026-06-29T00:00:00.000Z"),
          endDate: new Date("2026-07-05T00:00:00.000Z"),
          status: "active",
          createdAt: now,
          updatedAt: now,
        },
      });
      await prisma.specGateBuildCycle.create({
        data: {
          id: "sg_cycle_beta_w1",
          tenantId: "tenant_demo",
          projectId,
          name: "Beta Build Week 1",
          goal: "Prepare audience import and billing limits",
          startDate: new Date("2026-07-06T00:00:00.000Z"),
          endDate: new Date("2026-07-12T00:00:00.000Z"),
          status: "planned",
          createdAt: now,
          updatedAt: now,
        },
      });

      for (const [id, specId, buildCycleId, priorityRank] of [
        ["sg_q_1", "sg_req_002", "sg_cycle_mvp_w1", 1],
        ["sg_q_2", "sg_req_003", "sg_cycle_mvp_w1", 2],
        ["sg_q_3", "sg_req_001", "sg_cycle_mvp_w1", 3],
        ["sg_q_4", "sg_req_004", "sg_cycle_beta_w1", 1],
        ["sg_q_5", "sg_req_006", "sg_cycle_beta_w1", 2],
      ] as const) {
        await prisma.specGateBuildQueueItem.create({
          data: {
            id,
            tenantId: "tenant_demo",
            projectId,
            specId,
            buildCycleId,
            priorityRank,
            assignedTo: null,
            createdAt: now,
            updatedAt: now,
          },
        });
      }

      await prisma.specGatePreviewReview.create({
        data: {
          id: "sg_preview_req_002",
          tenantId: "tenant_demo",
          projectId,
          specId: "sg_req_002",
          previewUrl: "https://staging.launchos.dev/team/invites",
          environment: "staging",
          status: "waiting_for_review",
          feedback: null,
          rejectionReason: null,
          reviewedBy: null,
          createdAt: now,
          updatedAt: now,
        },
      });
      await prisma.implementationRecord.create({
        data: {
          id: "sg_impl_req_003",
          tenantId: "tenant_demo",
          projectId,
          specId: "sg_req_003",
          status: "in_progress",
          branchName: "feature/product-asset-library",
          pullRequestUrl: "https://github.com/example/launchos/pull/3",
          developerId: "u-david",
          createdAt: now,
          updatedAt: now,
        },
      });

      const comments = [
        ["u-anna", "Can the success message be friendlier?"],
        [
          "u-david",
          "Email service already exists, we can reuse Resend adapter.",
        ],
        ["u-ha", "Bulk invite is not needed for MVP."],
      ];
      for (const [userId, body] of comments) {
        await prisma.specGateComment.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: "tenant_demo",
            specId: "sg_req_002",
            userId,
            body,
            sectionReference: null,
            status: "open",
            createdAt: now,
            updatedAt: now,
          },
        });
      }
      const decisions = [
        ["Invite expiry", "14 days."],
        ["Bulk invite", "out of scope for MVP."],
        ["Email provider", "reuse existing email service."],
      ];
      for (const [question, decision] of decisions) {
        await prisma.specGateDecision.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: "tenant_demo",
            specId: "sg_req_002",
            question,
            decision,
            decidedBy: "u-ha",
            createdAt: now,
          },
        });
      }
      const activities = [
        ["u-anna", "spec_approved", "Anna approved REQ-001.", "sg_req_001"],
        [
          "u-david",
          "development_started",
          "David moved REQ-003 to In Development.",
          "sg_req_003",
        ],
        [
          "specgate",
          "agent_context_generated",
          "SpecGate generated Cursor context for REQ-002.",
          "sg_req_002",
        ],
        [
          "u-ha",
          "roadmap_lane_changed",
          "Ha moved REQ-004 to Next.",
          "sg_req_004",
        ],
        [
          "u-linh",
          "preview_commented",
          "Linh commented on REQ-002 preview.",
          "sg_req_002",
        ],
        [
          "specgate",
          "spec_check_completed",
          "SpecGate detected a possible spec-code mismatch in REQ-002.",
          "sg_req_002",
        ],
        [
          "u-ha",
          "spec_created",
          "Ha created REQ-007 from an idea.",
          "sg_req_007",
        ],
        [
          "u-david",
          "pull_request_linked",
          "David linked a pull request to REQ-003.",
          "sg_req_003",
        ],
      ];
      for (const [actorId, type, message, specId] of activities) {
        await prisma.specGateActivity.create({
          data: {
            id: crypto.randomUUID(),
            tenantId: "tenant_demo",
            projectId,
            specId,
            actorId,
            type,
            message,
            metadataJson: {},
            createdAt: now,
          },
        });
      }

      return { data: { seeded: true, projectId } };
    },
  };
}
