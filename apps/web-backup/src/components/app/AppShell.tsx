import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@corely/ui/utils";
import { Button } from "@corely/ui";
import { Input } from "@corely/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@corely/ui";
import { useDemoStore } from "@/lib/demo-store";
import { projects } from "@/lib/mock-data";
import { toast } from "sonner";
import { NewRequestModal } from "@/components/shared/NewRequestModal";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/backlog", label: "Backlog", icon: Inbox },
  { to: "/roadmap", label: "Roadmap", icon: MapIcon },
  { to: "/build-queue", label: "Build Queue", icon: ListChecks },
  { to: "/build-cycles", label: "Build Cycles", icon: CalendarRange },
  { to: "/preview", label: "Preview", icon: Eye },
  { to: "/done", label: "Done", icon: CheckCircle2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state, setMode, setProject } = useDemoStore();
  const [newOpen, setNewOpen] = useState(false);
  const navigate = useNavigate();
  const projectName = projects.find((p) => p.id === state.currentProjectId)?.name ?? "LaunchOS";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <Link to="/" className="flex items-center gap-2 px-5 h-14 border-b border-border">
          <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-primary to-indigo-500 glow-primary">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">SpecPilot</span>
        </Link>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map((item) => {
            const active =
              path === item.to ||
              (item.to === "/backlog" && path.startsWith("/specs/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
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
            <span className="font-medium text-foreground">{projectName} Team</span>
            <span className="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              Demo
            </span>
          </div>
          <div>Mode: {state.mode === "team" ? "Team Mode" : "Solo Mode"}</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-3 border-b border-border px-4 lg:px-6 bg-background/80 backdrop-blur sticky top-0 z-30">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-primary to-indigo-500">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">SpecPilot</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Select value={state.currentProjectId} onValueChange={(v) => { setProject(v); toast.success(`Switched to ${projects.find(p=>p.id===v)?.name} mock project.`); }}>
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
                    if (match) navigate({ to: "/specs/$id", params: { id: match.id } });
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
                state.mode === "team" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Team
            </button>
            <button
              onClick={() => setMode("solo")}
              className={cn(
                "px-2.5 py-1 rounded",
                state.mode === "solo" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Solo
            </button>
          </div>

          <Button size="sm" onClick={() => setNewOpen(true)} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Request</span>
          </Button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex overflow-x-auto gap-1 border-b border-border px-2 py-2 bg-background/80">
          {nav.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs",
                  active ? "bg-accent text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0">{children}</main>

        <footer className="border-t border-border px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> Frontend demo · mock data only
          </span>
          <span>SpecPilot</span>
        </footer>
      </div>

      <NewRequestModal open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-border px-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
