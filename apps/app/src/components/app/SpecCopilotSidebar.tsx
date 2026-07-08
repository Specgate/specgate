import { useState } from "react";
import { Button } from "@corely/ui";
import { Loader2, Sparkles, Check, FileQuestion, ListChecks, ArrowRight, Bot } from "lucide-react";
import { toast } from "sonner";
import { SpecCopilotProposalDto } from "@corely/contracts/specgate";

export function SpecCopilotSidebar({
  specId,
  onApply,
}: {
  specId: string;
  onApply: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<SpecCopilotProposalDto | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  async function handleAction(action: string, label: string) {
    setLoading(true);
    setActiveAction(action);
    try {
      const res = await fetch(`/api/specgate/specs/${specId}/copilot/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userInstruction: label }),
      });
      if (!res.ok) throw new Error("Failed to get proposal");
      const data = await res.json();
      setProposal(data);
      setSelectedChanges(data.proposedChanges.map((c: any) => c.field));
    } catch (err) {
      toast.error(`Copilot failed to ${label.toLowerCase()}.`);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  }

  async function handleApply() {
    if (!proposal) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/specgate/specs/${specId}/copilot/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: { selectedChanges },
          proposal,
        }),
      });
      if (!res.ok) throw new Error("Failed to apply proposal");
      toast.success("Changes applied successfully.");
      onApply();
      setProposal(null);
    } catch (err) {
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-border bg-slate-50/50">
      <div className="p-4 border-b border-border flex items-center gap-2 font-medium text-sm">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        Spec Copilot
      </div>
      
      {!proposal ? (
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-4">
            Copilot can help extract requirements from your document into structured fields for engineers.
          </p>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal gap-3 h-auto py-3" 
            onClick={() => handleAction("improve_spec", "Clean up and structure")}
            disabled={loading}
          >
            {loading && activeAction === "improve_spec" ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> : <Sparkles className="h-4 w-4 text-indigo-500" />}
            <div className="flex flex-col items-start">
              <span className="text-sm">Clean it up</span>
              <span className="text-xs text-muted-foreground">Extract structured fields</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal gap-3 h-auto py-3" 
            onClick={() => handleAction("identify_open_questions", "Ask missing questions")}
            disabled={loading}
          >
            {loading && activeAction === "identify_open_questions" ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <FileQuestion className="h-4 w-4 text-blue-500" />}
            <div className="flex flex-col items-start">
              <span className="text-sm">Ask missing questions</span>
              <span className="text-xs text-muted-foreground">Find unstated assumptions</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal gap-3 h-auto py-3" 
            onClick={() => handleAction("generate_acceptance_criteria", "Generate acceptance criteria")}
            disabled={loading}
          >
            {loading && activeAction === "generate_acceptance_criteria" ? <Loader2 className="h-4 w-4 animate-spin text-green-500" /> : <ListChecks className="h-4 w-4 text-green-500" />}
            <div className="flex flex-col items-start">
              <span className="text-sm">Acceptance criteria</span>
              <span className="text-xs text-muted-foreground">Draft criteria for testing</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal gap-3 h-auto py-3" 
            onClick={() => handleAction("rewrite_for_agent_handoff", "Prepare for agent handoff")}
            disabled={loading}
          >
            {loading && activeAction === "rewrite_for_agent_handoff" ? <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> : <Bot className="h-4 w-4 text-orange-500" />}
            <div className="flex flex-col items-start">
              <span className="text-sm">Agent handoff</span>
              <span className="text-xs text-muted-foreground">Optimize for AI agents</span>
            </div>
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 space-y-4 flex-1">
            <div className="font-medium text-sm flex items-center justify-between">
              Proposed Changes
              <Button variant="ghost" size="sm" onClick={() => setProposal(null)} className="h-7 text-xs">Cancel</Button>
            </div>
            {proposal.proposedChanges.map((change: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-indigo-600"
                  checked={selectedChanges.includes(change.field)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChanges([...selectedChanges, change.field]);
                    } else {
                      setSelectedChanges(selectedChanges.filter((f) => f !== change.field));
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2">
                    {change.field} 
                    <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">{change.operation}</span>
                  </div>
                  <div className="mt-1.5 whitespace-pre-wrap text-muted-foreground bg-slate-50 p-2 rounded text-xs border border-slate-100 max-h-40 overflow-y-auto">{change.after}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border bg-white sticky bottom-0">
            <Button 
              onClick={handleApply} 
              disabled={loading || selectedChanges.length === 0} 
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Apply {selectedChanges.length} Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
