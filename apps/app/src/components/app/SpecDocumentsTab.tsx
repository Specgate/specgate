"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/specgate-api";
import { Button } from "@corely/ui";
import { FileText, Link2, Plus, X, Search } from "lucide-react";
import type { SpecGateDocumentListItemDto } from "@corely/contracts/specgate";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@corely/ui";
import { Input } from "@corely/ui";

export function SpecDocumentsTab({ specId, projectId }: { specId: string; projectId: string }) {
  const [documents, setDocuments] = useState<SpecGateDocumentListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [specId, projectId]);

  async function loadDocuments() {
    setLoading(true);
    try {
      const response = await api<{ data: SpecGateDocumentListItemDto[] }>(
        `/specs/${specId}/documents`
      );
      setDocuments(response.data);
    } catch (err: unknown) {
      toast.error("Failed to load linked documents");
    } finally {
      setLoading(false);
    }
  }

  async function unlinkDocument(documentId: string) {
    if (!window.confirm("Unlink this document from the spec?")) return;
    try {
      await api(`/specs/${specId}/documents/${documentId}`, { method: "DELETE" });
      setDocuments((docs) => docs.filter((d) => d.id !== documentId));
      toast.success("Document unlinked");
    } catch (err: unknown) {
      toast.error("Failed to unlink document");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold">Project Knowledge</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Link relevant project documents, research, and rules to provide context.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setLinkModalOpen(true)}>
            <Link2 className="h-3.5 w-3.5" /> Link Document
          </Button>
        </div>
      </div>
      
      <div className="pt-5">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground p-6">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="text-center p-10 border border-dashed rounded-lg bg-muted/20">
            <div className="mx-auto w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-3">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">No documents linked</h3>
            <p className="text-sm text-muted-foreground">
              Link product briefs, research, or business rules to help engineering context.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-lg border bg-background p-4 relative group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <a 
                      href={`/documents/${doc.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {doc.title}
                    </a>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => unlinkDocument(doc.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {doc.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {doc.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-secondary/50">
                    {doc.type.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {linkModalOpen && (
        <LinkDocumentModal
          open={linkModalOpen}
          onOpenChange={setLinkModalOpen}
          projectId={projectId}
          specId={specId}
          onLinked={(doc) => {
            if (!documents.find(d => d.id === doc.id)) {
              setDocuments([...documents, doc]);
            }
            setLinkModalOpen(false);
          }}
        />
      )}
    </section>
  );
}

function LinkDocumentModal({
  open,
  onOpenChange,
  projectId,
  specId,
  onLinked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  specId: string;
  onLinked: (doc: SpecGateDocumentListItemDto) => void;
}) {
  const [documents, setDocuments] = useState<SpecGateDocumentListItemDto[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);

  useEffect(() => {
    if (open) loadAllDocuments();
  }, [open]);

  async function loadAllDocuments() {
    setLoading(true);
    try {
      const response = await api<{ data: SpecGateDocumentListItemDto[] }>(
        `/projects/${projectId}/documents`
      );
      setDocuments(response.data);
    } catch (err: unknown) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function linkDocument(doc: SpecGateDocumentListItemDto) {
    setLinking(doc.id);
    try {
      await api(`/specs/${specId}/documents`, {
        method: "POST",
        body: JSON.stringify({ documentId: doc.id }),
      });
      toast.success("Document linked");
      onLinked(doc);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate document");
    } finally {
      setLinking(null);
    }
  }

  const filtered = documents.filter(d => 
    !q || d.title.toLowerCase().includes(q.toLowerCase()) || d.summary?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Document</DialogTitle>
          <DialogDescription className="sr-only">Search and select a document to link to this spec.</DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <div className="mt-4 max-h-[300px] overflow-auto space-y-2 border rounded-md p-2">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground p-4">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">No documents found.</div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                <div className="min-w-0 pr-4">
                  <div className="font-medium text-sm truncate">{doc.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{doc.type.replace("_", " ")}</div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => linkDocument(doc)}
                  disabled={!!linking}
                >
                  {linking === doc.id ? "Linking..." : "Link"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
