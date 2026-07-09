"use client";

import { PageHeader } from "@/components/app-shell/SpecGateAppShell";
import { useSpecGateQueryStore } from "@/lib/specgate-query";
import { PriorityPill, UserAvatar } from "@/components/app/Pills";
import { AlertTriangle, Bot, GitBranch, Sparkles } from "lucide-react";
import type { SpecStatus } from "@/types/specgate";
import Link from "next/link";

const cols: { key: string; title: string; statuses: SpecStatus[] }[] = [
  { key: "ready", title: "Ready", statuses: ["approved", "build_queue"] },
  { key: "assigned", title: "Assigned", statuses: [] },
  { key: "dev", title: "In Development", statuses: ["in_development"] },
  { key: "review", title: "Developer Review", statuses: ["developer_review"] },
  { key: "preview", title: "Ready for Preview", statuses: ["preview", "stakeholder_review"] },
];

export default function BuildQueuePage(): any {
  const { state } = useSpecGateQueryStore();

  return (
    <>
      <PageHeader
        title="Build Queue"
        description="Approved specs ready to build and implementation progress."
      />
      <div className="p-6 space-y-5">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
            <Sparkles className="h-3.5 w-3.5" /> AI Build Queue Summary
          </div>
          <p className="text-sm text-muted-foreground">
            3 specs are ready for agent handoff. REQ-004 is approved but has no developer
            assigned. REQ-002 is ready for stakeholder preview after expiry mismatch is resolved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {cols.map((col) => {
            const items =
              col.key === "assigned"
                ? state.specs.filter(
                    (s) => s.assigneeId && ["approved", "build_queue"].includes(s.status),
                  )
                : state.specs.filter(
                    (s) =>
                      col.statuses.includes(s.status) &&
                      !(col.key === "ready" && s.assigneeId),
                  );
            return (
              <div
                key={col.key}
                className="rounded-xl border border-border bg-card/40 min-h-[300px]"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="text-sm font-semibold">{col.title}</div>
                  <div className="text-xs text-muted-foreground">{items.length}</div>
                </div>
                <div className="p-3 space-y-3">
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                      Nothing here yet.
                    </div>
                  )}
                  {items.map((s) => {
                    const ms = state.milestones.find((m) => m.id === s.milestoneId);
                    return (
                      <Link
                        key={s.id}
                        href={`/specs/${s.id}`}
                        className="block rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {s.id}
                          </span>
                          {s.warning && (
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                          )}
                        </div>
                        <div className="text-sm font-medium mt-0.5">{s.title}</div>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <PriorityPill priority={s.priority} />
                          <span className="text-[10px] text-muted-foreground">{ms?.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Bot className="h-3 w-3" /> {s.acceptanceCriteria.length} AC
                          </span>
                          {s.gitSyncedAt && (
                            <span className="inline-flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />synced
                            </span>
                          )}
                          {s.assigneeId && <UserAvatar name={s.assigneeId} size={18} />}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
