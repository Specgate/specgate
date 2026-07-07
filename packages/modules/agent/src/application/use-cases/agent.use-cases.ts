import { createHash, randomUUID } from "node:crypto";
import type { AgentTarget } from "@corely/contracts/specgate";
import type { RequestContext, SpecsUseCases } from "@corely/modules-specs";
import { NotFoundError } from "@corely/modules-specs";
import type { AgentRepositoryPort } from "../ports/agent-repository.port";
import {
  mapAgentContext,
  mapGitSyncRecord,
  mapSpecCodeCheck,
} from "../mappers";
import { generateSpecMarkdown } from "../services/spec-markdown-export.service";

export class AgentUseCases {
  constructor(
    private readonly repository: AgentRepositoryPort,
    private readonly specs: SpecsUseCases,
  ) {}

  async generateAgentContext(
    ctx: RequestContext,
    specId: string,
    targetAgent: AgentTarget,
  ) {
    const snapshot = await this.specs.getApprovedSpecSnapshot(ctx, specId);
    const markdown = generateSpecMarkdown(snapshot);
    const record = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: snapshot.projectId,
      specId,
      targetAgent,
      markdown,
      contextJson: {
        targetAgent,
        outOfScope: snapshot.outOfScope,
        relatedFiles: snapshot.relatedFiles,
      },
      createdBy: ctx.userId,
      createdAt: new Date(),
    };
    await this.repository.createAgentContext(record);
    return { data: mapAgentContext(record) };
  }

  async syncApprovedSpecToGit(ctx: RequestContext, specId: string) {
    const snapshot = await this.specs.getApprovedSpecSnapshot(ctx, specId);
    const markdown = generateSpecMarkdown(snapshot);
    const record = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: snapshot.projectId,
      specId,
      provider: "fake_git",
      fakeCommitSha: createHash("sha1")
        .update(`${snapshot.id}:${markdown}`)
        .digest("hex")
        .slice(0, 12),
      path: `requirements/${snapshot.specNumber}-${snapshot.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`,
      status: "synced",
      createdBy: ctx.userId,
      createdAt: new Date(),
    };
    await this.repository.createGitSyncRecord(record);
    return { data: mapGitSyncRecord(record) };
  }

  async listAgentContexts(ctx: RequestContext, specId: string) {
    return {
      data: (await this.repository.listAgentContexts(ctx.tenantId, specId)).map(
        mapAgentContext,
      ),
    };
  }

  async latestAgentContext(ctx: RequestContext, specId: string) {
    const latest = await this.repository.latestAgentContext(
      ctx.tenantId,
      specId,
    );
    if (!latest) return { data: null };
    return { data: mapAgentContext(latest) };
  }

  async runSpecCodeCheck(ctx: RequestContext, specId: string) {
    const snapshot = await this.specs.getApprovedSpecSnapshot(ctx, specId);
    const isReq002 =
      snapshot.specNumber === "REQ-002" ||
      snapshot.title.toLowerCase().includes("team invite");
    const findings = isReq002
      ? [
          {
            severity: "medium",
            message:
              "Invite expiry behavior is specified as 14 days but no expiry check was detected in mocked implementation files.",
            file: "services/api/src/modules/invite",
          },
        ]
      : [];
    const record = {
      id: randomUUID(),
      tenantId: ctx.tenantId,
      projectId: snapshot.projectId,
      specId,
      status: findings.length ? "mismatch_found" : "passed",
      summary: findings.length
        ? "SpecGate found possible spec-code mismatches."
        : "No mismatches found by deterministic mock checker.",
      mismatchFindings: findings,
      createdBy: ctx.userId,
      createdAt: new Date(),
    };
    await this.repository.createSpecCodeCheck(record);
    return { data: mapSpecCodeCheck(record) };
  }

  async latestSpecCodeCheck(ctx: RequestContext, specId: string) {
    const latest = await this.repository.latestSpecCodeCheck(
      ctx.tenantId,
      specId,
    );
    if (!latest) return { data: null };
    return { data: mapSpecCodeCheck(latest) };
  }
}
