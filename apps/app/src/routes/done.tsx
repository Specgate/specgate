import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { useSpecGateStore } from "@/lib/specgate-store";
import { StatusPill } from "@/components/app/Pills";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitPullRequest, Rocket, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/done")({
  head: () => ({ meta: [{ title: "Done — SpecPilot" }] }),
  component: DonePage,
});

function DonePage() {
  const { state } = useSpecGateStore();
  const done = state.specs.filter((s) => s.status === "done" || s.status === "accepted");
  const [open, setOpen] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Done"
        description="Accepted, released, and shipped items."
        actions={
          <Button onClick={() => setOpen(true)} className="gap-1.5"><Sparkles className="h-4 w-4" />Generate release summary</Button>
        }
      />
      <div className="p-6 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat l="Shipped" v={done.filter((s)=>s.status==="done").length} />
          <Stat l="Accepted" v={done.filter((s)=>s.status==="accepted").length} />
          <Stat l="With preview URL" v={done.filter((s)=>!!s.previewUrl).length} />
          <Stat l="With release notes" v={done.filter((s)=>!!s.releaseNotes).length} />
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {done.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No shipped items yet.</div>}
          {done.map((s) => (
            <Link key={s.id} to="/specs/$id" params={{ id: s.id }} className="block p-5 hover:bg-accent/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                    <span className="font-medium">{s.title}</span>
                    <StatusPill status={s.status} />
                  </div>
                  {s.releaseNotes && <p className="mt-1.5 text-sm text-muted-foreground">{s.releaseNotes}</p>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {s.previewUrl && <span className="inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />Preview</span>}
                  {s.prUrl && <span className="inline-flex items-center gap-1"><GitPullRequest className="h-3 w-3" />PR</span>}
                  <span>{s.updatedAt}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Release summary</DialogTitle></DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border border-border">
{`This release · ${new Date().toLocaleDateString()}

Shipped:
${done.map((s)=>`- ${s.id} ${s.title}`).join("\n") || "- (none yet)"}

Highlights:
- Waitlist signup live on the landing page.
- Team invite flow ready for stakeholder approval.`}
          </pre>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={() => { toast.success("Release notes generated."); setOpen(false); }} className="gap-1.5"><Rocket className="h-4 w-4" />Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Stat({ l, v }: { l: string; v: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className="mt-1 text-2xl font-semibold">{v}</div>
    </div>
  );
}
