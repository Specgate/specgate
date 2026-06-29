import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { useDemoStore } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { users } from "@/lib/mock-data";
import { UserAvatar } from "@/components/app/Pills";
import { GitBranch, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SpecPilot" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { reset } = useDemoStore();
  const [resetOpen, setResetOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  async function testSync() {
    toast.loading("Testing Git sync...", { id: "git" });
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.dismiss("git");
    toast.success("Git sync test successful.");
  }

  return (
    <AppShell>
      <PageHeader title="Settings" description="Project, Git, workflow, and team settings." />
      <div className="p-6 space-y-6 max-w-3xl">
        <Card title="Project settings">
          <Row label="Project name"><Input defaultValue="LaunchOS" /></Row>
          <Row label="Workspace"><Input defaultValue="SpecPilot Team" /></Row>
          <Row label="Mode"><Input defaultValue="Team Mode" /></Row>
          <Row label="Default milestone"><Input defaultValue="MVP" /></Row>
        </Card>

        <Card title="Git sync" icon={<GitBranch className="h-4 w-4 text-primary" />}>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm font-mono space-y-1">
            <div>github.com/acme/launchos</div>
            <div className="text-muted-foreground">Default branch: main</div>
            <div className="text-muted-foreground">Requirements: /docs/requirements</div>
            <div className="text-muted-foreground">Assets: /docs/assets/requirements</div>
            <div className="text-muted-foreground">Agent context: /docs/agent-context</div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" onClick={testSync}>Test Git Sync</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Change repo flow is disabled in this demo.")}>Change Repo</Button>
            <Button size="sm" variant="outline" onClick={() => toast.error("Disconnect is disabled in this demo.")}>Disconnect</Button>
          </div>
        </Card>

        <Card title="Workflow settings">
          {[
            ["Require approval before handoff", true],
            ["Require out-of-scope section", true],
            ["Require preview before done", true],
            ["Allow solo self-review", true],
          ].map(([label, v]) => (
            <div key={label as string} className="flex items-center justify-between py-2">
              <span className="text-sm">{label}</span>
              <Switch defaultChecked={v as boolean} />
            </div>
          ))}
        </Card>

        <Card title="Team members" actions={<Button size="sm" onClick={() => setInviteOpen(true)}>Invite member</Button>}>
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={u.name} size={28} />
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.role}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{u.type}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Demo data">
          <p className="text-sm text-muted-foreground">Reset and reseed the API-backed demo workspace.</p>
          <Button variant="outline" className="gap-1.5 mt-3" onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset API data
          </Button>
        </Card>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset API data?</DialogTitle>
            <DialogDescription>All specs, comments, and statuses will be reseeded through the SpecGate API.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                void reset()
                  .then(() => {
                    setResetOpen(false);
                    toast.success("Demo data reset.");
                  })
                  .catch((error) =>
                    toast.error(error instanceof Error ? error.message : "Could not reset demo data."),
                  );
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite member</DialogTitle></DialogHeader>
          <Label>Email</Label>
          <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!inviteEmail) return; toast.success(`Invite sent to ${inviteEmail}.`); setInviteEmail(""); setInviteOpen(false); }}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Card({ title, children, icon, actions }: { title: string; children: React.ReactNode; icon?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">{icon}{title}</h2>
        {actions}
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 items-center">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
