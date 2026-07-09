"use client";

import { PageHeader } from "@/components/app-shell/SpecGateAppShell";
import { useSpecGateQueryStore } from "@/lib/specgate-query";
import { Button } from "@corely/ui";
import { Progress } from "@corely/ui";
import { CalendarRange, Sparkles, AlertTriangle } from "lucide-react";
import { StatusPill } from "@/components/app/Pills";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@corely/ui";
import { summarizeBuildCycle } from "@/lib/specgate-api";
import Link from "next/link";

export default function BuildCyclesPage(): any {
  const { state } = useSpecGateQueryStore();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");

  async function openSummary(cycleId: string) {
    setOpen(true);
    setSummary("Loading summary...");
    try {
      const response = await summarizeBuildCycle(cycleId);
      setSummary(`Cycle includes ${response.data.specCount} queued specs.`);
    } catch (error) {
      setSummary(
        error instanceof Error ? error.message : "Could not summarize build cycle.",
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Build Cycles"
        description="Lightweight weekly cycles. Optional and skippable."
      />
      <div className="p-6 space-y-6">
        {state.buildCycles.map((cycle) => {
          const cycleSpecs = state.specs.filter((s) => cycle.specIds.includes(s.id));
          const done = cycleSpecs.filter(
            (s) => s.status === "done" || s.status === "accepted",
          ).length;
          const total = cycleSpecs.length || 1;
          const pct = Math.round((done / total) * 100);
          return (
            <div key={cycle.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-primary" />
                      <h2 className="text-lg font-semibold">{cycle.name}</h2>
                      <span
                        className={`text-xs rounded-full border px-2 py-0.5 ${
                          cycle.status === "active"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {cycle.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{cycle.goal}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cycle.startDate} → {cycle.endDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void openSummary(cycle.id)}
                      className="gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />AI summarize cycle
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{done} of {total} done</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                {cycleSpecs.map((s) => (
                  <Link
                    key={s.id}
                    href={`/specs/${s.id}`}
                    className="rounded-lg border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground">{s.id}</span>
                      <StatusPill status={s.status} />
                      {s.warning && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                    </div>
                    <div className="text-sm font-medium mt-1.5">{s.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Build cycle summary</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border border-border">
            {summary}
          </pre>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
