import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DemoState, Spec, SpecStatus, Comment, Activity, DemoMode, RoadmapLane } from "@/types/demo";
import { initialState } from "./mock-data";
import {
  addSpecComment,
  createSpec,
  loadWorkspaceState,
  moveSpecLane,
  resetAndSeedDemo,
  runStatusAction,
  updateSpec as updateSpecApi,
} from "./specgate-api";

const STORAGE_KEY = "specpilot-demo-state";
const MODE_STORAGE_KEY = "specpilot-mode";

interface DemoStoreContext {
  state: DemoState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setMode: (mode: DemoMode) => void;
  setProject: (id: string) => Promise<void>;
  updateSpec: (id: string, patch: Partial<Spec>) => Promise<void>;
  setSpecStatus: (id: string, status: SpecStatus) => Promise<void>;
  setSpecLane: (id: string, lane: RoadmapLane) => Promise<void>;
  addSpec: (spec: Spec) => Promise<Spec>;
  addComment: (c: Comment) => Promise<void>;
  addActivity: (a: Activity) => void;
  reset: () => Promise<void>;
}

const Ctx = createContext<DemoStoreContext | null>(null);

function loadMode(): DemoMode {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    if (raw === "team" || raw === "solo") return raw;
  } catch {}
  return initialState.mode;
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(projectId = state.currentProjectId, mode = state.mode) {
    setLoading(true);
    setError(null);
    try {
      const next = await loadWorkspaceState({ mode, currentProjectId: projectId });
      setState(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load SpecGate data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh(undefined, loadMode());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function findSpec(id: string) {
    const spec = state.specs.find((sp) => sp.id === id);
    if (!spec) throw new Error(`Spec ${id} not found.`);
    return spec;
  }

  const value: DemoStoreContext = {
    state,
    loading,
    error,
    refresh: () => refresh(),
    setMode: (mode) => {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, mode);
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setState((s) => ({ ...s, mode }));
    },
    setProject: async (id) => {
      setState((s) => ({ ...s, currentProjectId: id }));
      await refresh(id, state.mode);
    },
    updateSpec: async (id, patch) => {
      await updateSpecApi(findSpec(id), patch);
      await refresh();
    },
    setSpecStatus: async (id, status) => {
      await runStatusAction(findSpec(id), status);
      await refresh();
    },
    setSpecLane: async (id, lane) => {
      await moveSpecLane(findSpec(id), lane);
      await refresh();
    },
    addSpec: async (spec) => {
      const response = await createSpec(state.currentProjectId, spec);
      await refresh();
      return {
        ...spec,
        id: response.data.specNumber,
        apiId: response.data.id,
        projectId: response.data.projectId,
        updatedAt: response.data.updatedAt.slice(0, 10),
      };
    },
    addComment: async (c) => {
      const spec = findSpec(c.specId);
      await addSpecComment(spec, c.text);
      await refresh();
    },
    addActivity: (a) => setState((s) => ({ ...s, activities: [a, ...s.activities] })),
    reset: async () => {
      localStorage.removeItem(STORAGE_KEY);
      await resetAndSeedDemo();
      await refresh();
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
