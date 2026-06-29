import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DemoState, Spec, SpecStatus, Comment, Activity, DemoMode, RoadmapLane } from "@/types/demo";
import { initialState } from "./mock-data";

const STORAGE_KEY = "specpilot-demo-state";

interface DemoStoreContext {
  state: DemoState;
  setMode: (mode: DemoMode) => void;
  setProject: (id: string) => void;
  updateSpec: (id: string, patch: Partial<Spec>) => void;
  setSpecStatus: (id: string, status: SpecStatus) => void;
  setSpecLane: (id: string, lane: RoadmapLane) => void;
  addSpec: (spec: Spec) => void;
  addComment: (c: Comment) => void;
  addActivity: (a: Activity) => void;
  reset: () => void;
}

const Ctx = createContext<DemoStoreContext | null>(null);

function load(): DemoState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {}
  return initialState;
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const value: DemoStoreContext = {
    state,
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    setProject: (id) => setState((s) => ({ ...s, currentProjectId: id })),
    updateSpec: (id, patch) =>
      setState((s) => ({
        ...s,
        specs: s.specs.map((sp) => (sp.id === id ? { ...sp, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : sp)),
      })),
    setSpecStatus: (id, status) =>
      setState((s) => ({
        ...s,
        specs: s.specs.map((sp) => (sp.id === id ? { ...sp, status, updatedAt: new Date().toISOString().slice(0, 10) } : sp)),
      })),
    setSpecLane: (id, lane) =>
      setState((s) => ({
        ...s,
        specs: s.specs.map((sp) => (sp.id === id ? { ...sp, roadmapLane: lane } : sp)),
      })),
    addSpec: (spec) => setState((s) => ({ ...s, specs: [spec, ...s.specs] })),
    addComment: (c) => setState((s) => ({ ...s, comments: [...s.comments, c] })),
    addActivity: (a) => setState((s) => ({ ...s, activities: [a, ...s.activities] })),
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      setState(initialState);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemoStore must be inside DemoStoreProvider");
  return ctx;
}

export function nextRequestId(specs: Spec[]): string {
  const nums = specs
    .map((s) => parseInt(s.id.replace("REQ-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `REQ-${String(max + 1).padStart(3, "0")}`;
}
