"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell/SpecGateAppShell";
import { useSpecGateQueryStore } from "@/lib/specgate-query";
import { api } from "@/lib/specgate-api";
import { Button, Input, Tabs, TabsList, TabsTrigger } from "@corely/ui";
import { Search, Plus, FileText } from "lucide-react";
import { NewDocumentModal } from "@/components/app/NewDocumentModal";
import type { SpecGateDocumentListItemDto } from "@corely/contracts/specgate";
import { formatDistanceToNow } from "date-fns";

export default function DocumentsPage() {
  const { state } = useSpecGateQueryStore();
  const [documents, setDocuments] = useState<SpecGateDocumentListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (state.currentProjectId) {
      loadDocuments();
    }
  }, [state.currentProjectId, typeFilter]);

  async function loadDocuments() {
    setLoading(true);
    try {
      const url = new URL(`/api/specgate/projects/${state.currentProjectId}/documents`, window.location.origin);
      if (typeFilter !== "all") {
        url.searchParams.set("type", typeFilter);
      }
      const response = await api<{ data: SpecGateDocumentListItemDto[] }>(url.pathname + url.search);
      setDocuments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = documents.filter((d) => {
    if (q) {
      const lowerQ = q.toLowerCase();
      return d.title.toLowerCase().includes(lowerQ) || d.summary?.toLowerCase().includes(lowerQ);
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Project Knowledge"
        description="Background documents, research, and guidelines for your project."
        actions={
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Document
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="product_brief">Briefs</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="business_rule">Rules</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8 h-9 bg-card"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_100px_120px] gap-4 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <div>Title</div>
            <div>Type</div>
            <div>Specs Linked</div>
            <div className="text-right">Updated</div>
          </div>
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No documents found. {q ? "Try adjusting your search." : "Create one to get started."}
            </div>
          ) : (
            filtered.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="block md:grid grid-cols-[1fr_120px_100px_120px] gap-4 px-4 py-3.5 items-center border-b border-border last:border-0 hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{doc.title}</div>
                    {doc.summary && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.summary}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                    {doc.type.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-2 md:mt-0 text-xs text-muted-foreground">
                  {doc.linkedSpecCount} spec{doc.linkedSpecCount === 1 ? "" : "s"}
                </div>
                <div className="mt-2 md:mt-0 text-xs text-muted-foreground text-right">
                  {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <NewDocumentModal open={open} onOpenChange={setOpen} />
    </>
  );
}
