import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { useDemoStore } from "@/lib/demo-store";
import { StatusPill } from "@/components/app/Pills";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, CheckCircle2, MessageSquare, X, AlertTriangle, Send, Globe } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Spec } from "@/types/demo";
import { commentOnPreview, rejectPreview } from "@/lib/specgate-api";

export const Route = createFileRoute("/preview")({
  head: () => ({ meta: [{ title: "Preview — SpecPilot" }] }),
  component: PreviewPage,
});

function PreviewPage() {
  const { state, refresh, setSpecStatus } = useDemoStore();
  const items = state.specs.filter((s) => ["stakeholder_review", "preview", "accepted"].includes(s.status) || s.previewUrl);
  const [open, setOpen] = useState<Spec | null>(null);
  const [reject, setReject] = useState<Spec | null>(null);

  return (
    <AppShell>
      <PageHeader title="Stakeholder Preview" description="Features ready for testing through preview/staging URLs." />
      <div className="p-6 grid md:grid-cols-2 gap-4">
        {items.length === 0 && (
          <div className="md:col-span-2 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Nothing to preview yet. Approved specs that finish developer review show up here.
          </div>
        )}
        {items.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                <StatusPill status={s.status} />
                {s.warning && <span className="inline-flex items-center gap-1 text-xs text-amber-400"><AlertTriangle className="h-3 w-3" /> mismatch</span>}
              </div>
              <Link to="/specs/$id" params={{ id: s.id }} className="block">
                <h3 className="mt-2 text-lg font-semibold hover:text-primary transition-colors">{s.title}</h3>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">{s.summary}</p>
              {s.previewUrl && (
                <div className="mt-3 flex items-center gap-2 text-xs text-cyan-300 font-mono">
                  <Globe className="h-3.5 w-3.5" /> {s.previewUrl}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setOpen(s)} className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Open Preview</Button>
                {s.status === "stakeholder_review" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void setSpecStatus(s.id, "accepted")
                          .then(() => toast.success("Preview approved by stakeholder."))
                          .catch((error) =>
                            toast.error(error instanceof Error ? error.message : "Could not approve preview."),
                          );
                      }}
                      className="gap-1.5 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReject(s)} className="gap-1.5 text-rose-300 border-rose-500/30 hover:bg-rose-500/10">
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <PreviewModal
          spec={open}
          onClose={() => setOpen(null)}
          onApprove={() => {
            void setSpecStatus(open.id, "accepted")
              .then(() => {
                toast.success("Preview approved by stakeholder.");
                setOpen(null);
              })
              .catch((error) =>
                toast.error(error instanceof Error ? error.message : "Could not approve preview."),
              );
          }}
          onComment={(feedback) => commentOnPreview(open, feedback)}
          onReject={() => {
            setReject(open);
            setOpen(null);
          }}
        />
      )}
      {reject && (
        <RejectModal
          spec={reject}
          onClose={() => setReject(null)}
          onSubmit={(reason) => {
            void rejectPreview(reject, reason)
              .then(() => refresh())
              .then(() => {
                toast.warning("Rejected and returned to Developer Review.");
                setReject(null);
              })
              .catch((error) => toast.error(error instanceof Error ? error.message : "Could not reject preview."));
          }}
        />
      )}
    </AppShell>
  );
}

function PreviewModal({
  spec,
  onClose,
  onApprove,
  onComment,
  onReject,
}: {
  spec: Spec;
  onClose: () => void;
  onApprove: () => void;
  onComment: (feedback: string) => Promise<unknown>;
  onReject: () => void;
}) {
  const [comment, setComment] = useState("");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sr-only"><DialogTitle>Preview of {spec.title}</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-[1fr_280px]">
          <div className="bg-[#0b0d12]">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <div className="ml-3 flex-1 rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground font-mono truncate">
                {spec.previewUrl ?? "https://staging.launchos.dev"}
              </div>
              <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">Demo preview only</span>
            </div>
            <div className="p-6 min-h-[420px]">
              <FakeTeamInvite spec={spec} />
            </div>
          </div>
          <div className="border-l border-border bg-card p-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Reviewing</div>
              <div className="font-medium">{spec.id} {spec.title}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Checklist</div>
              <ul className="space-y-1.5">
                {spec.acceptanceCriteria.slice(0, 4).map((c, i) => (
                  <li key={i} className="text-xs flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />{c}</li>
                ))}
              </ul>
            </div>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Leave a comment for the developer…" className="text-sm" />
            <div className="space-y-2">
              <Button size="sm" className="w-full gap-1.5" onClick={onApprove}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => {
                  if (!comment.trim()) {
                    toast.error("Add a comment first.");
                    return;
                  }
                  void onComment(comment)
                    .then(() => {
                      toast.success("Comment sent to developer.");
                      setComment("");
                    })
                    .catch((error) =>
                      toast.error(error instanceof Error ? error.message : "Could not send comment."),
                    );
                }}
              >
                <Send className="h-3.5 w-3.5" />Comment
              </Button>
              <Button size="sm" variant="outline" className="w-full gap-1.5 text-rose-300 border-rose-500/30 hover:bg-rose-500/10" onClick={onReject}><X className="h-3.5 w-3.5" />Reject</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FakeTeamInvite({ spec }: { spec: Spec }) {
  return (
    <div className="max-w-md mx-auto rounded-lg border border-border bg-card p-6 text-foreground">
      <h3 className="text-lg font-semibold">Team Members</h3>
      <p className="text-xs text-muted-foreground mt-1">Invite collaborators by email.</p>
      <div className="mt-5 flex gap-2">
        <input className="flex-1 rounded-md bg-background border border-border px-3 py-2 text-sm" placeholder="teammate@company.com" />
        <button className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">Send Invite</button>
      </div>
      <div className="mt-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-2">
        Invite sent. Link expires in 14 days.
      </div>
      <div className="mt-5 divide-y divide-border border border-border rounded-md">
        {[
          ["Ha", "Owner"],
          ["David", "Developer"],
          ["Anna", "Stakeholder"],
        ].map(([n, r]) => (
          <div key={n} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{n}</span><span className="text-xs text-muted-foreground">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RejectModal({ spec, onClose, onSubmit }: { spec: Spec; onClose: () => void; onSubmit: (r: string) => void }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState(false);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject preview</DialogTitle>
          <DialogDescription>{spec.id} {spec.title} will return to Developer Review.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea value={reason} onChange={(e) => { setReason(e.target.value); setErr(false); }} rows={4} placeholder="What needs to change?" />
          {err && <p className="text-xs text-rose-400">Please add a reason so the developer knows what to fix.</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { if (!reason.trim()) { setErr(true); return; } onSubmit(reason); }}>Submit rejection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
