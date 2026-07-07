const fs = require('fs');

const content = `import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useDemoStore } from "@/lib/demo-store";
import { StatusPill, PriorityPill, UserAvatar } from "@/components/app/Pills";
import { Button } from "@corely/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@corely/ui";
import {
  AlertTriangle, ArrowLeft, Bot, CheckCircle2, Copy, Download, GitBranch, MessageSquare,
  Sparkles, FileText, Code2, ListChecks, Send, Eye, PlayCircle, Pencil, Clock3
} from "lucide-react";
import { useMemo, useState } from "react";
import { users, milestones } from "@/lib/mock-data";
import { generateAgentContext, runSpecCodeCheck, fakeDelay } from "@/lib/mock-ai";
import { toast } from "sonner";
import { Textarea } from "@corely/ui";
import { Badge } from "@corely/ui";
import { Alert, AlertDescription, AlertTitle } from "@corely/ui";
import { validateAgentReadiness } from "@/lib/agent-readiness";
import type { SpecStatus } from "@/types/demo";

export const Route = createFileRoute("/specs/$id")({
  head: ({ params }) => ({ meta: [{ title: \`\${params.id} — SpecGate\` }] }),
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
          <p className="text-muted-foreground mt-2 text-sm">{id} doesn't exist in the demo data.</p>
          <Button asChild className="mt-4"><Link to="/backlog">Back to backlog</Link></Button>
        </div>
      </AppShell>
    );
  }

  const readiness = validateAgentReadiness(spec);
  const badgeProps = {
    ready_for_agent: { label: "Ready for agent", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    needs_clarification: { label: "Needs clarification", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    draft: { label: "Draft", color: "bg-secondary text-secondary-foreground" },
    blocked: { label: "Blocked", color: "bg-destructive/10 text-destructive border-destructive/20" }
  };
  const currentBadge = badgeProps[(spec.agentReadiness || readiness.status) as keyof typeof badgeProps] || badgeProps.draft;

  const owner = users.find((u) => u.id === spec.ownerId);
  const ms = milestones.find((m) => m.id === spec.milestoneId);

  async function generate() {
    setGenerating(true);
    await fakeDelay(700);
    setAgentContext(generateAgentContext(spec!));
    setGenerating(false);
    toast.success("Agent context generated from approved spec.");
  }

  async function runCheck() {
    toast.loading("Running spec-code check…", { id: "check" });
    await fakeDelay(900);
    const r = runSpecCodeCheck(spec!);
    setCheckResult(r.message);
    toast.dismiss("check");
    toast[r.ok ? "success" : "warning"]("Spec-code check complete.");
  }

  async function syncToGit() {
    toast.loading("Syncing to Git…", { id: "sync" });
    await fakeDelay(800);
    updateSpec(spec!.id, { gitSyncedAt: new Date().toISOString().slice(0, 10) });
    toast.dismiss("sync");
    toast.success("Spec synced to Git.");
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
                <span className="inline-flex items-center gap-1.5"><UserAvatar name={owner.name} size={18} /> Requester: {owner.name}</span>
              )}
              {spec.updatedAt && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Updated {spec.updatedAt}</span>}
              {spec.gitSyncedAt && <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" /> Synced {spec.gitSyncedAt}</span>}
              <Badge variant="outline" className={\`ml-2 \${currentBadge.color}\`}>{currentBadge.label}</Badge>
            </div>
          </div>
          <StatusActions spec={spec} syncToGit={syncToGit} setStatus={(st) => { setSpecStatus(spec.id, st); toast.success("Status updated."); }} navigate={navigate} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 p-6">
        <div>
          <Tabs defaultValue="business">
            <TabsList>
              <TabsTrigger value="business"><FileText className="h-3.5 w-3.5 mr-1" />Business Spec</TabsTrigger>
              <TabsTrigger value="agent"><Bot className="h-3.5 w-3.5 mr-1" />Agent Handoff</TabsTrigger>
              <TabsTrigger value="checks"><Code2 className="h-3.5 w-3.5 mr-1" />Checks</TabsTrigger>
              <TabsTrigger value="activity"><ListChecks className="h-3.5 w-3.5 mr-1" />Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="mt-5 space-y-5">
              <Section title="Goal / Summary">
                {spec.summary || <span className="text-muted-foreground italic">No goal provided.</span>}
              </Section>
              
              <Section title="Background / Business context">
                {spec.problem || <span className="text-muted-foreground italic">No background provided.</span>}
              </Section>

              <Section title="Current behavior">
                <span className="text-muted-foreground italic">Not specified</span>
              </Section>
              
              <Section title="Desired outcome">
                {spec.expectedBehavior || <span className="text-muted-foreground italic">No desired outcome provided.</span>}
              </Section>

              <Section title="Acceptance criteria">
                {spec.acceptanceCriteria && spec.acceptanceCriteria.filter(c => c.trim() !== "" && c.trim() !== "(none)").length > 0 ? (
                  <ul className="space-y-1.5">
                    {spec.acceptanceCriteria.filter(c => c.trim() !== "" && c.trim() !== "(none)").map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground text-sm italic">No acceptance criteria yet. Add at least one before agent handoff.</div>
                )}
              </Section>
              
              <Section title="Out of scope">
                {spec.outOfScope && spec.outOfScope.filter(c => c.trim() !== "" && c.trim() !== "(none)").length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {spec.outOfScope.filter(c => c.trim() !== "" && c.trim() !== "(none)").map((c, i) => (
                      <li key={i}>· {c}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground text-sm italic">No out-of-scope boundaries yet.</div>
                )}
              </Section>

              <Section title="Open questions">
                {spec.openQuestions && spec.openQuestions.filter(q => q.trim() !== "").length > 0 ? (
                  <ul className="space-y-1.5 text-sm">
                    {spec.openQuestions.filter(q => q.trim() !== "").map((q, i) => {
                      const isNonBlocking = q.toLowerCase().includes("non-blocking");
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 font-medium">?</span>
                          <span className={isNonBlocking ? "text-muted-foreground" : "text-amber-300"}>{q}</span>
                          {isNonBlocking ? (
                            <Badge variant="outline" className="text-[10px] h-5 ml-1">Non-blocking</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-5 ml-1 border-red-500/20 text-red-400">Blocking</Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-muted-foreground text-sm italic">No open questions.</div>
                )}
              </Section>

              <Section title="UI/UX notes">
                <span className="text-muted-foreground italic">No UI/UX notes provided.</span>
              </Section>
              <Section title="Edge cases">
                <span className="text-muted-foreground italic">No edge cases provided.</span>
              </Section>

              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="gap-1.5" onClick={() => toast.info("Edit spec functionality to be implemented.")}>
                  <Pencil className="h-4 w-4" /> Edit spec
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="agent" className="mt-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Agent Readiness:</span>
                <Badge variant="outline" className={currentBadge.color}>{currentBadge.label}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {readiness.status === "ready_for_agent" 
                  ? "This request has enough structure for a coding agent handoff." 
                  : "Complete the missing fields before handing this to a coding agent."}
              </p>

              {readiness.missingFields.length > 0 && (
                <Alert variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 stroke-amber-600" />
                  <AlertTitle className="text-sm">Missing Readiness Items</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 text-xs mt-2">
                      {readiness.missingFields.map((field, i) => <li key={i}>{field}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {!agentContext ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center mt-6">
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
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={readiness.status !== "ready_for_agent"} onClick={() => copy(agentContext, "Copied for Claude Code.")}><Copy className="h-3.5 w-3.5" />Copy for Claude Code</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={readiness.status !== "ready_for_agent"} onClick={() => copy(agentContext, "Copied for Codex.")}><Copy className="h-3.5 w-3.5" />Copy for Codex</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={readiness.status !== "ready_for_agent"} onClick={() => copy(agentContext, "Copied for Cursor.")}><Copy className="h-3.5 w-3.5" />Copy for Cursor</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={readiness.status !== "ready_for_agent"} onClick={() => copy(agentContext, "Copied for GitHub issue / Copilot.")}><Copy className="h-3.5 w-3.5" />Copy for Copilot</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(agentContext, "Copied draft Markdown.")}><Copy className="h-3.5 w-3.5" />Copy draft Markdown</Button>
                  </div>
                  {readiness.status !== "ready_for_agent" && <div className="text-xs text-amber-500 font-medium">Warning: Handoff disabled until readiness is met. You can still copy draft markdown.</div>}
                  <pre className="rounded-lg border border-border bg-[#0b0d12] p-5 text-xs leading-6 font-mono overflow-auto mt-4">{agentContext}</pre>
                </>
              )}
            </TabsContent>

            <TabsContent value="checks" className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium flex items-center gap-2"><ListChecks className="h-4 w-4" /> Spec-Code Check <Badge variant="secondary" className="ml-2 font-normal">Demo check</Badge></h3>
                <p className="text-sm text-muted-foreground mt-2">Validate if the implementation matches the approved spec criteria.</p>
                
                <Button onClick={runCheck} className="mt-4 gap-1.5"><PlayCircle className="h-4 w-4" />Run spec-code check</Button>
                
                {checkResult && (
                  <div className={\`mt-6 rounded-lg border p-4 \${spec.warning ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}\`}>
                    <div className="font-medium text-sm flex items-center gap-2 mb-2">
                      {spec.warning ? <><AlertTriangle className="h-4 w-4 text-amber-500"/> Warnings detected</> : <><CheckCircle2 className="h-4 w-4 text-emerald-500"/> Aligned</>}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{checkResult}</div>
                    <div className="text-xs text-muted-foreground mt-4">Simulated check run at {new Date().toLocaleTimeString()}</div>
                  </div>
                )}
              </div>
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
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> AI Review Panel
            </div>
            
            {readiness.missingFields.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-amber-500">Missing fields:</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  {readiness.missingFields.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            
            {spec.warning ? (
              <>
                <p className="mt-4 text-xs font-medium text-amber-500">Possible code mismatch:</p>
                <p className="mt-1 text-xs text-muted-foreground">{spec.warning}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Explanation generated.")}>Explain mismatch</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success("Fix checklist created.")}>Create fix checklist</Button>
                  <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => { updateSpec(spec.id, { warning: undefined }); toast.success("Mismatch marked resolved."); }}>Mark as resolved</Button>
                </div>
              </>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">No mismatches detected.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Preview
            </div>
            <div className="p-4 space-y-3">
              {spec.previewUrl ? (
                <>
                  <div className="flex items-center justify-between">
                    <a href={spec.previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate mr-2">{spec.previewUrl}</a>
                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => copy(spec.previewUrl!, "Preview URL copied.")}><Copy className="h-3 w-3" /></Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" className="w-full text-xs" onClick={() => toast.success("Preview approved!")}>Approve</Button>
                    <Button size="sm" variant="outline" className="w-full text-xs text-destructive hover:text-destructive" onClick={() => toast.error("Preview rejected. Reason required.")}>Reject</Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3">No preview URL available.</p>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => toast.info("Add preview URL functionality to be implemented.")}>Add Preview URL</Button>
                </div>
              )}
            </div>
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
              <Button size="sm" className="w-full gap-1.5" disabled={!newComment.trim()} onClick={() => {
                if (!newComment.trim()) return;
                addComment({ id: \`c-\${Date.now()}\`, specId: spec.id, authorId: "u-ha", text: newComment.trim(), createdAt: new Date().toISOString().slice(0, 10) });
                setNewComment("");
                toast.success("Comment added.");
              }}>
                <Send className="h-3.5 w-3.5" /> Comment
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">Decisions</div>
            <ul className="p-4 space-y-2">
              {spec.decisions && spec.decisions.length > 0 ? (
                spec.decisions.map((d) => (
                  <li key={d.id} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{d.text}</li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground text-center">No decisions recorded yet.</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">Related files</div>
            {spec.relatedFiles && spec.relatedFiles.length > 0 ? (
              <ul className="p-4 space-y-1.5 font-mono text-xs">
                {spec.relatedFiles.map((f) => (
                  <li key={f} className="text-muted-foreground flex items-center justify-between group">
                    <span className="truncate">{f}</span>
                    <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copy(f, "File path copied.")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-xs text-muted-foreground text-center">No related files yet. Add paths or search terms before agent handoff.</div>
            )}
          </div>
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

function StatusActions({
  spec, syncToGit, setStatus, navigate,
}: {
  spec: { id: string; status: SpecStatus };
  syncToGit: () => void;
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
      { label: "Add Preview URL", onClick: () => toast.success("Preview URL saved."), variant: "outline" },
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
  const a = actions[spec.status] || [];
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
`;
fs.writeFileSync('apps/web/src/routes/specs.$id.tsx', content);
