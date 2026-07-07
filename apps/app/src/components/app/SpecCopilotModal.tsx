import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@corely/ui";
import { Button } from "@corely/ui";
import { Textarea } from "@corely/ui";
import { Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export function SpecCopilotModal({
  specId,
  open,
  onOpenChange,
  onApply,
}: {
  specId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);

  async function handlePropose() {
    if (!instruction.trim()) {
      toast.error("Please enter instructions for the Copilot.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/specgate/specs/${specId}/copilot/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "improve_spec", userInstruction: instruction }),
      });
      if (!res.ok) throw new Error("Failed to get proposal");
      const data = await res.json();
      setProposal(data);
      setSelectedChanges(data.proposedChanges.map((c: any) => c.field));
    } catch (err) {
      toast.error("Copilot failed to propose changes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
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
      onOpenChange(false);
      setProposal(null);
      setInstruction("");
    } catch (err) {
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Spec Copilot
          </DialogTitle>
          <DialogDescription>
            Ask the AI to improve, expand, or fix the spec. It will analyze edge cases, missing context, and engineering details.
          </DialogDescription>
        </DialogHeader>

        {!proposal ? (
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="e.g. Expand the security notes for the API endpoint, and add edge cases for offline behavior."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handlePropose} disabled={loading} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Proposal
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="font-medium text-sm">Proposed Changes:</div>
            {proposal.proposedChanges.map((change: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedChanges.includes(change.field)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChanges([...selectedChanges, change.field]);
                    } else {
                      setSelectedChanges(selectedChanges.filter((f) => f !== change.field));
                    }
                  }}
                />
                <div className="flex-1">
                  <div className="font-semibold">{change.field} <span className="text-xs text-slate-500 font-normal ml-2 bg-slate-200 px-1 rounded">{change.operation}</span></div>
                  <div className="mt-1 whitespace-pre-wrap">{change.after}</div>
                  {change.rationale && (
                    <div className="mt-2 text-xs text-slate-500 italic">Reason: {change.rationale}</div>
                  )}
                </div>
              </div>
            ))}
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setProposal(null)}>Back</Button>
              <Button onClick={handleApply} disabled={loading || selectedChanges.length === 0} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Apply Selected Changes
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

