"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app-shell/SpecGateAppShell";
import { useSpecGateQueryStore } from "@/lib/specgate-query";
import { api } from "@/lib/specgate-api";
import { Button, Input } from "@corely/ui";
import { ArrowLeft, Save, Trash2, FileText, Upload, X } from "lucide-react";
import type { SpecGateDocumentDto, SpecGateDocumentAssetDto } from "@corely/contracts/specgate";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/app/RichTextEditor";
import { formatDistanceToNow } from "date-fns";
import { rehydrateImageSrc, stripImageSrc } from "@/components/app/editor-utils";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state } = useSpecGateQueryStore();
  
  const [document, setDocument] = useState<SpecGateDocumentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [contentJson, setContentJson] = useState<unknown>(null);
  
  // Ref for tracking dirty state if needed
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (state.currentProjectId && id) {
      loadDocument();
    }
  }, [state.currentProjectId, id]);

  async function loadDocument() {
    try {
      const response = await api<{ data: SpecGateDocumentDto }>(
        `/projects/${state.currentProjectId}/documents/${id}`
      );
      const doc = response.data;
      setDocument(doc);
      setTitle(doc.title);
      setType(doc.type);
      setContentJson(rehydrateImageSrc(doc.contentJson, doc.assets || []));
      setIsDirty(false);
    } catch (err: unknown) {
      toast.error("Failed to load document");
      router.push("/documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!state.currentProjectId || !document) return;
    setSaving(true);
    try {
      const response = await api<{ data: SpecGateDocumentDto }>(
        `/projects/${state.currentProjectId}/documents/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title,
            type,
            contentJson: stripImageSrc(contentJson),
          }),
        }
      );
      setDocument(response.data);
      setIsDirty(false);
      toast.success("Saved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!state.currentProjectId || !document) return;
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await api(`/projects/${state.currentProjectId}/documents/${id}`, {
        method: "DELETE",
      });
      toast.success("Document deleted");
      router.push("/documents");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!state.currentProjectId || !e.target.files?.length) return;
    const file = e.target.files[0];
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File must be less than 25MB");
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("documentId", id);
      
      const response = await api<{ data: { asset: SpecGateDocumentAssetDto } }>(
        `/projects/${state.currentProjectId}/documents/assets`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (document) {
        setDocument({
          ...document,
          assets: [...(document.assets || []), response.data.asset],
        });
      }
      toast.success("Asset uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function uploadImagesFromEditor(files: FileList | File[]): Promise<Array<{ url: string; assetId: string; storageKey: string; fileName: string; contentType: string }>> {
    if (!state.currentProjectId || !files || files.length === 0) return [];
    
    const allFiles = Array.from(files);
    const imageFiles = allFiles.filter((file) =>
      ["image/png", "image/jpeg", "image/webp"].includes(file.type),
    );
    if (imageFiles.length !== allFiles.length) {
      toast.error("Unsupported file type. Please upload PNG, JPG, or WebP.");
    }

    const uploadedAssets: Array<{ url: string; assetId: string; storageKey: string; fileName: string; contentType: string }> = [];
    
    for (const file of imageFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image is too large. Please upload an image under 10MB.");
        continue;
      }
      
      setUploading(true);
      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("documentId", id);
        
        const response = await api<{ data: { asset: SpecGateDocumentAssetDto } }>(
          `/projects/${state.currentProjectId}/documents/assets`,
          {
            method: "POST",
            body: formData,
          }
        );
        
        if (document) {
          setDocument({
            ...document,
            assets: [...(document.assets || []), response.data.asset],
          });
        }
        
        uploadedAssets.push({
          url: response.data.asset.url || "",
          assetId: response.data.asset.id,
          storageKey: response.data.asset.storageKey,
          fileName: response.data.asset.fileName,
          contentType: response.data.asset.contentType,
        });
        toast.success(`${file.name} uploaded.`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : `Could not upload ${file.name}.`);
      } finally {
        setUploading(false);
      }
    }
    
    return uploadedAssets;
  }

  async function handleDeleteAsset(assetId: string) {
    if (!state.currentProjectId || !document) return;
    if (!window.confirm("Delete this asset?")) return;
    
    try {
      await api(
        `/projects/${state.currentProjectId}/documents/${id}/assets/${assetId}`,
        { method: "DELETE" }
      );
      setDocument({
        ...document,
        assets: (document.assets || []).filter((a) => a.id !== assetId),
      });
      toast.success("Asset deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete asset");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading document...</div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/documents")}
                className="-ml-2 h-8 w-8 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                className="h-9 w-[300px] border-transparent bg-transparent px-2 text-xl font-semibold shadow-none focus-visible:border-input focus-visible:bg-background"
              />
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 overflow-auto bg-muted/20 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Content
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                
                <RichTextEditor
                  value={contentJson}
                  onChange={(val) => {
                    setContentJson(val);
                    setIsDirty(true);
                  }}
                  onPlainTextChange={() => {}}
                  placeholder="Start writing..."
                  onImageUpload={uploadImagesFromEditor}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <h3 className="font-semibold text-sm">Metadata</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setIsDirty(true);
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Assets & Files</h3>
                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      accept="image/*,application/pdf"
                    />
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" disabled={uploading}>
                      <Upload className="h-3 w-3" /> {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {!document.assets?.length ? (
                    <div className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                      No files attached
                    </div>
                  ) : (
                    document.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-2 rounded-md border border-border/50 bg-muted/30 group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="h-8 w-8 shrink-0 rounded bg-background flex items-center justify-center border">
                            {asset.kind === "image" ? (
                              asset.url ? (
                                <img src={asset.url} alt="" className="h-full w-full object-cover rounded" />
                              ) : (
                                <span className="text-[10px] text-muted-foreground">IMG</span>
                              )
                            ) : (
                              <span className="text-[10px] text-muted-foreground">PDF</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{asset.fileName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {asset.url && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                              <a href={asset.url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
