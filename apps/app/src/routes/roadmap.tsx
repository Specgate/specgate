import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { useSpecGateStore } from "@/lib/specgate-store";
import { StatusPill, PriorityPill } from "@/components/app/Pills";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { RoadmapLane } from "@/types/specgate";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { suggestRoadmapPlan as suggestRoadmapPlanApi } from "@/lib/specgate-api";

const lanes: RoadmapLane[] = ["Now", "Next", "Later", "Icebox"];

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — SpecPilot" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { state, setSpecLane } = useSpecGateStore();
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");

  async function openSuggestion() {
    setOpen(true);
    setSuggestion("Loading suggestion...");
    try {
      const response = await suggestRoadmapPlanApi(state.currentProjectId);
      setSuggestion(response.data.summary);
    } catch (error) {
      setSuggestion(error instanceof Error ? error.message : "Could not load roadmap suggestion.");
    }
  }

  async function applyPlan() {
    try {
      await Promise.all([
        setSpecLane("REQ-002", "Now"),
        setSpecLane("REQ-004", "Next"),
        setSpecLane("REQ-005", "Later"),
        setSpecLane("REQ-007", "Icebox"),
      ]);
      toast.success("Roadmap suggestions applied.");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply roadmap suggestions.");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Roadmap"
        description="Now / Next / Later / Icebox. Keep planning lightweight."
        actions={
          <Button onClick={openSuggestion} className="gap-1.5">
            <Sparkles className="h-4 w-4" /> AI Suggest Plan
          </Button>
        }
      />
      <div className="p-6 grid lg:grid-cols-4 gap-4">
        {lanes.map((lane) => {
          const items = state.specs.filter((s) => s.roadmapLane === lane);
          return (
            <div key={lane} className="flex flex-col rounded-xl border border-border bg-card/40 min-h-[400px]">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="text-sm font-semibold">{lane}</div>
                <div className="text-xs text-muted-foreground">{items.length}</div>
              </div>
              <div className="flex-1 p-3 space-y-3">
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No specs in this lane yet.
                  </div>
                )}
                {items.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/specs/$id" params={{ id: s.id }} className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] text-muted-foreground">{s.id}</span>
                          {s.warning && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                        </div>
                        <div className="text-sm font-medium mt-0.5">{s.title}</div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.summary}</p>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {lanes.filter((l) => l !== lane).map((l) => (
                            <DropdownMenuItem
                              key={l}
                              onClick={() => {
                                void setSpecLane(s.id, l)
                                  .then(() => toast.success(`Moved to ${l}`))
                                  .catch((error) =>
                                    toast.error(error instanceof Error ? error.message : `Could not move to ${l}`),
                                  );
                              }}
                            >
                              Move to {l}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <StatusPill status={s.status} />
                      <PriorityPill priority={s.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggested roadmap changes</DialogTitle>
            <DialogDescription>AI-generated based on priority and approval status.</DialogDescription>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border border-border">
            {suggestion}
          </pre>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={applyPlan}>Apply suggestions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
