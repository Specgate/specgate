"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Inbox,
  Map as MapIcon,
  ListChecks,
  CalendarRange,
  Eye,
  CheckCircle2,
  Settings,
  Search,
  Plus,
  Compass,
  Sparkles,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@corely/ui/utils";
import { Button } from "@corely/ui";
import { Input } from "@corely/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@corely/ui";
import { useSpecGateQueryStore } from "@/lib/specgate-query";
import { toast } from "sonner";
import { NewRequestModal } from "@/components/shared/NewRequestModal";
import { NewProjectModal } from "@/components/shared/NewProjectModal";
import { NewWorkspaceModal } from "@/components/shared/NewWorkspaceModal";

const nav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/backlog", label: "Backlog", icon: Inbox },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/roadmap", label: "Roadmap", icon: MapIcon },
  { href: "/build-queue", label: "Build Queue", icon: ListChecks },
  { href: "/build-cycles", label: "Build Cycles", icon: CalendarRange },
  { href: "/preview", label: "Preview", icon: Eye },
  { href: "/done", label: "Done", icon: CheckCircle2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SpecGateAppShell({ children }: { children: any }): any {
  const pathname = usePathname();
  const router = useRouter();
  const { state, loading, error, refresh, setMode, setWorkspace, setProject } =
    useSpecGateQueryStore();
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [workspaceSelectOpen, setWorkspaceSelectOpen] = useState(false);
  const [projectSelectOpen, setProjectSelectOpen] = useState(false);

  const workspaces = state.workspaces;
  const workspaceName =
    workspaces.find((w) => w.id === state.currentWorkspaceId)?.name ??
    "No workspace";
  const projects = state.projects.filter(
    (p) => p.workspaceId === state.currentWorkspaceId,
  );
  const projectName =
    projects.find((p) => p.id === state.currentProjectId)?.name ?? "No project";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 h-14 border-b border-border"
        >
          <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-primary to-indigo-500 glow-primary">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">SpecGate</span>
        </Link>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/backlog" && pathname.startsWith("/specs/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {projectName} Team
            </span>
          </div>
          <div>Mode: {state.mode === "team" ? "Team Mode" : "Solo Mode"}</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-3 border-b border-border px-4 lg:px-6 bg-background/80 backdrop-blur sticky top-0 z-30">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-primary to-indigo-500">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">SpecGate</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Select
                open={workspaceSelectOpen}
                onOpenChange={setWorkspaceSelectOpen}
                value={state.currentWorkspaceId}
                onValueChange={(v) => {
                  void setWorkspace(v).then(() => {
                    toast.success(
                      `Switched to ${workspaces.find((w) => w.id === v)?.name ?? "workspace"}.`,
                    );
                  });
                }}
              >
                <SelectTrigger className="h-8 w-40 bg-card border-border font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setTimeout(() => setNewWorkspaceOpen(true), 10);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Workspace
              </Button>
            </div>

            <span className="text-muted-foreground">/</span>

            <div className="flex items-center gap-1">
              <Select
                open={projectSelectOpen}
                onOpenChange={setProjectSelectOpen}
                value={state.currentProjectId}
                onValueChange={(v) => {
                  void setProject(v).then(() => {
                    toast.success(
                      `Switched to ${projects.find((p) => p.id === v)?.name ?? "project"}.`,
                    );
                  });
                }}
              >
                <SelectTrigger className="h-8 w-44 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setTimeout(() => setNewProjectOpen(true), 10);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search specs by title or ID…"
                className="h-8 pl-8 bg-card border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = (e.target as HTMLInputElement).value.trim();
                    if (!q) return;
                    const match = state.specs.find(
                      (s) =>
                        s.id.toLowerCase().includes(q.toLowerCase()) ||
                        s.title.toLowerCase().includes(q.toLowerCase()),
                    );
                    if (match) router.push(`/specs/${match.id}`);
                    else toast.info("No specs matched.");
                  }
                }}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 rounded-md border border-border p-0.5 text-xs">
            <button
              onClick={() => setMode("team")}
              className={cn(
                "px-2.5 py-1 rounded",
                state.mode === "team"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              Team
            </button>
            <button
              onClick={() => setMode("solo")}
              className={cn(
                "px-2.5 py-1 rounded",
                state.mode === "solo"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              Solo
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setNewRequestOpen(true)}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Request</span>
          </Button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex overflow-x-auto gap-1 border-b border-border px-2 py-2 bg-background/80">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0">
          {error ? (
            <div className="m-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <div className="font-medium text-destructive">
                SpecGate API failed to load
              </div>
              <p className="mt-1 text-muted-foreground">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => void refresh()}
              >
                Retry
              </Button>
            </div>
          ) : loading && state.specs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Loading SpecGate data...
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="border-t border-border px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> Connected to SpecGate
            API
          </span>
          <span>SpecGate</span>
        </footer>
      </div>

      <NewRequestModal open={newRequestOpen} onOpenChange={setNewRequestOpen} />
      <NewProjectModal open={newProjectOpen} onOpenChange={setNewProjectOpen} />
      <NewWorkspaceModal
        open={newWorkspaceOpen}
        onOpenChange={setNewWorkspaceOpen}
      />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string | React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-border px-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
