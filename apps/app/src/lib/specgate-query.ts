"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Activity, Comment, DemoMode, DemoState, RoadmapLane, Spec, SpecStatus } from "@/types/specgate";
import {
  addSpecComment,
  createSpec,
  getSpecRelatedData,
  loadWorkspaceState,
  moveSpecLane,
  resetAndSeedDemo,
  runStatusAction,
  updateSpec as updateSpecApi,
} from "./specgate-api";

type SpecGateSelection = {
  mode: DemoMode;
  currentWorkspaceId?: string;
  currentProjectId?: string;
};

type SpecGateQueryStore = {
  state: DemoState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadSpecDetails: (id: string) => Promise<void>;
  setMode: (mode: DemoMode) => void;
  setWorkspace: (id: string) => Promise<void>;
  setProject: (id: string) => Promise<void>;
  updateSpec: (id: string, patch: Partial<Spec>) => Promise<void>;
  setSpecStatus: (id: string, status: SpecStatus) => Promise<void>;
  setSpecLane: (id: string, lane: RoadmapLane) => Promise<void>;
  addSpec: (spec: Spec) => Promise<Spec>;
  addComment: (comment: Comment) => Promise<void>;
  addActivity: (activity: Activity) => void;
  reset: () => Promise<void>;
};

const specGateKeys = {
  selection: ["specgate", "selection"] as const,
  workspace: (selection: SpecGateSelection) =>
    [
      "specgate",
      "workspace",
      selection.mode,
      selection.currentWorkspaceId ?? "",
      selection.currentProjectId ?? "",
    ] as const,
};

const emptyState: DemoState = {
  mode: "team",
  currentWorkspaceId: "",
  currentProjectId: "",
  workspaces: [],
  projects: [],
  specs: [],
  comments: [],
  decisions: [],
  assets: [],
  specChecks: [],
  previewReviews: [],
  activities: [],
  buildCycles: [],
  milestones: [],
};

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : error ? "Unable to load SpecGate data." : null;
}

export function useSpecGateQueryStore(): SpecGateQueryStore {
  const queryClient = useQueryClient();
  const selectionQuery = useQuery({
    queryKey: specGateKeys.selection,
    queryFn: async (): Promise<SpecGateSelection> => ({ mode: "team" }),
    initialData: { mode: "team" },
    staleTime: Infinity,
  });

  const selection = selectionQuery.data;
  const workspaceQuery = useQuery({
    queryKey: specGateKeys.workspace(selection),
    queryFn: () =>
      loadWorkspaceState({
        mode: selection.mode,
        currentProjectId: selection.currentProjectId,
        currentWorkspaceId: selection.currentWorkspaceId,
      }),
  });

  useEffect(() => {
    const state = workspaceQuery.data;
    if (!state) return;
    if (
      state.mode !== selection.mode ||
      state.currentWorkspaceId !== (selection.currentWorkspaceId ?? "") ||
      state.currentProjectId !== (selection.currentProjectId ?? "")
    ) {
      queryClient.setQueryData<SpecGateSelection>(specGateKeys.selection, {
        mode: state.mode,
        currentWorkspaceId: state.currentWorkspaceId || undefined,
        currentProjectId: state.currentProjectId || undefined,
      });
    }
  }, [queryClient, selection, workspaceQuery.data]);

  const invalidateWorkspace = async () => {
    await queryClient.invalidateQueries({ queryKey: ["specgate", "workspace"] });
  };

  const updateSpecMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Spec> }) => {
      await updateSpecApi(findSpec(state, id), patch);
    },
    onSuccess: invalidateWorkspace,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SpecStatus }) => {
      await runStatusAction(findSpec(state, id), status);
    },
    onSuccess: invalidateWorkspace,
  });

  const laneMutation = useMutation({
    mutationFn: async ({ id, lane }: { id: string; lane: RoadmapLane }) => {
      await moveSpecLane(findSpec(state, id), lane);
    },
    onSuccess: invalidateWorkspace,
  });

  const createSpecMutation = useMutation({
    mutationFn: async (spec: Spec) => {
      const response = await createSpec(state.currentProjectId, spec);
      return {
        ...spec,
        id: response.data.specNumber,
        apiId: response.data.id,
        projectId: response.data.projectId,
        updatedAt: response.data.updatedAt.slice(0, 10),
      };
    },
    onSuccess: invalidateWorkspace,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment: Comment) => {
      const spec = findSpec(state, comment.specId);
      await addSpecComment(spec, comment.text, comment.sectionReference ?? null);
    },
    onSuccess: invalidateWorkspace,
  });

  const state = workspaceQuery.data ?? {
    ...emptyState,
    mode: selection.mode,
    currentWorkspaceId: selection.currentWorkspaceId ?? "",
    currentProjectId: selection.currentProjectId ?? "",
  };

  return {
    state,
    loading: workspaceQuery.isLoading,
    error: getErrorMessage(workspaceQuery.error),
    refresh: async () => {
      await workspaceQuery.refetch();
    },
    loadSpecDetails: async (id) => {
      const spec = findSpec(state, id);
      const related = await getSpecRelatedData(spec);
      queryClient.setQueryData<DemoState>(specGateKeys.workspace(selection), (current) => {
        if (!current) return current;
        return {
          ...current,
          comments: [
            ...current.comments.filter((comment) => comment.specId !== id),
            ...related.comments,
          ],
          decisions: [
            ...current.decisions.filter((decision) => decision.specId !== id),
            ...related.decisions,
          ],
          assets: [
            ...current.assets.filter((asset) => asset.specId !== id),
            ...related.assets,
          ],
          specChecks: related.latestCheck
            ? [
                ...current.specChecks.filter((check) => check.specId !== id),
                related.latestCheck,
              ]
            : current.specChecks.filter((check) => check.specId !== id),
          specs: current.specs.map((item) =>
            item.id === id
              ? {
                  ...item,
                  commentCount: related.comments.length,
                  decisionCount: related.decisions.length,
                  assetCount: related.assets.length,
                  latestSpecCheck: related.latestCheck,
                  warning:
                    related.latestCheck && related.latestCheck.status !== "passed"
                      ? related.latestCheck.summary
                      : undefined,
                }
              : item,
          ),
        };
      });
    },
    setMode: (mode) => {
      queryClient.setQueryData<SpecGateSelection>(specGateKeys.selection, {
        ...selection,
        mode,
      });
    },
    setWorkspace: async (id) => {
      queryClient.setQueryData<SpecGateSelection>(specGateKeys.selection, {
        mode: selection.mode,
        currentWorkspaceId: id,
        currentProjectId: undefined,
      });
      await invalidateWorkspace();
    },
    setProject: async (id) => {
      queryClient.setQueryData<SpecGateSelection>(specGateKeys.selection, {
        ...selection,
        currentProjectId: id,
      });
      await invalidateWorkspace();
    },
    updateSpec: async (id, patch) => {
      await updateSpecMutation.mutateAsync({ id, patch });
    },
    setSpecStatus: async (id, status) => {
      await statusMutation.mutateAsync({ id, status });
    },
    setSpecLane: async (id, lane) => {
      await laneMutation.mutateAsync({ id, lane });
    },
    addSpec: (spec) => createSpecMutation.mutateAsync(spec),
    addComment: async (comment) => {
      await addCommentMutation.mutateAsync(comment);
    },
    addActivity: (activity) => {
      queryClient.setQueryData<DemoState>(specGateKeys.workspace(selection), (current) =>
        current ? { ...current, activities: [activity, ...current.activities] } : current,
      );
    },
    reset: async () => {
      await resetAndSeedDemo();
      await invalidateWorkspace();
    },
  };
}

function findSpec(state: DemoState, id: string): Spec {
  const spec = state.specs.find((item) => item.id === id);
  if (!spec) throw new Error(`Spec ${id} not found.`);
  return spec;
}

export function nextRequestId(specs: Spec[]): string {
  const nums = specs
    .map((spec) => Number.parseInt(spec.id.replace("REQ-", ""), 10))
    .filter((num) => !Number.isNaN(num));
  const max = nums.length ? Math.max(...nums) : 0;
  return `REQ-${String(max + 1).padStart(3, "0")}`;
}
