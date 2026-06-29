import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { useDemoStore } from "@/lib/demo-store";
import { StatusPill, PriorityPill, UserAvatar } from "@/components/app/Pills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { users } from "@/lib/reference-data";
import type { SpecStatus } from "@/types/demo";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { NewRequestModal } from "@/components/shared/NewRequestModal";

export const Route = createFileRoute("/backlog")({
  head: () => ({ meta: [{ title: "Backlog — SpecPilot" }] }),
  component: BacklogPage,
});

const filters: Record<string, SpecStatus[] | null> = {
  All: null,
  Requests: ["request"],
  Drafts: ["draft"],
  Review: ["review"],
  Approved: ["approved", "build_queue", "in_development", "developer_review", "preview", "stakeholder_review", "accepted", "done"],
};

function BacklogPage() {
  const { state } = useDemoStore();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const f = filters[tab];
    return state.specs.filter((s) => {
      if (f && !f.includes(s.status)) return false;
      if (q) {
        const t = q.toLowerCase();
        return s.title.toLowerCase().includes(t) || s.id.toLowerCase().includes(t);
      }
      return true;
    });
  }, [state.specs, tab, q]);

  return (
    <AppShell>
      <PageHeader
        title="Backlog"
        description="Requests and specs before planning or building."
        actions={
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Request
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {Object.keys(filters).map((k) => (
                <TabsTrigger key={k} value={k}>{k}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by title or ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8 h-9 bg-card"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px_100px_100px_80px] gap-4 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <div>Title</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Owner</div>
            <div>Lane</div>
            <div>Milestone</div>
            <div className="text-right">Updated</div>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No specs match this filter.
            </div>
          )}
          {filtered.map((s) => {
            const owner = users.find((u) => u.id === s.ownerId);
            const ms = state.milestones.find((m) => m.id === s.milestoneId);
            return (
              <Link
                key={s.id}
                to="/specs/$id"
                params={{ id: s.id }}
                className="block md:grid grid-cols-[1fr_120px_100px_80px_100px_100px_80px] gap-4 px-4 py-3.5 items-center border-b border-border last:border-0 hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                    <span className="font-medium truncate">{s.title}</span>
                    {s.warning && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.summary}</p>
                </div>
                <div className="mt-2 md:mt-0"><StatusPill status={s.status} /></div>
                <div className="mt-2 md:mt-0"><PriorityPill priority={s.priority} /></div>
                <div className="mt-2 md:mt-0">{owner && <UserAvatar name={owner.name} />}</div>
                <div className="mt-2 md:mt-0 text-xs text-muted-foreground">{s.roadmapLane}</div>
                <div className="mt-2 md:mt-0 text-xs text-muted-foreground">{ms?.name}</div>
                <div className="mt-2 md:mt-0 text-xs text-muted-foreground text-right">{s.updatedAt}</div>
              </Link>
            );
          })}
        </div>
      </div>
      <NewRequestModal open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}
