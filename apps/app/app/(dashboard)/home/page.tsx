"use client";

import { PageHeader } from "@/components/app-shell/SpecGateAppShell";
import { useSpecGateQueryStore } from "@/lib/specgate-query";
import { StatusPill, PriorityPill } from "@/components/app/Pills";
import { AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@corely/ui";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";

export default function HomePage(): any {
  const { state } = useSpecGateQueryStore();
  const { user } = useAuth();
  const specs = state.specs;
  const stats = {
    total: specs.length,
    approved: specs.filter((s) =>
      ["approved", "build_queue", "in_development", "developer_review", "preview", "stakeholder_review", "accepted", "done"].includes(s.status),
    ).length,
    inDev: specs.filter((s) => s.status === "in_development").length,
    preview: specs.filter((s) => s.status === "stakeholder_review" || s.status === "preview").length,
    mismatches: specs.filter((s) => s.warning).length,
  };

  const attention = specs
    .filter((spec) => spec.warning || ["review", "stakeholder_review", "developer_review"].includes(spec.status))
    .slice(0, 3);

  const suggestions = [
    `${stats.approved} approved specs are available for planning or delivery.`,
    `${stats.preview} specs are ready for preview review.`,
    `${stats.mismatches} specs have warnings that should be reviewed.`,
  ];

  const activeProject = state.projects.find((project) => project.id === state.currentProjectId);
  const greetingMode = state.mode === "team" ? "team workflow" : "personal build queue";

  return (
    <>
      <PageHeader
        title={`Good morning${user?.name ? `, ${user.name}` : ""}`}
        description={`${activeProject?.name ?? "Your project"} is moving through ${greetingMode}.`}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { l: "Total specs", v: stats.total },
            { l: "Approved", v: stats.approved, c: "text-emerald-400" },
            { l: "In development", v: stats.inDev, c: "text-violet-400" },
            { l: "Ready for preview", v: stats.preview, c: "text-cyan-400" },
            { l: "Mismatches", v: stats.mismatches, c: "text-amber-400" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={`mt-1 text-2xl font-semibold ${s.c ?? ""}`}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Needs attention
            </h2>
            <div className="space-y-3">
              {attention.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No specs need attention right now.
                </div>
              )}
              {attention.map((s) => (
                <Link
                  key={s.id}
                  href={`/specs/${s.id}`}
                  className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                        <span className="font-medium">{s.title}</span>
                        <StatusPill status={s.status} />
                        <PriorityPill priority={s.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">{s.summary}</p>
                      {s.warning && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" /> Spec-code mismatch detected
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-8">
              Workflow progress
            </h2>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                {["Request", "Spec", "Approved", "Agent", "Review", "Preview", "Done"].map(
                  (step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-semibold ${i < 5 ? "bg-primary/20 text-primary border border-primary/40" : "border border-border text-muted-foreground"}`}
                      >
                        {i + 1}
                      </div>
                      <span className={i < 5 ? "text-foreground" : "text-muted-foreground"}>
                        {step}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI planning suggestions
            </h2>
            <div className="rounded-xl border border-primary/30 bg-primary/5 divide-y divide-border">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3.5">
                  <p className="text-sm">{s}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs gap-1"
                      onClick={() => toast.success("Suggestion applied.")}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => toast.info("Dismissed.")}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-6">
              Recent activity
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {state.activities.slice(0, 6).map((a) => (
                <div key={a.id} className="p-3 text-sm flex items-start justify-between gap-2">
                  <span>{a.text}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
