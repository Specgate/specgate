import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useDemoStore } from "@/lib/demo-store";
import { StatusPill, PriorityPill, UserAvatar } from "@/components/app/Pills";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle, ArrowLeft, Bot, CheckCircle2, Copy, Download, GitBranch, MessageSquare,
  Sparkles, FileText, Code2, ListChecks, Send, Eye, PlayCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { users } from "@/lib/mock-data";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import type { Spec, SpecStatus } from "@/types/demo";
import {
  addPreviewUrlForSpec,
  generateAgentContextForSpec,
  runSpecCodeCheckForSpec,
  syncSpecToGit,
} from "@/lib/specgate-api";

export const Route = createFileRoute("/specs/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — SpecPilot` }] }),
  component: SpecDetail,
});

function SpecDetail() {
  const { id } = Route.useParams();
  const { state, updateSpec, setSpecStatus, addComment } = useDemoStore();
  const navigate = useNavigate();
  const spec = state.specs.find((s) => s.id === id);
  const comments = state.comments.filter((c) => c.specId === id);

  const [agentContext, setAgentContext] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  if (!spec) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Spec not found</h2>
          <p className="text-muted-foreground mt-2 text-sm">{id} was not returned by the SpecGate API.</p>
          <Button asChild className="mt-4"><Link to="/backlog">Back to backlog</Link></Button>
        </div>
      </AppShell>
    );
  }

  const owner = users.find((u) => u.id === spec.ownerId);
  const ms = state.milestones.find((m) => m.id === spec.milestoneId);

  async function generate() {
    try {
      setGenerating(true);
      const response = await generateAgentContextForSpec(spec!);
      setAgentContext(response.data.markdown);
      toast.success("Agent context generated from approved spec.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate agent context.");
    } finally {
      setGenerating(false);
    }
  }

  async function runCheck() {
    try {
      toast.loading("Running spec-code check...", { id: "check" });
      const response = await runSpecCodeCheckForSpec(spec!);
      const findings = response.data.mismatchFindings;
      setCheckResult(
        findings.length
          ? `${response.data.summary}\n\n${findings
              .map((finding) => `- [${finding.severity}] ${finding.message}${finding.file ? ` (${finding.file})` : ""}`)
              .join("\n")}`
          : response.data.summary,
      );
      toast.dismiss("check");
      toast[findings.length ? "warning" : "success"]("Spec-code check complete.");
    } catch (error) {
      toast.dismiss("check");
      toast.error(error instanceof Error ? error.message : "Spec-code check failed.");
    }
  }

  async function syncToGit() {
    try {
      toast.loading("Syncing to Git...", { id: "sync" });
      await syncSpecToGit(spec!);
      await updateSpec(spec!.id, { gitSyncedAt: new Date().toISOString().slice(0, 10) });
      toast.dismiss("sync");
      toast.success("Spec synced to Git.");
    } catch (error) {
      toast.dismiss("sync");
      toast.error(error instanceof Error ? error.message : "Git sync failed.");
    }
  }

  return (
    <AppShell>
      <div className="border-b border-border px-6 py-5">
        <Link to="/backlog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3" /> Backlog
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{spec.id}</span>
              <StatusPill status={spec.status} />
              <PriorityPill priority={spec.priority} />
              <span className="text-xs text-muted-foreground">· {spec.roadmapLane}</span>
              <span className="text-xs text-muted-foreground">· {ms?.name}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{spec.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {owner && (
                <span className="inline-flex items-center gap-1.5"><UserAvatar name={owner.name} size={18} /> Owner: {owner.name}</span>
              )}
              {spec.gitSyncedAt && <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" /> Synced {spec.gitSyncedAt}</span>}
            </div>
          </div>
          <StatusActions
            spec={spec}
            syncToGit={syncToGit}
            setStatus={(st) => {
              void setSpecStatus(spec.id, st)
                .then(() => toast.success("Status updated."))
                .catch((error) => toast.error(error instanceof Error ? error.message : "Status update failed."));
            }}
            navigate={navigate}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 p-6">
        <div>
          <Tabs defaultValue="simple">
            <TabsList>
              <TabsTrigger value="simple"><FileText className="h-3.5 w-3.5 mr-1" />Simple</TabsTrigger>
              <TabsTrigger value="technical"><Code2 className="h-3.5 w-3.5 mr-1" />Technical</TabsTrigger>
              <TabsTrigger value="agent"><Bot className="h-3.5 w-3.5 mr-1" />Agent Context</TabsTrigger>
              <TabsTrigger value="activity"><ListChecks className="h-3.5 w-3.5 mr-1" />Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="mt-5 space-y-5">
              <Section title="What we will build">{spec.expectedBehavior ?? spec.summary}</Section>
              {spec.acceptanceCriteria.length > 0 && (
                <Section title="Success checklist">
                  <ul className="space-y-1.5">
                    {spec.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />{c}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {spec.outOfScope.length > 0 && (
                <Section title="Out of scope">
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {spec.outOfScope.map((c, i) => (
                      <li key={i}>· {c}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {spec.openQuestions && spec.openQuestions.length > 0 && (
                <Section title="Open questions">
                  <ul className="space-y-1.5 text-sm">
                    {spec.openQuestions.map((q, i) => (
                      <li key={i} className="text-amber-300">? {q}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </TabsContent>

            <TabsContent value="technical" className="mt-5">
              <pre className="rounded-lg border border-border bg-[#0b0d12] p-5 text-xs leading-6 font-mono overflow-auto">{technicalView(spec)}</pre>
            </TabsContent>

            <TabsContent value="agent" className="mt-5 space-y-4">
              {!agentContext ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <Bot className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="mt-3 font-medium">Generate Agent Context</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    Create a scoped context packet for Cursor, Claude Code, or Codex from the approved spec.
                  </p>
                  <Button onClick={generate} disabled={generating} className="mt-4 gap-1.5">
                    <Sparkles className="h-4 w-4" /> {generating ? "Generating…" : "Generate Agent Context"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(agentContext, "Copied for Cursor.")}><Copy className="h-3.5 w-3.5" />Copy for Cursor</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(agentContext, "Copied for Claude Code.")}><Copy className="h-3.5 w-3.5" />Copy for Claude Code</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success("Downloaded .context.md")}><Download className="h-3.5 w-3.5" />Download .context.md</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success(`Created branch feature/${spec.id.toLowerCase()}`)}><GitBranch className="h-3.5 w-3.5" />Create branch</Button>
                  </div>
                  <pre className="rounded-lg border border-border bg-[#0b0d12] p-5 text-xs leading-6 font-mono overflow-auto">{agentContext}</pre>
                  <Button variant="outline" onClick={runCheck} className="gap-1.5"><PlayCircle className="h-4 w-4" />Run spec-code check</Button>
                  {checkResult && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm whitespace-pre-wrap">
                      {checkResult}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-5">
              <div className="rounded-xl border border-border bg-card divide-y divide-border">
                {state.activities.filter((a) => a.specId === spec.id).map((a) => (
                  <div key={a.id} className="p-3.5 text-sm flex justify-between">
                    <span>{a.text}</span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                ))}
                {state.activities.filter((a) => a.specId === spec.id).length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">No activity yet.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> SpecPilot AI
            </div>
            {spec.warning ? (
              <>
                <p className="mt-2 text-sm">I found a possible mismatch:</p>
                <p className="mt-1 text-sm text-muted-foreground">{spec.warning}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("The approved spec sets 14-day expiry. One test fixture uses 7. Align fixtures with the spec.")}>Explain mismatch</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success("Fix checklist created.")}>Create fix checklist</Button>
                    <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => { void updateSpec(spec.id, { warning: undefined }); toast.success("Mismatch marked resolved."); }}>Mark as resolved</Button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">This spec looks clean. Ready for the next step.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" /> Comments
            </div>
            <div className="divide-y divide-border">
              {comments.map((c) => {
                const u = users.find((u) => u.id === c.authorId);
                return (
                  <div key={c.id} className="p-3.5">
                    <div className="flex items-center gap-2 text-xs">
                      {u && <UserAvatar name={u.name} size={18} />}
                      <span className="font-medium">{u?.name}</span>
                      <span className="text-muted-foreground">{c.createdAt}</span>
                    </div>
                    <p className="text-sm mt-1.5">{c.text}</p>
                  </div>
                );
              })}
              {comments.length === 0 && (
                <div className="p-4 text-xs text-muted-foreground text-center">No comments yet.</div>
              )}
            </div>
            <div className="p-3 border-t border-border space-y-2">
              <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment…" rows={2} className="text-sm" />
              <Button size="sm" className="w-full gap-1.5" onClick={() => {
                if (!newComment.trim()) return;
                void addComment({ id: `c-${Date.now()}`, specId: spec.id, authorId: "u-ha", text: newComment, createdAt: new Date().toISOString().slice(0, 10) })
                  .then(() => {
                    setNewComment("");
                    toast.success("Comment added.");
                  })
                  .catch((error) => toast.error(error instanceof Error ? error.message : "Could not add comment."));
              }}>
                <Send className="h-3.5 w-3.5" /> Comment
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">Decisions</div>
            <ul className="p-4 space-y-2">
              {spec.decisions.length === 0 && <li className="text-xs text-muted-foreground">No decisions recorded.</li>}
              {spec.decisions.map((d) => (
                <li key={d.id} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{d.text}</li>
              ))}
            </ul>
          </div>

          {spec.relatedFiles && spec.relatedFiles.length > 0 && (
            <div className="rounded-xl border border-border bg-card">
              <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">Related files</div>
              <ul className="p-4 space-y-1.5 font-mono text-xs">
                {spec.relatedFiles.map((f) => <li key={f} className="text-muted-foreground">{f}</li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function copy(text: string, msg: string) {
  try { navigator.clipboard.writeText(text); } catch {}
  toast.success(msg);
}

function technicalView(spec: Spec): string {
  const s = spec;
  return `---
id: ${s.id}
title: ${s.title}
status: ${s.status}
priority: ${s.priority}
roadmap_lane: ${s.roadmapLane}
target_milestone: ${s.milestoneId}
${s.approvedAt ? `approved_at: ${s.approvedAt}\n` : ""}${s.gitSyncedAt ? `git_synced_at: ${s.gitSyncedAt}\n` : ""}---

# ${s.title}

## Problem
${s.problem ?? s.summary}

## Expected Behavior
${s.expectedBehavior ?? s.summary}

## Acceptance Criteria
${(s.acceptanceCriteria as string[]).map((c) => `- ${c}`).join("\n") || "- (none)"}

## Out of Scope
${(s.outOfScope as string[]).map((c) => `- ${c}`).join("\n") || "- (none)"}

${s.technicalNotes ? `## Technical Notes\n${s.technicalNotes}\n` : ""}`;
}

function StatusActions({
  spec, syncToGit, setStatus, navigate,
}: {
  spec: Spec;
  syncToGit: () => Promise<void>;
  setStatus: (s: SpecStatus) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const actions: Record<SpecStatus, { label: string; onClick: () => void; variant?: "default" | "outline" }[]> = {
    request: [
      { label: "Clarify with AI", onClick: () => toast.success("Clarifying questions generated."), variant: "outline" },
      { label: "Create Draft Spec", onClick: () => setStatus("draft") },
    ],
    draft: [
      { label: "Ask AI to Improve", onClick: () => toast.success("AI suggestions added."), variant: "outline" },
      { label: "Move to Review", onClick: () => setStatus("review") },
    ],
    review: [
      { label: "Request Changes", onClick: () => setStatus("draft"), variant: "outline" },
      { label: "Approve Spec", onClick: () => setStatus("approved") },
    ],
    approved: [
      { label: "Sync to Git", onClick: syncToGit, variant: "outline" },
      { label: "Add to Build Queue", onClick: () => setStatus("build_queue") },
    ],
    build_queue: [
      { label: "Create Branch", onClick: () => toast.success("Branch created."), variant: "outline" },
      { label: "Start Development", onClick: () => setStatus("in_development") },
    ],
    in_development: [
      { label: "Link PR", onClick: () => toast.success("PR linked."), variant: "outline" },
      { label: "Move to Developer Review", onClick: () => setStatus("developer_review") },
    ],
    developer_review: [
      { label: "Request Code Changes", onClick: () => setStatus("in_development"), variant: "outline" },
      { label: "Approve for Preview", onClick: () => setStatus("preview") },
    ],
    preview: [
      {
        label: "Add Preview URL",
        onClick: () => {
          void addPreviewUrlForSpec(spec, `https://staging.launchos.dev/${spec.id.toLowerCase()}`)
            .then(() => toast.success("Preview URL saved."))
            .catch((error) => toast.error(error instanceof Error ? error.message : "Could not save preview URL."));
        },
        variant: "outline",
      },
      { label: "Send to Stakeholder Review", onClick: () => setStatus("stakeholder_review") },
    ],
    stakeholder_review: [
      { label: "Open Preview", onClick: () => navigate({ to: "/preview" }), variant: "outline" },
      { label: "Approve", onClick: () => setStatus("accepted") },
    ],
    accepted: [
      { label: "Generate Release Notes", onClick: () => toast.success("Release notes generated."), variant: "outline" },
      { label: "Mark Done", onClick: () => setStatus("done") },
    ],
    done: [],
  };
  const a = actions[spec.status];
  return (
    <div className="flex flex-wrap gap-2">
      {a.map((act) => (
        <Button key={act.label} variant={act.variant ?? "default"} size="sm" onClick={act.onClick}>
          {act.label}
        </Button>
      ))}
    </div>
  );
}
