"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@corely/ui";
import { Button } from "@corely/ui";
import { Input } from "@corely/ui";
import { Label } from "@corely/ui";
import { toast } from "sonner";
import { createProject } from "@/lib/specgate-api";
import { useSpecGateStore } from "@/lib/specgate-store";

export function NewProjectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }): any {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { state, setProject } = useSpecGateStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const project = await createProject(name.trim(), state.currentWorkspaceId);
      await setProject(project.id);
      toast.success(`Project "${project.name}" created successfully`);
      setTimeout(() => onOpenChange(false), 0);
      setName("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LaunchOS v2"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
