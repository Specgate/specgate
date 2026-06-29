import { PrismaClient } from "@prisma/client";

async function runVerification() {
  console.log("[Verification Script] Running assertions on seeded database...");
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    // 1. Projects checks
    const allProjects = await prisma.specGateProject.findMany();
    const demoProjects = allProjects.filter(p => p.tenantId === "tenant_demo");
    const otherProjects = allProjects.filter(p => p.tenantId === "tenant_other");

    console.log(`- Found ${demoProjects.length} projects for tenant_demo (Expected: 3)`);
    console.log(`- Found ${otherProjects.length} projects for tenant_other (Expected: 1)`);

    if (demoProjects.length !== 3) throw new Error("Incorrect number of projects for tenant_demo.");
    if (otherProjects.length !== 1) throw new Error("Incorrect number of projects for tenant_other.");

    const projectLaunchOS = demoProjects.find(p => p.id === "project_launchos");
    if (!projectLaunchOS) throw new Error("project_launchos not found.");
    if (projectLaunchOS.name !== "LaunchOS") throw new Error("project_launchos name mismatch.");

    // 2. Users and Memberships checks
    const allUsers = await prisma.user.findMany();
    const allMemberships = await prisma.membership.findMany();

    const demoUsers = allUsers.filter(u => u.id.startsWith("u-") && u.id !== "u-other-admin" && u.id !== "u-other-dev");
    const otherUsers = allUsers.filter(u => u.id === "u-other-admin" || u.id === "u-other-dev");

    console.log(`- Found ${demoUsers.length} users for tenant_demo (Expected: 8)`);
    console.log(`- Found ${otherUsers.length} users for tenant_other (Expected: 2)`);

    if (demoUsers.length !== 8) throw new Error("Incorrect number of users for tenant_demo.");
    if (otherUsers.length !== 2) throw new Error("Incorrect number of users for tenant_other.");

    // Check specific user roles and statuses
    const ha = demoUsers.find(u => u.id === "u-ha");
    const noah = demoUsers.find(u => u.id === "u-noah");
    const disabledUser = demoUsers.find(u => u.id === "u-disabled");

    if (!ha || ha.status !== "ACTIVE") throw new Error("u-ha status mismatch.");
    if (!noah || noah.status !== "ACTIVE") throw new Error("u-noah (invited) status mismatch."); // DB status is ACTIVE, membership is invited
    if (!disabledUser || disabledUser.status !== "INACTIVE") throw new Error("u-disabled status mismatch.");

    // Check membership mapping
    const haMembership = allMemberships.find(m => m.userId === "u-ha" && m.tenantId === "tenant_demo");
    if (!haMembership || haMembership.roleId !== "admin") throw new Error("u-ha membership role mismatch.");

    const noahMembership = allMemberships.find(m => m.userId === "u-noah" && m.tenantId === "tenant_demo");
    if (!noahMembership || noahMembership.roleId !== "developer") throw new Error("u-noah membership role mismatch.");

    // 3. Specs Checks (LaunchOS specs >= 12 normal + 3 edge = 15 total)
    const demoSpecs = await prisma.specGateSpec.findMany({
      where: { tenantId: "tenant_demo" }
    });
    const launchOSSpecs = demoSpecs.filter(s => s.projectId === "project_launchos");
    console.log(`- Found ${launchOSSpecs.length} specs for LaunchOS (Expected: 15)`);

    if (launchOSSpecs.length < 15) throw new Error("Incorrect number of specs for LaunchOS.");

    // Check all workflow statuses are covered in tenant_demo specs
    const requiredStatuses = [
      "request",
      "draft",
      "review",
      "approved",
      "build_queue",
      "in_development",
      "developer_review",
      "preview",
      "stakeholder_review",
      "accepted",
      "done"
    ];

    const seededStatuses = Array.from(new Set(demoSpecs.map(s => s.status)));
    console.log("- Statuses seeded in tenant_demo:", seededStatuses);
    for (const status of requiredStatuses) {
      if (!seededStatuses.includes(status)) {
        throw new Error(`Missing spec for status: ${status}`);
      }
    }

    // Specific Spec Assertions
    const req001 = demoSpecs.find(s => s.specNumber === "REQ-001");
    if (!req001 || req001.status !== "done") throw new Error("REQ-001 status mismatch.");

    const req002 = demoSpecs.find(s => s.specNumber === "REQ-002");
    if (!req002 || req002.status !== "stakeholder_review") throw new Error("REQ-002 status mismatch.");

    const req003 = demoSpecs.find(s => s.specNumber === "REQ-003");
    if (!req003 || req003.status !== "in_development") throw new Error("REQ-003 status mismatch.");

    const req004 = demoSpecs.find(s => s.specNumber === "REQ-004");
    if (!req004 || req004.status !== "approved") throw new Error("REQ-004 status mismatch.");

    const req009 = demoSpecs.find(s => s.specNumber === "REQ-009");
    if (!req009 || req009.status !== "developer_review") throw new Error("REQ-009 status mismatch.");

    const req010 = demoSpecs.find(s => s.specNumber === "REQ-010");
    if (!req010 || req010.status !== "preview") throw new Error("REQ-010 status mismatch.");

    const req011 = demoSpecs.find(s => s.specNumber === "REQ-011");
    if (!req011 || req011.status !== "developer_review") throw new Error("REQ-011 status mismatch.");

    // REQ-002 Relations check
    const req002Comments = await prisma.specGateComment.findMany({
      where: { specId: req002.id }
    });
    console.log(`- REQ-002 comments count: ${req002Comments.length} (Expected: 3)`);
    if (req002Comments.length !== 3) throw new Error("REQ-002 comments count mismatch.");

    const req002Decisions = await prisma.specGateDecision.findMany({
      where: { specId: req002.id }
    });
    console.log(`- REQ-002 decisions count: ${req002Decisions.length} (Expected: 3)`);
    if (req002Decisions.length !== 3) throw new Error("REQ-002 decisions count mismatch.");

    const req002AgentContexts = await prisma.specGateAgentContext.findMany({
      where: { specId: req002.id }
    });
    console.log(`- REQ-002 agent contexts count: ${req002AgentContexts.length} (Expected: 1)`);
    if (req002AgentContexts.length !== 1) throw new Error("REQ-002 agent contexts count mismatch.");

    const req002GitSync = await prisma.gitSyncRecord.findMany({
      where: { specId: req002.id }
    });
    console.log(`- REQ-002 git sync records count: ${req002GitSync.length} (Expected: 1)`);
    if (req002GitSync.length !== 1) throw new Error("REQ-002 git sync count mismatch.");

    const req002CodeCheck = await prisma.specGateSpecCodeCheck.findMany({
      where: { specId: req002.id }
    });
    console.log(`- REQ-002 spec code checks count: ${req002CodeCheck.length} (Expected: 1)`);
    if (req002CodeCheck.length !== 1 || req002CodeCheck[0].status !== "warning") {
      throw new Error("REQ-002 spec code check status warning mismatch.");
    }

    const req002PreviewReview = await prisma.specGatePreviewReview.findMany({
      where: { specId: req002.id }
    });
    console.log(`- REQ-002 preview review count: ${req002PreviewReview.length} (Expected: 1)`);
    if (req002PreviewReview.length !== 1 || req002PreviewReview[0].status !== "waiting_for_review") {
      throw new Error("REQ-002 preview review status mismatch.");
    }

    // 4. Edge Cases check
    const edge001 = demoSpecs.find(s => s.specNumber === "EDGE-001");
    const edge002 = demoSpecs.find(s => s.specNumber === "EDGE-002");
    const edge003 = demoSpecs.find(s => s.specNumber === "EDGE-003");

    if (!edge001 || (edge001.acceptanceCriteriaJson as string[]).length !== 0) {
      throw new Error("EDGE-001 acceptance criteria should be empty.");
    }
    if (!edge002 || (edge002.outOfScopeJson as string[]).length !== 0) {
      throw new Error("EDGE-002 out of scope should be empty.");
    }
    if (!edge003 || edge003.status !== "draft") {
      throw new Error("EDGE-003 status should be draft.");
    }

    // 5. Activity Timeline check
    const demoActivities = await prisma.specGateActivity.findMany({
      where: { tenantId: "tenant_demo" }
    });
    console.log(`- Found ${demoActivities.length} activities for tenant_demo (Expected: >= 35)`);
    if (demoActivities.length < 35) throw new Error("Timeline has fewer than 35 activities.");

    // Check chronological order of activities
    for (let i = 0; i < demoActivities.length - 1; i++) {
      if (demoActivities[i].createdAt > demoActivities[i + 1].createdAt) {
        throw new Error("Timeline activities are not strictly in chronological order.");
      }
    }

    // 6. Cross-Tenant Isolation checks
    const otherSpecs = await prisma.specGateSpec.findMany({
      where: { tenantId: "tenant_other" }
    });
    console.log(`- Found ${otherSpecs.length} specs for tenant_other (Expected: 1)`);
    if (otherSpecs.length !== 1) throw new Error("Incorrect number of specs for tenant_other.");

    const isolatedSpec = otherSpecs[0];
    if (isolatedSpec.id !== "spec_other_req_001") throw new Error("Isolated spec ID mismatch.");

    // Verify tenant_demo specs do not return any tenant_other specs
    const leakageSpecs = demoSpecs.filter(s => s.tenantId === "tenant_other");
    if (leakageSpecs.length > 0) throw new Error("Tenant isolation failure! tenant_other specs leaked into tenant_demo.");

    console.log("\n[Verification Script] ALL VERIFICATIONS PASSED SUCCESSFULLY!");

  } catch (error) {
    console.error("\n[Verification Script] VERIFICATION FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
