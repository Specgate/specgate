import type { SpecStatus } from "@corely/contracts/specgate";
import type { SpecRecord } from "../../domain/entities/spec";
import { ConflictError, ValidationError } from "../../domain/errors";

const forward: Record<SpecStatus, SpecStatus | null> = {
  request: "draft",
  draft: "review",
  review: "approved",
  approved: "build_queue",
  build_queue: "in_development",
  in_development: "developer_review",
  developer_review: "preview",
  preview: "stakeholder_review",
  stakeholder_review: "accepted",
  accepted: "done",
  done: null,
};

const reverse = new Set([
  "review:draft",
  "developer_review:in_development",
  "stakeholder_review:developer_review",
  "stakeholder_review:review",
  "accepted:stakeholder_review",
]);

export class WorkflowService {
  assertTransition(current: SpecStatus, next: SpecStatus): void {
    if (current === next) return;
    if (forward[current] === next) return;
    if (reverse.has(`${current}:${next}`)) return;
    throw new ConflictError(`Cannot move spec from ${current} to ${next}.`);
  }

  assertApprovalReady(spec: SpecRecord): void {
    const missing: string[] = [];
    if (!spec.title.trim()) missing.push("title");
    if (!spec.summary && !spec.description)
      missing.push("summary_or_description");
    if (spec.acceptanceCriteria.length === 0)
      missing.push("acceptanceCriteria");
    if (spec.outOfScope.length === 0) missing.push("outOfScope");
    if (missing.length) {
      throw new ValidationError("Spec is missing required approval fields.", {
        missing,
      });
    }
  }

  assertApprovedOrLater(spec: SpecRecord): void {
    const approvedStatuses: SpecStatus[] = [
      "approved",
      "build_queue",
      "in_development",
      "developer_review",
      "preview",
      "stakeholder_review",
      "accepted",
      "done",
    ];
    if (!approvedStatuses.includes(spec.status)) {
      throw new ConflictError(
        "Spec must be approved before this action is allowed.",
      );
    }
  }
}
