import { useState } from "react";
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
import { useSpecGateQueryStore, nextRequestId } from "@/lib/specgate-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Priority, RoadmapLane } from "@/types/specgate";
import { useAuth } from "@/components/auth/auth-context";

export function NewRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }): React.ReactNode {
  const { state, addSpec } = useSpecGateQueryStore();
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [who, setWho] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [timeline, setTimeline] = useState("");
  const timelineIds = new Set(state.milestones.map((milestone) => milestone.id));
  const selectedTimeline =
    timeline && timelineIds.has(timeline) ? timeline : state.milestones[0]?.id ?? "none";

  async function submit() {
    if (!title.trim()) {
      toast.error("Please describe what you want to build.");
      return;
    }
    const id = nextRequestId(state.specs);
    const lane: RoadmapLane = priority === "urgent" || priority === "high" ? "Now" : "Icebox";
    const milestoneId = selectedTimeline === "none" ? "" : selectedTimeline;
    try {
      const created = await addSpec({
        id,
        title: title.slice(0, 80),
        status: "request",
        priority,
        roadmapLane: lane,
        milestoneId,
        ownerId: user?.userId ?? "",
        summary: title,
        background: why,
        desiredOutcome: title,
        acceptanceCriteria: [],
        outOfScope: [],
        openQuestions: [
          "Who is the primary user?",
          "What does success look like?",
          "What is explicitly out of scope?",
        ],
        decisions: [],
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      toast.success("Request created. AI has generated clarification questions.");
      onOpenChange(false);
      setTitle(""); setWhy(""); setWho("");
      router.push(`/specs/${created.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create request.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New request</DialogTitle>
          <DialogDescription>Describe what you want to build. AI will help clarify it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>What do you want to build or change?</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Let admins export team activity" />
          </div>
          <div className="space-y-1.5">
            <Label>Why is this needed?</Label>
            <Textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} placeholder="The problem this solves…" />
          </div>
          <div className="space-y-1.5">
            <Label>Who is this for?</Label>
            <Input value={who} onChange={(e) => setWho(e.target.value)} placeholder="e.g. Admins, paid users" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-1.5">
              <Label>Desired timeline</Label>
              <Select value={selectedTimeline} onValueChange={setTimeline}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {state.milestones.length > 0 ? (
                    state.milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none">Unassigned</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
