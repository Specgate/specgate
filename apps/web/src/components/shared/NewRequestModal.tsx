import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoStore, nextRequestId } from "@/lib/demo-store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { Priority, RoadmapLane } from "@/types/demo";

export function NewRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { state, addSpec, addActivity } = useDemoStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [who, setWho] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [timeline, setTimeline] = useState("MVP");

  function submit() {
    if (!title.trim()) {
      toast.error("Please describe what you want to build.");
      return;
    }
    const id = nextRequestId(state.specs);
    const lane: RoadmapLane = priority === "urgent" || priority === "high" ? "Now" : "Icebox";
    addSpec({
      id,
      title: title.slice(0, 80),
      status: "request",
      priority,
      roadmapLane: lane,
      milestoneId: timeline === "Private Beta" ? "beta" : timeline === "v1 Launch" ? "v1" : "mvp",
      ownerId: "u-ha",
      summary: title,
      problem: why,
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
    addActivity({
      id: `a-${Date.now()}`,
      text: `Ha created ${id} from a request.`,
      time: "just now",
      specId: id,
    });
    toast.success("Request created. AI has generated clarification questions.");
    onOpenChange(false);
    setTitle(""); setWhy(""); setWho("");
    navigate({ to: "/specs/$id", params: { id } });
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
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MVP">MVP</SelectItem>
                  <SelectItem value="Private Beta">Private Beta</SelectItem>
                  <SelectItem value="v1 Launch">v1 Launch</SelectItem>
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
