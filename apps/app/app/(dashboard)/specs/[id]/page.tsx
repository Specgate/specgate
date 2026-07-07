"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  FileImage,
  FileText,
  GitBranch,
  ImagePlus,
  LinkIcon,
  ListChecks,
  Loader2,
  MessageSquare,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  X,
  Sparkles,
} from "lucide-react";
import { SpecCopilotModal } from "@/components/app/SpecCopilotModal";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { Button } from "@corely/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@corely/ui";
import { Input } from "@corely/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@corely/ui";
import { Textarea } from "@corely/ui";
import { PriorityPill, StatusPill, UserAvatar } from "@/components/app/Pills";
import { useSpecGateStore } from "@/lib/specgate-store";
import { getUserDisplay } from "@/lib/reference-data";
import type {
  Comment,
  Decision,
  PreviewReview,
  Spec,
  SpecAsset,
  SpecCheck,
  SpecStatus,
} from "@/types/specgate";
import {
  addDecision,
  addPreviewUrlForSpec,
  commentOnPreview,
  deleteSpecAsset,
  dismissComment,
  generateAgentContextForSpec,
  getLatestAgentContextForSpec,
  linkImplementationBranchForSpec,
  linkImplementationPullRequestForSpec,
  rejectPreview,
  resolveComment,
  runSpecCodeCheckForSpec,
  syncSpecToGit,
  updateSpecAsset,
  uploadSpecImage,
} from "@/lib/specgate-api";

const COMMENT_SECTIONS = [
  "General",
  "Summary",
  "Audience",
  "Expected behavior",
  "Acceptance criteria",
  "Out of scope",
  "Open questions",
  "UI notes",
  "Technical notes",
  "Preview",
] as const;

const GUARDED_EDIT_STATUSES: SpecStatus[] = [
  "approved",
  "build_queue",
  "in_development",
  "developer_review",
  "preview",
  "stakeholder_review",
  "accepted",
  "done",
];

type EditorState = {
  title: string;
  summary: string;
  audience: string;
  background: string;
  currentBehavior: string;
  desiredOutcome: string;
  acceptanceCriteria: string[];
  outOfScope: string[];
  openQuestions: string[];
  relatedFiles: string[];
  technicalNotes: string;
  uiNotes: string;
  edgeCases: string[];
  securityNotes: string;
  suggestedSearchTerms: string[];
  verificationPlan: string[];
};

export default function SpecDetailPage(): any {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { state, loading, updateSpec, setSpecStatus, refresh, addComment, loadSpecDetails } =
    useSpecGateStore();
  const spec = state.specs.find((item) => item.id === id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState("simple");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditorState | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [agentContext, setAgentContext] = useState<string | null>(null);
  const [generatingContext, setGeneratingContext] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [draggingImages, setDraggingImages] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentSection, setCommentSection] = useState<string>("General");
  const [commentFilter, setCommentFilter] = useState<"open" | "resolved" | "all">("open");
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionQuestion, setDecisionQuestion] = useState("");
  const [decisionValue, setDecisionValue] = useState("");
  const [assetModal, setAssetModal] = useState<SpecAsset | null>(null);
  const [previewCommentOpen, setPreviewCommentOpen] = useState(false);
  const [previewRejectOpen, setPreviewRejectOpen] = useState(false);
  const [previewFeedback, setPreviewFeedback] = useState("");
  const [previewRejectionReason, setPreviewRejectionReason] = useState("");
  const [targetAgentId, setTargetAgentId] = useState("generic_markdown");
  const [agentTargets, setAgentTargets] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const specComments = useMemo(
    () => state.comments.filter((comment) => comment.specId === id),
    [id, state.comments],
  );
  const specAssets = useMemo(
    () => state.assets.filter((asset) => asset.specId === id),
    [id, state.assets],
  );
  const specDecisions = useMemo(
    () => state.decisions.filter((decision) => decision.specId === id),
    [id, state.decisions],
  );
  const previewReview = useMemo(
    () =>
      state.previewReviews
        .filter((review) => review.specId === id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null,
    [id, state.previewReviews],
  );
  const latestSpecCheck = useMemo(
    () =>
      state.specChecks
        .filter((check) => check.specId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ??
      spec?.latestSpecCheck ??
      null,
    [id, spec?.latestSpecCheck, state.specChecks],
  );

  useEffect(() => {
    if (!spec) return;
    setDraft(seedEditorState(spec));
    setWarningDismissed(false);
    setAgentContext(null);
    void loadSpecDetails(spec.id).catch(() => {});
    void getLatestAgentContextForSpec(spec)
      .then((response) => setAgentContext(response?.data.markdown ?? null))
      .catch(() => {});
    
    import("@/lib/specgate-api").then(({ getAgentTargets, getSpecAgentReadiness }) => {
      getAgentTargets().then((res) => setAgentTargets(res.data)).catch(() => {});
      getSpecAgentReadiness(spec).then((res) => setReadiness(res.data)).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec?.id]);

  const dirty = useMemo(() => {
    if (!spec || !draft) return false;
    return JSON.stringify(seedEditorState(spec)) !== JSON.stringify(draft);
  }, [draft, spec]);

  useEffect(() => {
    if (!dirty || !isEditing) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, isEditing]);

  if (!spec && loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading spec...</div>;
  }

  if (!spec) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Spec not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {id} was not returned by the SpecGate API.
        </p>
        <Button asChild className="mt-4">
          <Link href="/backlog">Back to backlog</Link>
        </Button>
      </div>
    );
  }

  const activeSpec: Spec = spec as any;
  const owner = getUserDisplay(activeSpec.ownerId);
  const assignee = getUserDisplay(activeSpec.assigneeId);
  const milestone = state.milestones.find((item) => item.id === activeSpec.milestoneId);
  const buildCycle = state.buildCycles.find((item) => item.id === activeSpec.buildCycleId);
  const effectiveSpecCheck = !warningDismissed ? latestSpecCheck : null;
  const technicalMarkdown = buildTechnicalMarkdown(activeSpec, specAssets, previewReview);

  async function saveSpec() {
    if (!draft) return;
    try {
      await updateSpec(activeSpec.id, {
        title: draft.title,
        summary: draft.summary,
        audience: draft.audience || undefined,
        background: draft.background || undefined,
        currentBehavior: draft.currentBehavior || undefined,
        desiredOutcome: draft.desiredOutcome || undefined,
        acceptanceCriteria: sanitizeList(draft.acceptanceCriteria),
        outOfScope: sanitizeList(draft.outOfScope),
        openQuestions: sanitizeList(draft.openQuestions),
        relatedFiles: sanitizeList(draft.relatedFiles),
        technicalNotes: draft.technicalNotes || undefined,
        uiNotes: draft.uiNotes || undefined,
        edgeCases: sanitizeList(draft.edgeCases),
        securityNotes: draft.securityNotes || undefined,
        suggestedSearchTerms: sanitizeList(draft.suggestedSearchTerms),
        verificationPlan: sanitizeList(draft.verificationPlan),
      });
      setIsEditing(false);
      setConfirmSaveOpen(false);
      toast.success("Spec updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update spec.");
    }
  }

  async function saveWithGuard() {
    if (!dirty) {
      setIsEditing(false);
      return;
    }
    if (GUARDED_EDIT_STATUSES.includes(activeSpec.status)) {
      setConfirmSaveOpen(true);
      return;
    }
    await saveSpec();
  }

  async function uploadImages(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const allFiles = Array.from(files);
    const imageFiles = allFiles.filter((file) =>
      ["image/png", "image/jpeg", "image/webp"].includes(file.type),
    );
    if (imageFiles.length !== allFiles.length) {
      toast.error("Unsupported file type. Please upload PNG, JPG, or WebP.");
    }

    for (const file of imageFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image is too large. Please upload an image under 10MB.");
        continue;
      }
      setUploadingImages((current) => [...current, file.name]);
      try {
        await uploadSpecImage(activeSpec, file);
        await refresh();
        toast.success(`${file.name} uploaded.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Could not upload ${file.name}.`);
      } finally {
        setUploadingImages((current) => current.filter((name) => name !== file.name));
      }
    }
  }

  async function runCheck() {
    try {
      toast.loading("Running spec-code check...", { id: "spec-check" });
      await runSpecCodeCheckForSpec(activeSpec);
      await refresh();
      setWarningDismissed(false);
      toast.dismiss("spec-check");
      toast.success("Spec-code check complete.");
    } catch (error) {
      toast.dismiss("spec-check");
      toast.error(error instanceof Error ? error.message : "Spec-code check failed.");
    }
  }

  async function generateAgentContext() {
    try {
      setGeneratingContext(true);
      const { generateAgentContextForSpec } = await import("@/lib/specgate-api");
      const response = await generateAgentContextForSpec(activeSpec, targetAgentId);
      setAgentContext(response.data.markdown);
      toast.success("Agent handoff generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate agent handoff.");
    } finally {
      setGeneratingContext(false);
    }
  }

  async function setStatus(status: SpecStatus) {
    try {
      await setSpecStatus(activeSpec.id, status);
      toast.success("Status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update status.");
    }
  }

  async function addSpecCommentFromForm() {
    if (!commentBody.trim()) {
      toast.error("Add a comment first.");
      return;
    }
    try {
      await addComment({
        id: `comment-${Date.now()}`,
        specId: activeSpec.id,
        authorId: "u-ha",
        text: commentBody.trim(),
        sectionReference: commentSection,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      setCommentBody("");
      toast.success("Comment added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add comment.");
    }
  }

  async function addDecisionFromForm() {
    if (!decisionQuestion.trim() || !decisionValue.trim()) {
      toast.error("Add both a question and a decision.");
      return;
    }
    try {
      await addDecision(activeSpec, decisionQuestion.trim(), decisionValue.trim());
      await refresh();
      setDecisionQuestion("");
      setDecisionValue("");
      setDecisionModalOpen(false);
      toast.success("Decision recorded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save decision.");
    }
  }

  async function updateAssetMetadata() {
    if (!assetModal) return;
    try {
      await updateSpecAsset(activeSpec, assetModal.id, {
        altText: assetModal.altText ?? null,
        caption: assetModal.caption ?? null,
      });
      await refresh();
      setAssetModal(null);
      toast.success("Image details updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update image.");
    }
  }

  async function deleteAsset(asset: SpecAsset) {
    try {
      await deleteSpecAsset(activeSpec, asset.id);
      await refresh();
      toast.success("Image removed from spec.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete image.");
    }
  }

  async function handlePreviewComment() {
    if (!previewFeedback.trim()) {
      toast.error("Add a comment first.");
      return;
    }
    try {
      await commentOnPreview(activeSpec, previewFeedback.trim());
      await refresh();
      setPreviewFeedback("");
      setPreviewCommentOpen(false);
      toast.success("Preview feedback sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send preview feedback.");
    }
  }

  async function handlePreviewReject() {
    if (!previewRejectionReason.trim()) {
      toast.error("Add a rejection reason.");
      return;
    }
    try {
      await rejectPreview(activeSpec, previewRejectionReason.trim());
      await refresh();
      setPreviewRejectionReason("");
      setPreviewRejectOpen(false);
      toast.warning("Preview rejected and returned to developer review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject preview.");
    }
  }

  return (
    <>
      <div className="border-b border-border px-6 py-5">
        <Link
          href="/backlog"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Backlog
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{spec.id}</span>
              <StatusPill status={spec.status} />
              <PriorityPill priority={spec.priority} />
              <span className="text-xs text-muted-foreground">Roadmap: {spec.roadmapLane}</span>
              {milestone && (
                <span className="text-xs text-muted-foreground">Milestone: {milestone.name}</span>
              )}
              {buildCycle && (
                <span className="text-xs text-muted-foreground">Build cycle: {buildCycle.name}</span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{spec.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {owner && (
                <span className="inline-flex items-center gap-1.5">
                  <UserAvatar name={owner.name} size={18} />
                  Owner: {owner.name}
                </span>
              )}
              {assignee && (
                <span className="inline-flex items-center gap-1.5">
                  <UserAvatar name={assignee.name} size={18} />
                  Assignee: {assignee.name}
                </span>
              )}
              {spec.approvedAt && <span>Approved {spec.approvedAt}</span>}
            </div>
          </div>
          <StatusActions
            spec={spec}
            setStatus={setStatus}
            syncToGit={async () => {
              await syncSpecToGit(spec);
              await refresh();
              toast.success("Spec synced to Git.");
            }}
            runCheck={runCheck}
            generateAgentContext={generateAgentContext}
            createBranch={async () => {
              const branchName = `feature/${spec.id.toLowerCase()}-${slugify(spec.title)}`;
              await linkImplementationBranchForSpec(spec, branchName);
              await refresh();
              toast.success(`Branch linked: ${branchName}`);
            }}
            linkPullRequest={async () => {
              const pullRequestUrl = `https://github.com/acme/launchos/pull/${
                spec.id.replace(/\D/g, "") || Date.now()
              }`;
              await linkImplementationPullRequestForSpec(spec, pullRequestUrl);
              await refresh();
              toast.success("Pull request linked.");
            }}
            onPreviewComment={() => setPreviewCommentOpen(true)}
            onPreviewReject={() => setPreviewRejectOpen(true)}
          />
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-lg border border-border bg-card p-2">
              <TabsTrigger value="simple"><FileText className="mr-1 h-3.5 w-3.5" />Simple</TabsTrigger>
              <TabsTrigger value="technical"><Code2 className="mr-1 h-3.5 w-3.5" />Technical</TabsTrigger>
              <TabsTrigger value="assets"><FileImage className="mr-1 h-3.5 w-3.5" />Assets</TabsTrigger>
              <TabsTrigger value="agent"><Bot className="mr-1 h-3.5 w-3.5" />Agent Handoff</TabsTrigger>
              <TabsTrigger value="activity"><ListChecks className="mr-1 h-3.5 w-3.5" />Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="mt-5">
              <Section
                title="Business-ready spec"
                description="Edit the requirement without writing Markdown. Technical Markdown is generated from canonical fields."
                actions={
                  !isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCopilotOpen(true)}>
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        Copilot
                      </Button>
                      <Button size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5" />
                        {GUARDED_EDIT_STATUSES.includes(spec.status) ? "Edit approved spec" : "Edit spec"}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDraft(seedEditorState(spec));
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" className="gap-1.5" onClick={() => void saveWithGuard()}>
                        <Save className="h-3.5 w-3.5" />Save
                      </Button>
                    </>
                  )
                }
              >
                {draft && (
                  <div className="space-y-5">
                    <EditableField
                      label="Title"
                      editing={isEditing}
                      value={draft.title}
                      onChange={(value) => setDraft({ ...draft, title: value })}
                    />
                    <EditableTextarea
                      label="Summary"
                      editing={isEditing}
                      value={draft.summary}
                      onChange={(value) => setDraft({ ...draft, summary: value })}
                    />
                    <EditableField
                      label="Audience"
                      editing={isEditing}
                      value={draft.audience}
                      placeholder="Not specified"
                      onChange={(value) => setDraft({ ...draft, audience: value })}
                    />
                    <EditableTextarea
                      label="Background"
                      editing={isEditing}
                      value={draft.background}
                      placeholder="No background context provided."
                      onChange={(value) => setDraft({ ...draft, background: value })}
                    />
                    <EditableTextarea
                      label="Current Behavior"
                      editing={isEditing}
                      value={draft.currentBehavior}
                      placeholder="How it currently works."
                      onChange={(value) => setDraft({ ...draft, currentBehavior: value })}
                    />
                    <EditableTextarea
                      label="Desired Outcome"
                      editing={isEditing}
                      value={draft.desiredOutcome}
                      placeholder="How it should work."
                      onChange={(value) => setDraft({ ...draft, desiredOutcome: value })}
                    />
                    <EditableList
                      label="Acceptance Criteria"
                      editing={isEditing}
                      items={draft.acceptanceCriteria}
                      emptyPlaceholder="No acceptance criteria yet. Add at least one before agent handoff."
                      onChange={(items) => setDraft({ ...draft, acceptanceCriteria: items })}
                    />
                    <EditableList
                      label="Out of Scope"
                      editing={isEditing}
                      items={draft.outOfScope}
                      emptyPlaceholder="No out-of-scope boundaries yet. Add explicit boundaries so the coding agent knows what not to change."
                      onChange={(items) => setDraft({ ...draft, outOfScope: items })}
                    />
                    <EditableList
                      label="Edge Cases"
                      editing={isEditing}
                      items={draft.edgeCases}
                      onChange={(items) => setDraft({ ...draft, edgeCases: items })}
                    />
                    <EditableList
                      label="Open Questions"
                      editing={isEditing}
                      items={draft.openQuestions}
                      onChange={(items) => setDraft({ ...draft, openQuestions: items })}
                    />
                    <EditableTextarea
                      label="Security Notes"
                      editing={isEditing}
                      value={draft.securityNotes}
                      placeholder="No security notes."
                      onChange={(value) => setDraft({ ...draft, securityNotes: value })}
                    />
                    <EditableList
                      label="Verification Plan"
                      editing={isEditing}
                      items={draft.verificationPlan}
                      emptyPlaceholder="No verification plan yet. Add the commands or checks the agent should run after implementation."
                      onChange={(items) => setDraft({ ...draft, verificationPlan: items })}
                    />
                    <EditableList
                      label="Suggested Search Terms"
                      editing={isEditing}
                      items={draft.suggestedSearchTerms}
                      onChange={(items) => setDraft({ ...draft, suggestedSearchTerms: items })}
                    />
                    <EditableTextarea
                      label="UI Notes"
                      editing={isEditing}
                      value={draft.uiNotes}
                      placeholder="No UI notes yet."
                      onChange={(value) => setDraft({ ...draft, uiNotes: value })}
                    />
                    <EditableTextarea
                      label="Technical Notes"
                      editing={isEditing}
                      value={draft.technicalNotes}
                      placeholder="No technical notes yet."
                      onChange={(value) => setDraft({ ...draft, technicalNotes: value })}
                    />
                    <EditableList
                      label="Related Files"
                      editing={isEditing}
                      items={draft.relatedFiles}
                      onChange={(items) => setDraft({ ...draft, relatedFiles: items })}
                    />
                  </div>
                )}
              </Section>
            </TabsContent>

            <TabsContent value="technical" className="mt-5">
              <Section
                title="Technical Markdown"
                description="Generated from spec fields, decisions, and assets for developer and agent handoff."
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => copyText(technicalMarkdown, "Markdown copied.")}
                  >
                    <Copy className="h-3.5 w-3.5" />Copy
                  </Button>
                }
              >
                <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 font-mono text-xs text-muted-foreground">
                  {technicalMarkdown}
                </pre>
              </Section>
            </TabsContent>

            <TabsContent value="assets" className="mt-5">
              <Section
                title="Screenshots and images"
                description="Paste, drag, or upload PNG, JPG, and WebP images up to 10MB."
                actions={
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />Upload
                  </Button>
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => void uploadImages(event.target.files)}
                />
                <div
                  className={`rounded-lg border border-dashed p-6 text-center transition-colors ${
                    draggingImages ? "border-primary bg-primary/10" : "border-border bg-background/40"
                  }`}
                  onPaste={(event) => void handlePasteUpload(event, uploadImages)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDraggingImages(true);
                  }}
                  onDragLeave={() => setDraggingImages(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDraggingImages(false);
                    void uploadImages(event.dataTransfer.files);
                  }}
                >
                  <ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div className="mt-2 text-sm font-medium">Drop images here or paste from clipboard</div>
                  <div className="mt-1 text-xs text-muted-foreground">Stored as spec asset references by the API.</div>
                </div>
                {uploadingImages.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Uploading: {uploadingImages.join(", ")}
                  </div>
                )}
                <AssetGrid assets={specAssets} onEdit={setAssetModal} onDelete={deleteAsset} />
              </Section>
            </TabsContent>

            <TabsContent value="agent" className="mt-5">
              <Section
                title="Agent handoff"
                description="Generate explicit context for coding tools. Mutating agent actions remain user-confirmed."
                actions={
                  <div className="flex gap-2 items-center">
                    <select 
                      className="border rounded-md px-2 py-1 text-sm bg-white"
                      value={targetAgentId}
                      onChange={(e) => setTargetAgentId(e.target.value)}
                    >
                      {(agentTargets ?? []).map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => void generateAgentContext()}
                      disabled={generatingContext}
                    >
                      {generatingContext ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                }
              >
                {readiness && (
                  <div className={`mb-4 p-4 rounded-lg border ${readiness.status === 'green' ? 'bg-green-50 border-green-200' : readiness.status === 'yellow' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      Readiness: <span className="uppercase tracking-wider text-xs">{readiness.status}</span>
                    </h3>
                    <ul className="text-xs space-y-1">
                      {(readiness.checks ?? []).map((c: any) => (
                        <li key={c.id} className="flex gap-2">
                          <span>{c.status === 'pass' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'}</span>
                          <span>{c.label} {c.message ? `- ${c.message}` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {agentContext ? (
                  <>
                    <div className="mb-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => {
                          navigator.clipboard.writeText(agentContext);
                          toast.success("Agent handoff copied.");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />Copy context
                      </Button>
                    </div>
                    <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 font-mono text-xs text-muted-foreground">
                      {agentContext}
                    </pre>
                  </>
                ) : (
                  <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    <h3 className="font-semibold text-gray-900 mb-1">No agent handoff yet</h3>
                    <p className="text-sm">Select a target agent and click Regenerate to generate context.</p>
                  </div>
                )}
              </Section>
            </TabsContent>

            <TabsContent value="activity" className="mt-5">
              <Section title="Activity timeline">
                <div className="divide-y divide-border rounded-lg border border-border">
                  {state.activities.filter((item) => item.specId === spec.id).length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No activity recorded for this spec yet.</div>
                  ) : (
                    state.activities
                      .filter((item) => item.specId === spec.id)
                      .map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-4 p-4 text-sm">
                          <span>{item.text}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      ))
                  )}
                </div>
              </Section>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          {effectiveSpecCheck && effectiveSpecCheck.status !== "passed" && (
            <WarningCard
              specCheck={effectiveSpecCheck}
              onRunCheck={() => void runCheck()}
              onDismiss={() => setWarningDismissed(true)}
              onOpenAgent={() => setActiveTab("agent")}
            />
          )}
          <WorkflowCard
            spec={spec}
            ownerName={owner?.name}
            assigneeName={assignee?.name}
          />
          <PreviewCard
            spec={spec}
            review={previewReview}
            onApprove={() => void setStatus("accepted")}
            onComment={() => setPreviewCommentOpen(true)}
            onReject={() => setPreviewRejectOpen(true)}
            onAddPreviewUrl={() => {
              const previewUrl = `https://staging.launchos.dev/${slugify(spec.title)}`;
              void addPreviewUrlForSpec(spec, previewUrl)
                .then(() => refresh())
                .then(() => toast.success("Preview URL saved."))
                .catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Could not save preview URL."),
                );
            }}
          />
          <CommentCard
            comments={specComments}
            filter={commentFilter}
            onFilterChange={setCommentFilter}
            commentBody={commentBody}
            onCommentBodyChange={setCommentBody}
            commentSection={commentSection}
            onCommentSectionChange={setCommentSection}
            onSubmit={() => void addSpecCommentFromForm()}
            onResolve={(commentId) => {
              void resolveComment(commentId)
                .then(() => refresh())
                .then(() => toast.success("Comment resolved."))
                .catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Could not resolve comment."),
                );
            }}
            onDismiss={(commentId) => {
              void dismissComment(commentId)
                .then(() => refresh())
                .then(() => toast.success("Comment dismissed."))
                .catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Could not dismiss comment."),
                );
            }}
          />
          <DecisionCard decisions={specDecisions} onAddDecision={() => setDecisionModalOpen(true)} />
        </aside>
      </div>

      <Dialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit approved workflow spec?</DialogTitle>
            <DialogDescription>
              This spec is already past initial approval. The backend will validate the update and record it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmSaveOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveSpec()}>Save update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add decision</DialogTitle>
            <DialogDescription>Record a resolved product or technical question for this spec.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={decisionQuestion}
              onChange={(event) => setDecisionQuestion(event.target.value)}
              placeholder="Question"
            />
            <Textarea
              value={decisionValue}
              onChange={(event) => setDecisionValue(event.target.value)}
              placeholder="Decision"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisionModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void addDecisionFromForm()}>Save decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assetModal} onOpenChange={(open) => !open && setAssetModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image details</DialogTitle>
          </DialogHeader>
          {assetModal && (
            <div className="space-y-3">
              <Input
                value={assetModal.caption ?? ""}
                onChange={(event) => setAssetModal({ ...assetModal, caption: event.target.value })}
                placeholder="Caption"
              />
              <Textarea
                value={assetModal.altText ?? ""}
                onChange={(event) => setAssetModal({ ...assetModal, altText: event.target.value })}
                placeholder="Alt text"
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssetModal(null)}>Cancel</Button>
            <Button onClick={() => void updateAssetMetadata()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewCommentOpen} onOpenChange={setPreviewCommentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview comment</DialogTitle>
          </DialogHeader>
          <Textarea
            value={previewFeedback}
            onChange={(event) => setPreviewFeedback(event.target.value)}
            placeholder="What should the developer know?"
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewCommentOpen(false)}>Cancel</Button>
            <Button onClick={() => void handlePreviewComment()}>Send comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewRejectOpen} onOpenChange={setPreviewRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject preview</DialogTitle>
            <DialogDescription>{spec.id} will return to Developer Review.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={previewRejectionReason}
            onChange={(event) => setPreviewRejectionReason(event.target.value)}
            placeholder="What needs to change?"
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handlePreviewReject()}>
              Submit rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SpecCopilotModal 
        specId={activeSpec.id} 
        open={copilotOpen} 
        onOpenChange={setCopilotOpen} 
        onApply={() => refresh()} 
      />
    </>
  );
}

function Section({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function EditableField({
  label,
  editing,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  editing: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      {editing ? (
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <p className="text-sm">{value || <span className="text-muted-foreground">{placeholder ?? "Empty"}</span>}</p>
      )}
    </Field>
  );
}

function EditableTextarea({
  label,
  editing,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  editing: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      {editing ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm">
          {value || <span className="text-muted-foreground">{placeholder ?? "Empty"}</span>}
        </p>
      )}
    </Field>
  );
}

function EditableList({
  label,
  editing,
  items,
  emptyPlaceholder,
  onChange,
}: {
  label: string;
  editing: boolean;
  items: string[];
  emptyPlaceholder?: string;
  onChange: (items: string[]) => void;
}) {
  const safeItems = items ?? [];
  if (!editing) {
    return (
      <Field label={label}>
        {safeItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyPlaceholder ?? "Empty"}</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {safeItems.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span className="text-muted-foreground">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </Field>
    );
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        {safeItems.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(event) => {
                const next = [...safeItems];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${label} item`}
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onChange([...items, ""])}>
          <Plus className="h-3.5 w-3.5" />Add item
        </Button>
      </div>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 md:grid-cols-[180px_1fr]">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function WorkflowCard({
  spec,
  ownerName,
  assigneeName,
}: {
  spec: Spec;
  ownerName?: string;
  assigneeName?: string;
}) {
  return (
    <RailCard title="Workflow">
      <div className="space-y-3 text-sm">
        <InfoRow label="Current phase"><StatusPill status={spec.status} /></InfoRow>
        <InfoRow label="Priority"><PriorityPill priority={spec.priority} /></InfoRow>
        <InfoRow label="Owner">{ownerName ?? spec.ownerId}</InfoRow>
        <InfoRow label="Assignee">{assigneeName ?? spec.assigneeId ?? "Unassigned"}</InfoRow>
      </div>
    </RailCard>
  );
}

function WarningCard({
  specCheck,
  onRunCheck,
  onDismiss,
  onOpenAgent,
}: {
  specCheck: SpecCheck;
  onRunCheck: () => void;
  onDismiss: () => void;
  onOpenAgent: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-200">
        <AlertTriangle className="h-3.5 w-3.5" />
        Potential mismatch detected
      </div>
      <div className="mt-2 text-sm">{specCheck.summary}</div>
      {specCheck.details && specCheck.details.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-amber-100/90">
          {specCheck.details.map((detail, index) => (
            <li key={`${detail}-${index}`}>- {detail}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onRunCheck}>Run check again</Button>
        <Button size="sm" variant="outline" onClick={onOpenAgent}>Open Agent Handoff</Button>
        <Button size="sm" onClick={onDismiss}>Mark resolved</Button>
      </div>
    </div>
  );
}

function PreviewCard({
  spec,
  review,
  onApprove,
  onComment,
  onReject,
  onAddPreviewUrl,
}: {
  spec: Spec;
  review: PreviewReview | null;
  onApprove: () => void;
  onComment: () => void;
  onReject: () => void;
  onAddPreviewUrl: () => void;
}) {
  const reviewer = getUserDisplay(review?.reviewedBy);
  return (
    <RailCard title="Preview">
      {spec.previewUrl || review?.previewUrl ? (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4 text-primary" />
            Preview ready
          </div>
          <div className="break-all text-xs text-cyan-300">{review?.previewUrl ?? spec.previewUrl}</div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Status: {review?.status ?? spec.status}</div>
            {reviewer && <div>Reviewer: {reviewer.name}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/preview?specId=${encodeURIComponent(spec.id)}`}>Review Preview</Link>
            </Button>
            {(review?.previewUrl ?? spec.previewUrl) && (
              <Button size="sm" variant="outline" asChild>
                <a href={review?.previewUrl ?? spec.previewUrl} target="_blank" rel="noreferrer">
                  Open URL
                </a>
              </Button>
            )}
          </div>
          {spec.status === "stakeholder_review" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onApprove}>Approve</Button>
              <Button size="sm" variant="outline" onClick={onComment}>Comment</Button>
              <Button size="sm" variant="outline" onClick={onReject}>Reject</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">No preview URL saved yet.</div>
          {spec.status === "preview" && <Button size="sm" onClick={onAddPreviewUrl}>Add preview URL</Button>}
        </div>
      )}
    </RailCard>
  );
}

function CommentCard({
  comments,
  filter,
  onFilterChange,
  commentBody,
  onCommentBodyChange,
  commentSection,
  onCommentSectionChange,
  onSubmit,
  onResolve,
  onDismiss,
}: {
  comments: Comment[];
  filter: "open" | "resolved" | "all";
  onFilterChange: (value: "open" | "resolved" | "all") => void;
  commentBody: string;
  onCommentBodyChange: (value: string) => void;
  commentSection: string;
  onCommentSectionChange: (value: string) => void;
  onSubmit: () => void;
  onResolve: (commentId: string) => void;
  onDismiss: (commentId: string) => void;
}) {
  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true;
    return filter === "open" ? comment.status === "open" : comment.status === "resolved";
  });

  return (
    <RailCard
      title="Comments"
      icon={<MessageSquare className="h-3.5 w-3.5" />}
      actions={
        <div className="flex gap-1">
          {(["open", "resolved", "all"] as const).map((option) => (
            <button
              key={option}
              className={`rounded-md px-2 py-1 text-xs ${
                filter === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => onFilterChange(option)}
            >
              {option === "all" ? "All" : option === "open" ? "Open" : "Resolved"}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <div className="text-xs text-muted-foreground">No comments in this view.</div>
        ) : (
          filteredComments.map((comment) => {
            const user = getUserDisplay(comment.authorId);
            return (
              <div key={comment.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {user && <UserAvatar name={user.name} size={18} />}
                  <span className="font-medium">{user?.name ?? comment.authorId}</span>
                  <span className="text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  {comment.sectionReference && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      {comment.sectionReference}
                    </span>
                  )}
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {comment.status}
                  </span>
                </div>
                <div className="mt-2 text-sm">{comment.text}</div>
                {comment.status === "open" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => onResolve(comment.id)}>Resolve</Button>
                    <Button size="sm" variant="outline" onClick={() => onDismiss(comment.id)}>Dismiss</Button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <select
          value={commentSection}
          onChange={(event) => onCommentSectionChange(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {COMMENT_SECTIONS.map((section) => (
            <option key={section} value={section} className="bg-background">{section}</option>
          ))}
        </select>
        <Textarea
          value={commentBody}
          onChange={(event) => onCommentBodyChange(event.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <Button size="sm" className="w-full gap-1.5" onClick={onSubmit}>
          <Send className="h-3.5 w-3.5" />Comment
        </Button>
      </div>
    </RailCard>
  );
}

function DecisionCard({
  decisions,
  onAddDecision,
}: {
  decisions: Decision[];
  onAddDecision: () => void;
}) {
  return (
    <RailCard
      title="Decisions"
      actions={
        <Button size="sm" variant="outline" onClick={onAddDecision}>
          <Plus className="mr-1 h-3.5 w-3.5" />Add
        </Button>
      }
    >
      <div className="space-y-3">
        {decisions.length === 0 ? (
          <div className="text-xs text-muted-foreground">No decisions recorded.</div>
        ) : (
          decisions.map((decision) => (
            <div key={decision.id} className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Question</div>
              <div className="mt-1 text-sm">{decision.question}</div>
              <div className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Decision</div>
              <div className="mt-1 text-sm">{decision.decision}</div>
              <div className="mt-3 text-xs text-muted-foreground">
                {decision.decidedBy ? `${getUserDisplay(decision.decidedBy)?.name ?? decision.decidedBy} - ` : ""}
                {decision.createdAt ? formatDate(decision.createdAt) : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </RailCard>
  );
}

function AssetGrid({
  assets,
  onEdit,
  onDelete,
}: {
  assets: SpecAsset[];
  onEdit: (asset: SpecAsset) => void;
  onDelete: (asset: SpecAsset) => void;
}) {
  if (assets.length === 0) {
    return <EmptyState title="No images yet" description="Upload or paste screenshots to attach them to this spec." />;
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-lg border border-border bg-background p-3">
          {asset.url ? (
            <img
              src={asset.url}
              alt={asset.altText || asset.fileName}
              className="aspect-[16/10] w-full rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Image URL unavailable
            </div>
          )}
          <div className="mt-2 text-sm font-medium">{asset.caption || asset.fileName}</div>
          <div className="text-xs text-muted-foreground">{formatBytes(asset.sizeBytes)}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(asset)}>Edit details</Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(asset)}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusActions({
  spec,
  syncToGit,
  runCheck,
  generateAgentContext,
  createBranch,
  linkPullRequest,
  setStatus,
  onPreviewComment,
  onPreviewReject,
}: {
  spec: Spec;
  syncToGit: () => Promise<void>;
  runCheck: () => Promise<void>;
  generateAgentContext: () => Promise<void>;
  createBranch: () => Promise<void>;
  linkPullRequest: () => Promise<void>;
  setStatus: (status: SpecStatus) => Promise<void>;
  onPreviewComment: () => void;
  onPreviewReject: () => void;
}) {
  const actions: Record<SpecStatus, { label: string; onClick: () => void; variant?: "default" | "outline"; icon?: ReactNode }[]> = {
    request: [
      { label: "Create draft", onClick: () => void setStatus("draft"), icon: <FileText className="h-3.5 w-3.5" /> },
    ],
    draft: [
      { label: "Move to review", onClick: () => void setStatus("review"), icon: <Send className="h-3.5 w-3.5" /> },
    ],
    review: [
      { label: "Approve spec", onClick: () => void setStatus("approved"), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    ],
    approved: [
      { label: "Sync to Git", onClick: () => void syncToGit(), variant: "outline", icon: <GitBranch className="h-3.5 w-3.5" /> },
      { label: "Add to Build Queue", onClick: () => void setStatus("build_queue"), icon: <ListChecks className="h-3.5 w-3.5" /> },
    ],
    build_queue: [
      { label: "Generate Agent Handoff", onClick: () => void generateAgentContext(), variant: "outline", icon: <Bot className="h-3.5 w-3.5" /> },
      { label: "Start development", onClick: () => void setStatus("in_development"), icon: <PlayCircle className="h-3.5 w-3.5" /> },
    ],
    in_development: [
      { label: "Link branch", onClick: () => void createBranch(), variant: "outline", icon: <GitBranch className="h-3.5 w-3.5" /> },
      { label: "Link PR", onClick: () => void linkPullRequest(), variant: "outline", icon: <LinkIcon className="h-3.5 w-3.5" /> },
      { label: "Move to Developer Review", onClick: () => void setStatus("developer_review") },
    ],
    developer_review: [
      { label: "Run Spec Check", onClick: () => void runCheck(), variant: "outline", icon: <Code2 className="h-3.5 w-3.5" /> },
      { label: "Approve for Preview", onClick: () => void setStatus("preview"), icon: <Eye className="h-3.5 w-3.5" /> },
    ],
    preview: [
      { label: "Send to Stakeholder Review", onClick: () => void setStatus("stakeholder_review"), icon: <Send className="h-3.5 w-3.5" /> },
    ],
    stakeholder_review: [
      { label: "Approve Preview", onClick: () => void setStatus("accepted"), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      { label: "Comment", onClick: onPreviewComment, variant: "outline", icon: <MessageSquare className="h-3.5 w-3.5" /> },
      { label: "Reject", onClick: onPreviewReject, variant: "outline", icon: <X className="h-3.5 w-3.5" /> },
    ],
    accepted: [
      { label: "Mark done", onClick: () => void setStatus("done"), icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    ],
    done: [
      { label: "Run Spec Check", onClick: () => void runCheck(), variant: "outline", icon: <Code2 className="h-3.5 w-3.5" /> },
    ],
  };

  return (
    <div className="flex flex-wrap gap-2">
      {(actions[spec.status] ?? []).map((action) => (
        <Button
          key={action.label}
          size="sm"
          variant={action.variant ?? "default"}
          onClick={action.onClick}
          className="gap-1.5"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

function RailCard({
  title,
  icon,
  actions,
  children,
}: {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {icon}
          {title}
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
    </div>
  );
}

function SparklesIcon() {
  return <Bot className="h-3.5 w-3.5" />;
}

function seedEditorState(spec: any): EditorState {
  return {
    title: spec.title,
    summary: spec.summary,
    audience: spec.audience ?? "",
    background: spec.background ?? "",
    currentBehavior: spec.currentBehavior ?? "",
    desiredOutcome: spec.desiredOutcome ?? "",
    acceptanceCriteria: [...(spec.acceptanceCriteria || [])],
    outOfScope: [...(spec.outOfScope || [])],
    openQuestions: [...(spec.openQuestions || [])],
    relatedFiles: [...(spec.relatedFiles || [])],
    technicalNotes: spec.technicalNotes ?? "",
    uiNotes: spec.uiNotes ?? "",
    edgeCases: [...(spec.edgeCases || [])],
    securityNotes: spec.securityNotes ?? "",
    suggestedSearchTerms: [...(spec.suggestedSearchTerms || [])],
    verificationPlan: [...(spec.verificationPlan || [])],
  };
}

function sanitizeList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

async function handlePasteUpload(
  event: ClipboardEvent<HTMLDivElement>,
  onUpload: (files: FileList | File[] | null) => Promise<void>,
) {
  const files = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
  if (files.length === 0) return;
  event.preventDefault();
  await onUpload(files);
}

function buildTechnicalMarkdown(spec: Spec, assets: SpecAsset[], previewReview: PreviewReview | null) {
  const frontmatter = [
    "---",
    `id: ${spec.id}`,
    `title: ${spec.title}`,
    `status: ${spec.status}`,
    `priority: ${spec.priority}`,
    `roadmap_lane: ${spec.roadmapLane.toLowerCase()}`,
    `milestone: ${spec.milestoneId || "null"}`,
    `build_cycle: ${spec.buildCycleId || "null"}`,
    `assignee: ${spec.assigneeId || "null"}`,
    `approved_at: ${spec.approvedAt || "null"}`,
    `preview_url: ${previewReview?.previewUrl ?? spec.previewUrl ?? "null"}`,
    "---",
    "",
  ];

  const lines = [
    `# ${spec.title}`,
    "",
    "## Summary",
    spec.summary || "",
    "",
    "## Audience",
    spec.audience || "Not specified",
    "",
    "## Desired Outcome",
    spec.desiredOutcome || spec.background || spec.summary || "",
    "",
    "## Acceptance Criteria",
    ...(spec.acceptanceCriteria?.length ? spec.acceptanceCriteria.map((item) => `- ${item}`) : ["No acceptance criteria yet. Add at least one before agent handoff."]),
    "",
    "## Out of Scope",
    ...(spec.outOfScope?.length ? spec.outOfScope.map((item) => `- ${item}`) : []),
  ];

  if (spec.openQuestions?.length) {
    lines.push("", "## Open Questions", ...spec.openQuestions.map((item) => `- ${item}`));
  }
  if (assets?.length) {
    lines.push("", "## Screenshots / Images", ...assets.map(assetMarkdown));
  }
  if (spec.technicalNotes) {
    lines.push("", "## Technical Notes", spec.technicalNotes);
  }
  if (spec.uiNotes) {
    lines.push("", "## UI Notes", spec.uiNotes);
  }
  if (spec.relatedFiles && spec.relatedFiles.length) {
    lines.push("", "## Related Files", ...spec.relatedFiles.map((file) => `- ${file}`));
  }
  return [...frontmatter, ...lines].join("\n");
}

function assetMarkdown(asset: SpecAsset) {
  return `![${asset.altText || asset.fileName}](${asset.url || asset.storageKey}${
    asset.caption ? ` "${asset.caption}"` : ""
  })`;
}

function copyText(text: string, successMessage: string) {
  try {
    void navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("Could not copy to clipboard.");
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
