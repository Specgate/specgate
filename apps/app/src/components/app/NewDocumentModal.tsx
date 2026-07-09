"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@corely/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@corely/ui";
import { useSpecGateStore } from "@/lib/specgate-store";
import { api } from "@/lib/specgate-api";
import { toast } from "sonner";
import type { SpecGateDocumentDto } from "@corely/contracts/specgate";

export function NewDocumentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { state } = useSpecGateStore();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("product_brief");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !state.currentProjectId) return;

    setLoading(true);
    try {
      const response = await api<{ data: SpecGateDocumentDto }>(
        `/projects/${state.currentProjectId}/documents`,
        {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            summary: summary.trim() || undefined,
            type,
            status: "draft",
          }),
        }
      );
      toast.success("Document created");
      onOpenChange(false);
      setTitle("");
      setSummary("");
      router.push(`/documents/${response.data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Launch Plan"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="product_brief">Product Brief</option>
              <option value="research">Customer Research</option>
              <option value="persona">User Persona</option>
              <option value="business_rule">Business Rule</option>
              <option value="ux_note">UX Note</option>
              <option value="api_note">API Note</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Optional)</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Briefly describe the purpose of this document..."
              className="resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
