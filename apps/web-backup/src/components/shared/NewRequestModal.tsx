import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@corely/ui";
import { Input } from "@corely/ui";
import { Textarea } from "@corely/ui";
import { Button } from "@corely/ui";
import { Label } from "@corely/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@corely/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@corely/ui";
import { Badge } from "@corely/ui";
import { Alert, AlertDescription, AlertTitle } from "@corely/ui";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDemoStore, nextRequestId } from "@/lib/demo-store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { Priority, RoadmapLane } from "@/types/demo";
import { validateAgentReadiness } from "@/lib/agent-readiness";

export function NewRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { state, addSpec, addActivity } = useDemoStore();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<any>("feature");
  const [priority, setPriority] = useState<Priority>("medium");
  const [lane, setLane] = useState<RoadmapLane>("Now");
  
  const [goal, setGoal] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [openQuestions, setOpenQuestions] = useState("");
  
  const [requiresCodeChanges, setRequiresCodeChanges] = useState<any>("unknown");
  const [riskLevel, setRiskLevel] = useState<any>("medium");
  const [suggestedSearchTerms, setSuggestedSearchTerms] = useState("");
  const [relatedFiles, setRelatedFiles] = useState("");
  const [verificationPlan, setVerificationPlan] = useState("");

  const splitLines = (str: string) => str.split("\n").map(s => s.trim()).filter(Boolean);

  const specData = useMemo(() => ({
    summary: goal,
    expectedBehavior: desiredOutcome,
    acceptanceCriteria: splitLines(acceptanceCriteria),
    outOfScope: splitLines(outOfScope),
    openQuestions: splitLines(openQuestions),
    requiresCodeChanges,
    riskLevel,
    suggestedSearchTerms: splitLines(suggestedSearchTerms),
    relatedFiles: splitLines(relatedFiles),
    verificationPlan: splitLines(verificationPlan)
  }), [
    goal, desiredOutcome, acceptanceCriteria, outOfScope, openQuestions,
    requiresCodeChanges, riskLevel, suggestedSearchTerms, relatedFiles, verificationPlan
  ]);

  const readiness = validateAgentReadiness(specData);

  function submit() {
    if (!title.trim()) {
      toast.error("Please provide a title.");
      return;
    }
    
    const id = nextRequestId(state.specs);
    
    addSpec({
      id,
      title: title.slice(0, 80),
      type,
      status: "request",
      priority,
      roadmapLane: lane,
      agentReadiness: readiness.status,
      milestoneId: "mvp",
      ownerId: "u-ha",
      summary: goal,
      expectedBehavior: desiredOutcome,
      acceptanceCriteria: specData.acceptanceCriteria,
      outOfScope: specData.outOfScope,
      openQuestions: specData.openQuestions,
      requiresCodeChanges,
      riskLevel,
      suggestedSearchTerms: specData.suggestedSearchTerms,
      relatedFiles: specData.relatedFiles,
      verificationPlan: specData.verificationPlan,
      agentTargets: ["claude_code", "codex", "cursor", "github_copilot", "generic_markdown"],
      decisions: [],
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    
    addActivity({
      id: `a-${Date.now()}`,
      text: `Ha created ${id} from a request.`,
      time: "just now",
      specId: id,
    });
    
    toast.success("Request created.");
    onOpenChange(false);
    
    setTitle(""); setGoal(""); setDesiredOutcome(""); setAcceptanceCriteria("");
    setOutOfScope(""); setOpenQuestions(""); setSuggestedSearchTerms(""); 
    setRelatedFiles(""); setVerificationPlan("");
    
    navigate({ to: "/specs/$id", params: { id } });
  }

  const badgeProps = {
    ready_for_agent: { label: "Ready for agent", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    needs_clarification: { label: "Needs clarification", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    draft: { label: "Draft", color: "bg-secondary text-secondary-foreground" },
    blocked: { label: "Blocked", color: "bg-destructive/10 text-destructive border-destructive/20" }
  };
  
  const currentBadge = badgeProps[readiness.status as keyof typeof badgeProps];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>New Request</DialogTitle>
          <DialogDescription>Create a new request using Ticket Format v2.</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="agent">Agent Readiness</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Let admins export team activity" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="refactor">Refactor</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="chore">Chore</SelectItem>
                      <SelectItem value="spike">Spike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label>Roadmap Lane</Label>
                <Select value={lane} onValueChange={(v) => setLane(v as RoadmapLane)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Now">Now</SelectItem>
                    <SelectItem value="Next">Next</SelectItem>
                    <SelectItem value="Later">Later</SelectItem>
                    <SelectItem value="Icebox">Icebox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Goal / Summary</Label>
                <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} placeholder="Brief summary of the goal..." />
              </div>
              <div className="space-y-1.5">
                <Label>Desired Outcome</Label>
                <Textarea value={desiredOutcome} onChange={(e) => setDesiredOutcome(e.target.value)} rows={2} placeholder="What does success look like?..." />
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Acceptance Criteria (one per line)</Label>
                <Textarea value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} rows={3} placeholder="User can upload image or PDF..." />
              </div>
              <div className="space-y-1.5">
                <Label>Out of Scope (one per line)</Label>
                <Textarea value={outOfScope} onChange={(e) => setOutOfScope(e.target.value)} rows={2} placeholder="Large video uploads..." />
              </div>
              <div className="space-y-1.5">
                <Label>Open Questions (one per line)</Label>
                <Textarea value={openQuestions} onChange={(e) => setOpenQuestions(e.target.value)} rows={2} placeholder="Who is the primary user?..." />
              </div>
            </TabsContent>
            
            <TabsContent value="agent" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Requires Code Changes?</Label>
                  <Select value={requiresCodeChanges} onValueChange={setRequiresCodeChanges}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Risk Level</Label>
                  <Select value={riskLevel} onValueChange={setRiskLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label>Suggested Search Terms (one per line)</Label>
                <Textarea value={suggestedSearchTerms} onChange={(e) => setSuggestedSearchTerms(e.target.value)} rows={2} placeholder="e.g. uploadService, asset limits" />
              </div>
              <div className="space-y-1.5">
                <Label>Related Files / Areas (one per line)</Label>
                <Textarea value={relatedFiles} onChange={(e) => setRelatedFiles(e.target.value)} rows={2} placeholder="apps/web/src/features/assets" />
              </div>
              <div className="space-y-1.5">
                <Label>Verification Plan (one per line)</Label>
                <Textarea value={verificationPlan} onChange={(e) => setVerificationPlan(e.target.value)} rows={2} placeholder="pnpm run test:assets" />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm font-semibold">Agent Readiness Preview</Label>
              <Badge variant="outline" className={currentBadge?.color}>{currentBadge?.label}</Badge>
            </div>
            
            {readiness.missingFields.length > 0 ? (
              <Alert variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20 py-2.5">
                <AlertTriangle className="h-4 w-4 stroke-amber-600" />
                <AlertTitle className="text-sm mb-1">Missing items before agent handoff:</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 text-xs space-y-0.5">
                    {readiness.missingFields.map((field, i) => (
                      <li key={i}>{field}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-2.5">
                <CheckCircle2 className="h-4 w-4 stroke-emerald-600" />
                <AlertTitle className="text-sm mb-0">Ready for Agent Handoff!</AlertTitle>
              </Alert>
            )}
          </div>
        </div>
        
        <DialogFooter className="pt-2 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
