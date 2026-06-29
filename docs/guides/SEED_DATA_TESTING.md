# SpecGate Seed Data Testing Guide

This guide outlines how to use the generated demo seed dataset to test SpecGate backend APIs, frontend flows, tenant isolation boundaries, and business rules.

---

## 1. Local Login Credentials & Roles

The seed data populates several users under `tenant_demo` with specific roles and membership permissions. The system uses **Passwordless Login**; you can sign in using the following email addresses:

| User Email | Role | Membership Status | Use Cases |
| :--- | :--- | :--- | :--- |
| **`ha@yopmail.com`** | `admin` | `ACTIVE` | Spec approvals, workspace configuration, tenant settings. |
| **`minh@yopmail.com`** | `product_lead` | `ACTIVE` | Spec authoring, target milestones, build cycle management. |
| **`david@yopmail.com`** | `developer` | `ACTIVE` | Starting development, linking PRs, completing developer reviews. |
| **`anna@yopmail.com`** | `stakeholder` | `ACTIVE` | Preview approvals, stakeholder review feedback. |
| **`linh@yopmail.com`** | `designer` | `ACTIVE` | Commenting on specs and UI designs. |
| **`sara@yopmail.com`** | `viewer` | `ACTIVE` | Read-only access validation. |
| **`noah@yopmail.com`** | `developer` | `INVITED` | Testing invitation flow, pending memberships. (Sign-in disabled) |
| **`disabled@yopmail.com`**| `developer` | `DISABLED` | Testing authorization checks for disabled accounts. (Status is `INACTIVE`) |

---

## 2. Multi-Tenant Isolation Boundaries

To verify that tenant boundaries are fully respected by backend queries and services, the seeder also creates an isolated tenant (`tenant_other`).

- **Isolated Tenant ID**: `tenant_other`
- **Isolated Admin**: `u-other-admin` (`other-admin@yopmail.com`)
- **Isolated Developer**: `u-other-dev` (`other-dev@yopmail.com`)
- **Isolated Project**: `project_other` (`Other-Tenant Workspace`)
- **Isolated Spec**: `spec_other_req_001` (`REQ-001: Private Accounting API`)

### Isolation Test Case:
Verify that querying `/api/specgate/specs` or `/api/specgate/projects` with a context session authenticated for `tenant_demo` **never** lists or references any resource belonging to `tenant_other`.

---

## 3. Testing Core Business Rules

The seed data contains pre-configured spec records positioned specifically to test DDD process boundaries:

### Rule A: "No coding-agent handoff before the spec is approved"
Coding agents require an approved spec as context.
- **Test Spec (Blocked)**: `REQ-007` (AI Weekly Project Summary) is in `request` status. Attempting to trigger an agent context generation or developer handoff endpoint for this spec should return a `400 Bad Request` or authorization block.
- **Test Spec (Allowed)**: `REQ-002` (Team Invite) or `REQ-004` (Audience Import) are `approved`. They allow exporting/syncing to Git and triggering agent tasks.

### Rule B: "No feature marked done before preview acceptance"
- **Test Spec (Blocked)**: `REQ-002` (Team Invite) is currently in `stakeholder_review` with a pending preview review (`sg_preview_req_002` waiting for review). Attempting to move `REQ-002` status directly to `done` or `accepted` without first approving the preview should fail.
- **Test Spec (Completed)**: `REQ-001` (Waitlist Signup) was successfully approved by stakeholder `Anna` and transitioned to `done`.

---

## 4. API Endpoint Integration Testing

Here are useful API endpoints preconfigured with the seeded data structure for manual testing (using Postman, curl, or frontend clients):

### A. List Projects
Retrieve all active projects under the authenticated tenant.
- **Endpoint**: `GET /api/specgate/projects`
- **Expected Data**:
  - `LaunchOS` (Slug: `launchos`)
  - `TaleLingo` (Slug: `talelingo`)
  - `MRR Journey` (Slug: `mrr-journey`)

### B. List Specs by Project
- **Endpoint**: `GET /api/specgate/specs?projectId=project_launchos`
- **Expected Data**: 15 spec records ranging from status `request` to `done`.

### C. Retrieve Spec Details with Relations (`REQ-002`)
`REQ-002` (Team Invite) has been populated with rich relations to test nested layouts.
- **Endpoint**: `GET /api/specgate/specs/spec_launchos_req_002`
- **Expected Data**:
  - Comments: 3 open comments from Anna, David, and Ha.
  - Decisions: 3 decisions (invite expiry, bulk invite out-of-scope, email provider).
  - Code Check: 1 status check record with status `warning` (simulating spec/code mismatch).
  - Git Sync: 1 Git sync record with commit SHA and file path.
  - Agent Context: Latest Cursor-agent Markdown context file.

### D. Verify Build Cycle & Queue Priority
- **Endpoint**: `GET /api/specgate/planning/roadmap?projectId=project_launchos`
- **Expected Data**:
  - Active build cycle: `cycle_launchos_mvp_week_1` (containing `REQ-002`, `REQ-003`, `REQ-001` ordered by priority rank).
  - Planned build cycle: `cycle_launchos_beta_week_1` (containing `REQ-004`, `REQ-006`).

---

## 5. Maintenance Commands

To reset and re-seed the environment to a clean state after performing write tests:

```bash
# Reset database and apply seed
pnpm seed:specgate:reset

# Verify database state integrity
npx tsx --env-file=.env packages/data/prisma/verify-specgate-demo-seed.ts
```
