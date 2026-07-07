import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  Download,
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
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PriorityPill, StatusPill, UserAvatar } from "@/components/app/Pills";
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
import { getUserDisplay } from "@/lib/reference-data";
import { useSpecGateStore } from "@/lib/specgate-store";
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
  addSpecComment,
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

const ADVANCED_EDITABLE_STATUSES: SpecStatus[] = [
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
  expectedBehavior: string;
  acceptanceCriteria: string[];
  outOfScope: string[];
  openQuestions: string[];
  relatedFiles: string[];
  technicalNotes: string;
  uiNotes: string;
};

export const Route = createFileRoute("/specs/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — SpecPilot` }] }),
  component: SpecDetail,
});

function SpecDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { state, updateSpec, setSpecStatus, refresh } = useSpecGateStore();
  const spec = state.specs.find((item) => item.id === id);

  const [activeTab, setActiveTab] = useState("simple");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditorState | null>(null);
  const [confirmApprovedSaveOpen, setConfirmApprovedSaveOpen] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    void getLatestAgentContextForSpec(spec)
      .then((response) => setAgentContext(response?.data.markdown ?? null))
      .catch(() => {});
  }, [spec?.apiId]);

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

  if (!spec) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Spec not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {id} was not returned by the SpecGate API.
          </p>
          <Button asChild className="mt-4">
            <Link to="/backlog">Back to backlog</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const activeSpec: Spec = spec;

  const owner = getUserDisplay(activeSpec.ownerId);
  const assignee = getUserDisplay(activeSpec.assigneeId);
  const milestone = state.milestones.find((item) => item.id === activeSpec.milestoneId);
  const buildCycle = state.buildCycles.find((item) => item.id === activeSpec.buildCycleId);
  const effectiveSpecCheck = !warningDismissed ? latestSpecCheck : null;

  async function handleSaveSpec() {
    if (!draft) return;
    try {
      await updateSpec(activeSpec.id, {
        title: draft.title,
        summary: draft.summary,
        audience: draft.audience || undefined,
        expectedBehavior: draft.expectedBehavior,
        problem: draft.expectedBehavior,
        acceptanceCriteria: sanitizeList(draft.acceptanceCriteria),
        outOfScope: sanitizeList(draft.outOfScope),
        openQuestions: sanitizeList(draft.openQuestions),
        relatedFiles: sanitizeList(draft.relatedFiles),
        technicalNotes: draft.technicalNotes || undefined,
        uiNotes: draft.uiNotes || undefined,
      });
      setIsEditing(false);
      setConfirmApprovedSaveOpen(false);
      toast.success("Spec updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update spec.");
    }
  }

  async function saveWithApprovalGuard() {
    if (!dirty) {
      setIsEditing(false);
      return;
    }
    if (ADVANCED_EDITABLE_STATUSES.includes(activeSpec.status)) {
      setConfirmApprovedSaveOpen(true);
      return;
    }
    await handleSaveSpec();
  }

  async function handleUploadFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((file) =>
      ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type),
    );
    if (imageFiles.length !== Array.from(files).length) {
      toast.error("Unsupported file type. Please upload PNG, JPG, WebP, or GIF.");
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
      const response = await generateAgentContextForSpec(activeSpec);
      setAgentContext(response.data.markdown);
      toast.success("Agent context generated from the current approved spec.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate agent context.");
    } finally {
      setGeneratingContext(false);
    }
  }

  async function syncToGit() {
    try {
      toast.loading("Syncing to Git...", { id: "sync-git" });
      await syncSpecToGit(activeSpec);
      await refresh();
      toast.dismiss("sync-git");
      toast.success("Spec synced to Git.");
    } catch (error) {
      toast.dismiss("sync-git");
      toast.error(error instanceof Error ? error.message : "Git sync failed.");
    }
  }

  async function createBranch() {
    try {
      toast.loading("Linking implementation branch...", { id: "link-branch" });
      const branchName = `feature/${activeSpec.id.toLowerCase()}-${slugify(activeSpec.title)}`;
      await linkImplementationBranchForSpec(activeSpec, branchName);
      await refresh();
      toast.dismiss("link-branch");
      toast.success(`Branch linked: ${branchName}`);
    } catch (error) {
      toast.dismiss("link-branch");
      toast.error(error instanceof Error ? error.message : "Could not link branch.");
    }
  }

  async function linkPullRequest() {
    try {
      toast.loading("Linking pull request...", { id: "link-pr" });
      const pullRequestUrl = `https://github.com/acme/launchos/pull/${activeSpec.id.replace(/\D/g, "") || Date.now()}`;
      await linkImplementationPullRequestForSpec(activeSpec, pullRequestUrl);
      await refresh();
      toast.dismiss("link-pr");
      toast.success("Pull request linked.");
    } catch (error) {
      toast.dismiss("link-pr");
      toast.error(error instanceof Error ? error.message : "Could not link pull request.");
    }
  }

  async function handlePreviewApprove() {
    try {
      await setSpecStatus(activeSpec.id, "accepted");
      await refresh();
      toast.success("Preview approved.");
      setPreviewCommentOpen(false);
      setPreviewRejectOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not approve preview.");
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

  async function handleAddDecision() {
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

  async function handleCommentAction(action: "resolve" | "dismiss", commentId: string) {
    try {
      if (action === "resolve") await resolveComment(commentId);
      else await dismissComment(commentId);
      await refresh();
      toast.success(action === "resolve" ? "Comment resolved." : "Comment dismissed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update comment.");
    }
  }

  async function handleAssetMetadataSave() {
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

  async function handleAssetDelete(asset: SpecAsset) {
    try {
      await deleteSpecAsset(activeSpec, asset.id);
      await refresh();
      toast.success("Image removed from spec.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete image.");
    }
  }

  const technicalMarkdown = buildTechnicalMarkdown(activeSpec, specAssets, previewReview);

  return (
    <AppShell>
      <div className="border-b border-border px-6 py-5">
        <Link
          to="/backlog"
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
              {milestone && <span className="text-xs text-muted-foreground">Milestone: {milestone.name}</span>}
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
            syncToGit={syncToGit}
            runCheck={runCheck}
            generateAgentContext={generateAgentContext}
            createBranch={createBranch}
            linkPullRequest={linkPullRequest}
            navigate={navigate}
            refresh={refresh}
            setStatus={async (status) => {
              await setSpecStatus(spec.id, status);
              await refresh();
              toast.success("Status updated.");
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
              <TabsTrigger value="simple">
                <FileText className="mr-1 h-3.5 w-3.5" />
                Simple
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Code2 className="mr-1 h-3.5 w-3.5" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="assets">
                <FileImage className="mr-1 h-3.5 w-3.5" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="agent">
                <Bot className="mr-1 h-3.5 w-3.5" />
                Agent Context
              </TabsTrigger>
              <TabsTrigger value="activity">
                <ListChecks className="mr-1 h-3.5 w-3.5" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="mt-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Business-ready spec</h2>
                    <p className="text-sm text-muted-foreground">
                      Edit the requirement without writing Markdown. Technical Markdown is generated from this content.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isEditing ? (
                      <Button size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5" />
                        {ADVANCED_EDITABLE_STATUSES.includes(spec.status) ? "Edit approved spec" : "Edit spec"}
                      </Button>
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
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("technical")}>
                          Preview Markdown
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={() => void saveWithApprovalGuard()}>
                          Save changes
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && draft ? (
                  <div
                    className={`mt-5 space-y-6 rounded-lg border border-dashed p-4 ${draggingImages ? "border-primary bg-primary/5" : "border-border"}`}
                    onPaste={(event) => {
                      void handlePasteUpload(event, handleUploadFiles);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDraggingImages(true);
                    }}
                    onDragLeave={() => setDraggingImages(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDraggingImages(false);
                      void handleUploadFiles(event.dataTransfer.files);
                    }}
                  >
                    <SectionHeader title="What we will build" description="Short summary for stakeholders." />
                    <Textarea
                      value={draft.summary}
                      onChange={(event) => setDraftField(setDraft, "summary", event.target.value)}
                      rows={3}
                    />

                    <SectionHeader title="Who this is for" description="Primary audience or business owner." />
                    <Textarea
                      value={draft.audience}
                      onChange={(event) => setDraftField(setDraft, "audience", event.target.value)}
                      rows={2}
                    />

                    <SectionHeader title="Expected behavior" description="Describe the user-facing behavior clearly." />
                    <Textarea
                      value={draft.expectedBehavior}
                      onChange={(event) => setDraftField(setDraft, "expectedBehavior", event.target.value)}
                      rows={5}
                    />

                    <ListEditor
                      title="Acceptance criteria"
                      values={draft.acceptanceCriteria}
                      onChange={(next) => setDraftField(setDraft, "acceptanceCriteria", next)}
                      addLabel="Add acceptance criteria"
                    />

                    <ListEditor
                      title="Out of scope"
                      values={draft.outOfScope}
                      onChange={(next) => setDraftField(setDraft, "outOfScope", next)}
                      addLabel="Add out-of-scope item"
                    />

                    <ListEditor
                      title="Open questions"
                      values={draft.openQuestions}
                      onChange={(next) => setDraftField(setDraft, "openQuestions", next)}
                      addLabel="Add open question"
                    />

                    <ListEditor
                      title="Related files"
                      values={draft.relatedFiles}
                      onChange={(next) => setDraftField(setDraft, "relatedFiles", next)}
                      addLabel="Add related path"
                    />

                    <SectionHeader title="Notes" description="Keep UI and implementation notes separate." />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">UI notes</div>
                        <Textarea
                          value={draft.uiNotes}
                          onChange={(event) => setDraftField(setDraft, "uiNotes", event.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Technical notes</div>
                        <Textarea
                          value={draft.technicalNotes}
                          onChange={(event) => setDraftField(setDraft, "technicalNotes", event.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>

                    <SectionHeader
                      title="Screenshots / images"
                      description="Paste an image, drop it here, or upload manually. Uploaded images are attached to this spec."
                    />
                    <div className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-1 h-3.5 w-3.5" />
                          Insert image
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("assets")}>
                          <FileImage className="mr-1 h-3.5 w-3.5" />
                          Open assets tab
                        </Button>
                      </div>
                      {uploadingImages.length > 0 && (
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {uploadingImages.map((name) => (
                            <div key={name} className="flex items-center gap-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Uploading image... {name}
                            </div>
                          ))}
                        </div>
                      )}
                      <AssetStrip assets={specAssets} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-6">
                    <ReadSection title="What we will build" body={spec.summary} />
                    <ReadSection title="Who this is for" body={spec.audience} />
                    <ReadSection title="Expected behavior" body={spec.expectedBehavior ?? spec.problem} />
                    <ReadListSection title="Acceptance criteria" items={spec.acceptanceCriteria} success />
                    <ReadListSection title="Out of scope" items={spec.outOfScope} />
                    <ReadListSection title="Open questions" items={spec.openQuestions} accent="amber" />
                    <ReadSection title="Notes" body={spec.uiNotes || spec.technicalNotes} />
                    <div>
                      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Screenshots / images
                      </div>
                      <AssetStrip assets={specAssets} />
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={(event) => {
                    void handleUploadFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Generated Markdown</h2>
                    <p className="text-sm text-muted-foreground">
                      This stays clean and exportable. Stakeholders edit the business view instead of raw Markdown.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyText(technicalMarkdown, "Markdown copied.")}>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy Markdown
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadMarkdown(spec.id, technicalMarkdown)}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Download .md
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void syncToGit()}>
                      <GitBranch className="mr-1 h-3.5 w-3.5" />
                      Sync to Git
                    </Button>
                    <Button size="sm" onClick={() => void generateAgentContext()}>
                      <Bot className="mr-1 h-3.5 w-3.5" />
                      Generate Agent Context
                    </Button>
                  </div>
                </div>
                <pre className="mt-5 overflow-auto rounded-lg border border-border bg-[#0b0d12] p-5 text-xs leading-6">
                  {technicalMarkdown}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="mt-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Spec assets</h2>
                    <p className="text-sm text-muted-foreground">
                      Images are stored through the backend storage flow and available to both Simple and Technical views.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="mr-1 h-3.5 w-3.5" />
                    Upload image
                  </Button>
                </div>

                {specAssets.length === 0 ? (
                  <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    No images yet.
                    <br />
                    Paste a screenshot into the spec editor or upload one here.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {specAssets.map((asset) => (
                      <div key={asset.id} className="rounded-lg border border-border bg-background p-4">
                        {asset.url ? (
                          <img
                            src={asset.url}
                            alt={asset.altText ?? asset.fileName}
                            className="aspect-[16/10] w-full rounded-md border border-border object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                            No preview URL available
                          </div>
                        )}
                        <div className="mt-3 space-y-1">
                          <div className="text-sm font-medium">{asset.fileName}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.contentType} · {formatBytes(asset.sizeBytes)} · uploaded {formatDate(asset.createdAt)} by{" "}
                            {getUserDisplay(asset.createdBy)?.name ?? asset.createdBy}
                          </div>
                          {asset.altText && <div className="text-xs text-muted-foreground">Alt: {asset.altText}</div>}
                          {asset.caption && <div className="text-xs text-muted-foreground">Caption: {asset.caption}</div>}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyText(assetMarkdown(asset), "Asset Markdown copied.")}
                          >
                            <Copy className="mr-1 h-3.5 w-3.5" />
                            Copy Markdown
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyText(asset.url ?? "", "Asset URL copied.")}
                            disabled={!asset.url}
                          >
                            <LinkIcon className="mr-1 h-3.5 w-3.5" />
                            Copy URL
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setAssetModal({ ...asset })}>
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab("simple")}>
                            <FileText className="mr-1 h-3.5 w-3.5" />
                            Open editor
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleAssetDelete(asset)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="agent" className="mt-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Agent context</h2>
                    <p className="text-sm text-muted-foreground">
                      Use the approved requirement, generated Markdown, and related files to prepare implementation handoff.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void generateAgentContext()} disabled={generatingContext}>
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      {generatingContext ? "Generating..." : "Generate Agent Context"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void runCheck()}>
                      <PlayCircle className="mr-1 h-3.5 w-3.5" />
                      Run Spec Check
                    </Button>
                  </div>
                </div>
                {agentContext ? (
                  <div className="mt-5 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyText(agentContext, "Agent context copied.")}>
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => downloadMarkdown(`${spec.id}.context`, agentContext)}>
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                    <pre className="overflow-auto rounded-lg border border-border bg-[#0b0d12] p-5 text-xs leading-6">
                      {agentContext}
                    </pre>
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center">
                    <Bot className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-3 text-sm text-muted-foreground">
                      No agent context has been generated yet.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-5">
              <div className="rounded-xl border border-border bg-card divide-y divide-border">
                {state.activities.filter((activity) => activity.specId === spec.id).map((activity) => (
                  <div key={activity.id} className="flex justify-between gap-4 p-4 text-sm">
                    <span>{activity.text}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
                {state.activities.filter((activity) => activity.specId === spec.id).length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">No activity yet.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-5">
          <WorkflowCard spec={spec} ownerName={owner?.name} assigneeName={assignee?.name} />

          {effectiveSpecCheck && effectiveSpecCheck.status !== "passed" && (
            <WarningCard
              specCheck={effectiveSpecCheck}
              onRunCheck={() => void runCheck()}
              onDismiss={() => {
                setWarningDismissed(true);
                toast.success("Warning hidden for this session.");
              }}
              onOpenAgent={() => setActiveTab("agent")}
            />
          )}

          <CommentCard
            comments={specComments}
            filter={commentFilter}
            onFilterChange={setCommentFilter}
            commentBody={commentBody}
            onCommentBodyChange={setCommentBody}
            commentSection={commentSection}
            onCommentSectionChange={setCommentSection}
            onSubmit={async () => {
              if (!commentBody.trim()) return;
              try {
                await addSpecComment(
                  spec,
                  commentBody.trim(),
                  commentSection === "General" ? null : commentSection,
                );
                await refresh();
                setCommentBody("");
                toast.success("Comment added.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not add comment.");
              }
            }}
            onResolve={(commentId) => void handleCommentAction("resolve", commentId)}
            onDismiss={(commentId) => void handleCommentAction("dismiss", commentId)}
          />

          <DecisionCard decisions={specDecisions} onAddDecision={() => setDecisionModalOpen(true)} />

          <PreviewCard
            spec={spec}
            review={previewReview}
            onReviewPreview={() => window.location.assign(`/preview?specId=${encodeURIComponent(spec.id)}`)}
            onOpenExternal={() => {
              if (spec.previewUrl) window.open(spec.previewUrl, "_blank", "noopener,noreferrer");
            }}
            onApprove={() => void handlePreviewApprove()}
            onComment={() => setPreviewCommentOpen(true)}
            onReject={() => setPreviewRejectOpen(true)}
            onAddPreviewUrl={() => {
              const defaultUrl = `https://staging.launchos.dev/${slugify(spec.title)}`;
              void addPreviewUrlForSpec(spec, defaultUrl)
                .then(() => refresh())
                .then(() => toast.success("Preview URL saved."))
                .catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Could not save preview URL."),
                );
            }}
          />

          {spec.relatedFiles && spec.relatedFiles.length > 0 && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Related files
              </div>
              <ul className="space-y-1.5 p-4 font-mono text-xs text-muted-foreground">
                {spec.relatedFiles.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <Dialog open={confirmApprovedSaveOpen} onOpenChange={setConfirmApprovedSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update approved spec?</DialogTitle>
            <DialogDescription>
              This changes the approved requirement. The spec may need approval again before agent handoff.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            This spec is already approved. Changing the requirement may move it back to review.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmApprovedSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveSpec()}>Update approved spec</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add decision</DialogTitle>
            <DialogDescription>Record the product or implementation decision clearly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Question</div>
              <Input value={decisionQuestion} onChange={(event) => setDecisionQuestion(event.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Decision</div>
              <Textarea value={decisionValue} onChange={(event) => setDecisionValue(event.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAddDecision()}>Save decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assetModal} onOpenChange={(open) => !open && setAssetModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit image details</DialogTitle>
            <DialogDescription>Update alt text and caption for this asset.</DialogDescription>
          </DialogHeader>
          {assetModal && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Alt text</div>
                <Input
                  value={assetModal.altText ?? ""}
                  onChange={(event) => setAssetModal({ ...assetModal, altText: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Caption</div>
                <Textarea
                  value={assetModal.caption ?? ""}
                  onChange={(event) => setAssetModal({ ...assetModal, caption: event.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssetModal(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAssetMetadataSave()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewCommentOpen} onOpenChange={setPreviewCommentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment on preview</DialogTitle>
            <DialogDescription>Leave stakeholder feedback for the implementation team.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={previewFeedback}
            onChange={(event) => setPreviewFeedback(event.target.value)}
            rows={5}
            placeholder="What should change before approval?"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewCommentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handlePreviewComment()}>Send comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewRejectOpen} onOpenChange={setPreviewRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject preview</DialogTitle>
            <DialogDescription>This sends the spec back to developer review with a required reason.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={previewRejectionReason}
            onChange={(event) => setPreviewRejectionReason(event.target.value)}
            rows={5}
            placeholder="What needs to change?"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreviewRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handlePreviewReject()}>
              Submit rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function seedEditorState(spec: Spec): EditorState {
  return {
    title: spec.title,
    summary: spec.summary ?? "",
    audience: spec.audience ?? "",
    expectedBehavior: spec.expectedBehavior ?? spec.problem ?? "",
    acceptanceCriteria: spec.acceptanceCriteria.length ? [...spec.acceptanceCriteria] : [""],
    outOfScope: spec.outOfScope.length ? [...spec.outOfScope] : [""],
    openQuestions: spec.openQuestions.length ? [...spec.openQuestions] : [""],
    relatedFiles: spec.relatedFiles?.length ? [...spec.relatedFiles] : [""],
    technicalNotes: spec.technicalNotes ?? "",
    uiNotes: spec.uiNotes ?? "",
  };
}

function setDraftField<TKey extends keyof EditorState>(
  setDraft: Dispatch<SetStateAction<EditorState | null>>,
  field: TKey,
  value: EditorState[TKey],
) {
  setDraft((current) => (current ? { ...current, [field]: value } : current));
}

function sanitizeList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function ReadSection({ title, body }: { title: string; body?: string | null }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="rounded-lg border border-border bg-background p-4 text-sm leading-6">
        {body?.trim() ? body : <span className="text-muted-foreground">No details yet.</span>}
      </div>
    </div>
  );
}

function ReadListSection({
  title,
  items,
  success,
  accent,
}: {
  title: string;
  items: string[];
  success?: boolean;
  accent?: "amber";
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="rounded-lg border border-border bg-background p-4">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm">
                {success ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${accent === "amber" ? "bg-amber-400" : "bg-muted-foreground"}`} />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">No items yet.</div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}

function ListEditor({
  title,
  values,
  onChange,
  addLabel,
}: {
  title: string;
  values: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      <SectionHeader title={title} description="One item per row. Reorder manually if needed." />
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex gap-2">
            <Input
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onChange(values.length === 1 ? [""] : values.filter((_, itemIndex) => itemIndex !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...values, ""])}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

function AssetStrip({ assets }: { assets: SpecAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No images attached yet.
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-lg border border-border bg-card p-3">
          {asset.url ? (
            <img
              src={asset.url}
              alt={asset.altText ?? asset.fileName}
              className="aspect-[16/10] w-full rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Image URL unavailable
            </div>
          )}
          <div className="mt-2 text-sm font-medium">{asset.caption || asset.fileName}</div>
          {asset.altText && <div className="text-xs text-muted-foreground">{asset.altText}</div>}
        </div>
      ))}
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Workflow</div>
      <div className="mt-3 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current phase</span>
          <StatusPill status={spec.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Priority</span>
          <PriorityPill priority={spec.priority} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Owner</span>
          <span>{ownerName ?? spec.ownerId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Assignee</span>
          <span>{assigneeName ?? spec.assigneeId ?? "Unassigned"}</span>
        </div>
      </div>
    </div>
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
        <Button size="sm" variant="outline" onClick={onRunCheck}>
          Run check again
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Fix checklist created.")}>
          Create fix checklist
        </Button>
        <Button size="sm" variant="outline" onClick={onOpenAgent}>
          Open Agent Context
        </Button>
        <Button size="sm" onClick={onDismiss}>
          Mark as resolved
        </Button>
      </div>
    </div>
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
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          Comments
        </div>
        <div className="flex gap-1">
          {(["open", "resolved", "all"] as const).map((option) => (
            <button
              key={option}
              className={`rounded-md px-2 py-1 text-xs ${filter === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              onClick={() => onFilterChange(option)}
            >
              {option === "all" ? "All" : option === "open" ? "Open" : "Resolved"}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {filteredComments.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No comments in this view.</div>
        ) : (
          filteredComments.map((comment) => {
            const user = getUserDisplay(comment.authorId);
            return (
              <div key={comment.id} className="p-4">
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
                {comment.status === "resolved" && comment.resolvedBy && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Resolved by {getUserDisplay(comment.resolvedBy)?.name ?? comment.resolvedBy} on{" "}
                    {formatDate(comment.resolvedAt || comment.updatedAt || comment.createdAt)}
                  </div>
                )}
                {comment.status === "open" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => onResolve(comment.id)}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDismiss(comment.id)}>
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="space-y-2 border-t border-border p-4">
        <select
          value={commentSection}
          onChange={(event) => onCommentSectionChange(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {COMMENT_SECTIONS.map((section) => (
            <option key={section} value={section} className="bg-background">
              {section}
            </option>
          ))}
        </select>
        <Textarea
          value={commentBody}
          onChange={(event) => onCommentBodyChange(event.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <Button size="sm" className="w-full gap-1.5" onClick={onSubmit}>
          <Send className="h-3.5 w-3.5" />
          Comment
        </Button>
      </div>
    </div>
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
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Decisions</div>
        <Button size="sm" variant="outline" onClick={onAddDecision}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add decision
        </Button>
      </div>
      <div className="space-y-3 p-4">
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
                {decision.decidedBy ? `${getUserDisplay(decision.decidedBy)?.name ?? decision.decidedBy} · ` : ""}
                {decision.createdAt ? formatDate(decision.createdAt) : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PreviewCard({
  spec,
  review,
  onReviewPreview,
  onOpenExternal,
  onApprove,
  onComment,
  onReject,
  onAddPreviewUrl,
}: {
  spec: Spec;
  review: PreviewReview | null;
  onReviewPreview: () => void;
  onOpenExternal: () => void;
  onApprove: () => void;
  onComment: () => void;
  onReject: () => void;
  onAddPreviewUrl: () => void;
}) {
  const reviewer = getUserDisplay(review?.reviewedBy);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Preview
      </div>
      <div className="space-y-3 p-4">
        {spec.previewUrl || review?.previewUrl ? (
          <>
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-primary" />
              Preview ready
            </div>
            <div className="break-all text-xs text-cyan-300">{review?.previewUrl ?? spec.previewUrl}</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Status: {review?.status ?? spec.status}
              </div>
              {reviewer && <div className="text-muted-foreground">Reviewer: {reviewer.name}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onReviewPreview}>
                Review Preview
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenExternal}>
                Open staging URL
              </Button>
            </div>
            {spec.status === "stakeholder_review" && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={onApprove}>
                  Approve preview
                </Button>
                <Button size="sm" variant="outline" onClick={onComment}>
                  Comment
                </Button>
                <Button size="sm" variant="outline" onClick={onReject}>
                  Reject
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">No preview URL saved yet.</div>
            {spec.status === "preview" && (
              <Button size="sm" onClick={onAddPreviewUrl}>
                Add preview URL
              </Button>
            )}
          </>
        )}
      </div>
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
  navigate,
  refresh,
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
  navigate: ReturnType<typeof useNavigate>;
  refresh: () => Promise<void>;
  setStatus: (status: SpecStatus) => Promise<void>;
  onPreviewComment: () => void;
  onPreviewReject: () => void;
}) {
  const actions: Record<SpecStatus, { label: string; onClick: () => void; variant?: "default" | "outline" }[]> = {
    request: [
      { label: "Clarify with AI", onClick: () => toast.success("Clarifying questions generated."), variant: "outline" },
      { label: "Create draft", onClick: () => void setStatus("draft") },
    ],
    draft: [
      { label: "Edit spec", onClick: () => navigate({ to: "/specs/$id", params: { id: spec.id } }), variant: "outline" },
      { label: "Move to review", onClick: () => void setStatus("review") },
    ],
    review: [
      { label: "Add decision", onClick: () => toast.info("Use the decisions card in the right rail."), variant: "outline" },
      { label: "Approve spec", onClick: () => void setStatus("approved") },
    ],
    approved: [
      { label: "Sync to Git", onClick: () => void syncToGit(), variant: "outline" },
      { label: "Add to Build Queue", onClick: () => void setStatus("build_queue") },
    ],
    build_queue: [
      { label: "Generate Agent Context", onClick: () => void generateAgentContext(), variant: "outline" },
      { label: "Start development", onClick: () => void setStatus("in_development") },
    ],
    in_development: [
      { label: "Link branch", onClick: () => void createBranch(), variant: "outline" },
      { label: "Link PR", onClick: () => void linkPullRequest(), variant: "outline" },
      { label: "Move to Developer Review", onClick: () => void setStatus("developer_review") },
    ],
    developer_review: [
      { label: "Run Spec Check", onClick: () => void runCheck(), variant: "outline" },
      { label: "Approve for Preview", onClick: () => void setStatus("preview") },
    ],
    preview: [
      {
        label: "Add Preview URL",
        onClick: () => {
          const previewUrl = `https://staging.launchos.dev/${slugify(spec.title)}`;
          void addPreviewUrlForSpec(spec, previewUrl)
            .then(() => refresh())
            .then(() => toast.success("Preview URL saved."))
            .catch((error) =>
              toast.error(error instanceof Error ? error.message : "Could not save preview URL."),
            );
        },
        variant: "outline",
      },
      { label: "Send to Stakeholder Review", onClick: () => void setStatus("stakeholder_review") },
    ],
    stakeholder_review: [
      { label: "Review Preview", onClick: () => window.location.assign(`/preview?specId=${encodeURIComponent(spec.id)}`), variant: "outline" },
      { label: "Approve Preview", onClick: () => void setStatus("accepted") },
      { label: "Comment", onClick: onPreviewComment, variant: "outline" },
      { label: "Reject", onClick: onPreviewReject, variant: "outline" },
    ],
    accepted: [
      { label: "Generate release notes", onClick: () => toast.success("Release notes generated."), variant: "outline" },
      { label: "Mark done", onClick: () => void setStatus("done") },
    ],
    done: [
      { label: "Copy Markdown", onClick: () => toast.info("Use the Technical tab to copy Markdown."), variant: "outline" },
    ],
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions[spec.status].map((action) => (
        <Button key={action.label} size="sm" variant={action.variant ?? "default"} onClick={action.onClick}>
          {action.label}
        </Button>
      ))}
    </div>
  );
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
    "## Expected Behavior",
    spec.expectedBehavior || spec.problem || spec.summary || "",
    "",
    "## Acceptance Criteria",
    ...(spec.acceptanceCriteria.length ? spec.acceptanceCriteria.map((item) => `- ${item}`) : ["- (none)"]),
    "",
    "## Out of Scope",
    ...(spec.outOfScope.length ? spec.outOfScope.map((item) => `- ${item}`) : ["- (none)"]),
  ];

  if (spec.openQuestions.length) {
    lines.push("", "## Open Questions", ...spec.openQuestions.map((item) => `- ${item}`));
  }
  if (assets.length) {
    lines.push("", "## Screenshots / Images");
    for (const asset of assets) {
      lines.push(assetMarkdown(asset));
    }
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
  return `![${asset.altText || asset.fileName}](${asset.url || asset.storageKey}${asset.caption ? ` "${asset.caption}"` : ""})`;
}

function copyText(text: string, successMessage: string) {
  try {
    void navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("Could not copy to clipboard.");
  }
}

function downloadMarkdown(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast.success("Markdown downloaded.");
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
