"use client";

import { useState, useEffect } from "react";
import { useSpecGateStore } from "@/lib/specgate-store";
import { EngineeringContextDto, AgentExportDto, AgentTargetDto, AgentReadinessCheckDto, ProjectContextRuleDto, ProjectAdrDto, ValidationCommandDto } from "@corely/contracts/specgate";
import { getProjectAgentReadiness, getAgentTargets } from "@/lib/specgate-api";
import { Loader2, Copy, Download, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Save, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, Button, Input, Label } from "@corely/ui";
import { toast } from "sonner";

export default function EngineeringContextPage() {
  const { state } = useSpecGateStore();
  const projectId = state.currentProjectId;
  
  const [context, setContext] = useState<EngineeringContextDto | null>(null);
  const [exports, setExports] = useState<AgentExportDto[]>([]);
  const [targets, setTargets] = useState<AgentTargetDto[]>([]);
  const [readiness, setReadiness] = useState<AgentReadinessCheckDto | null>(null);
  const [rules, setRules] = useState<ProjectContextRuleDto[]>([]);
  const [adrs, setAdrs] = useState<ProjectAdrDto[]>([]);
  const [validationCommands, setValidationCommands] = useState<ValidationCommandDto[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<EngineeringContextDto>>({});
  const [saving, setSaving] = useState(false);

  const [newAdrOpen, setNewAdrOpen] = useState(false);
  const [newAdrTitle, setNewAdrTitle] = useState("");
  const [newAdrContext, setNewAdrContext] = useState("");
  const [newAdrDecision, setNewAdrDecision] = useState("");

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/specgate/projects/${projectId}/engineering-context`)
      .then((res) => res.json())
      .then((data) => {
        if (data.context) {
          setContext(data.context);
          setFormData(data.context);
        }
        if (data.agentExports) setExports(data.agentExports);
        if (data.rules) setRules(data.rules);
        if (data.adrs) setAdrs(data.adrs);
        if (data.validationCommands) setValidationCommands(data.validationCommands);
      });

    getAgentTargets().then(res => setTargets(res.data)).catch(() => {});
    getProjectAgentReadiness(projectId).then(res => setReadiness(res.data)).catch(() => {});
  }, [projectId]);

  async function saveChanges() {
    if (!projectId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/specgate/projects/${projectId}/engineering-context`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectSummaryMarkdown: formData.projectSummaryMarkdown,
          architectureMarkdown: formData.architectureMarkdown,
          codingConventionsMarkdown: formData.codingConventionsMarkdown,
          testingStrategyMarkdown: formData.testingStrategyMarkdown,
          securityRulesMarkdown: formData.securityRulesMarkdown,
          validationNotesMarkdown: formData.validationNotesMarkdown,
        })
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Context saved successfully.");
      const updated = await res.json();
      if (updated) setContext(updated);
    } catch (e) {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function createAdr() {
    if (!projectId || !newAdrTitle || !newAdrContext || !newAdrDecision) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/specgate/projects/${projectId}/engineering-context/adrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAdrTitle,
          contextMarkdown: newAdrContext,
          decisionMarkdown: newAdrDecision,
        })
      });
      if (!res.ok) throw new Error("Failed to create ADR");
      const adr = await res.json();
      setAdrs(prev => [...prev, adr]);
      toast.success("ADR created successfully.");
      setNewAdrOpen(false);
      setNewAdrTitle("");
      setNewAdrContext("");
      setNewAdrDecision("");
    } catch (e) {
      toast.error("Failed to create ADR.");
    } finally {
      setSaving(false);
    }
  }

  async function generateExports() {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/specgate/projects/${projectId}/engineering-context/agent-exports`, {
        method: 'POST'
      });
      const data = await res.json();
      setExports(data.data || []);
      toast.success("Agent exports generated.");
    } catch (e) {
      toast.error("Failed to generate exports.");
    } finally {
      setLoading(false);
    }
  }

  const tabs = ["overview", "architecture", "conventions", "validation", "adrs", "rules", "agent_exports", "readiness"];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Engineering Context</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Engineering Context tells humans and coding agents how this project should be built.
          </p>
        </div>
        <div className="flex gap-2">
          {context?.status !== 'APPROVED' && (
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity">
              Approve Context
            </button>
          )}
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity flex gap-2 items-center"
            onClick={saveChanges}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
          <button 
            className="px-4 py-2 border border-border bg-card rounded-md text-sm flex gap-2 items-center hover:bg-muted transition-colors"
            onClick={generateExports}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate Agent Exports
          </button>
        </div>
      </div>

      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Status</h3>
              <p className="mt-1 text-muted-foreground">{context?.status || "DRAFT"}</p>
            </div>
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Project: {projectId}</h3>
            </div>
          </div>
        )}
        
        {activeTab === "architecture" && (
          <div className="space-y-4">
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Project Summary</h3>
              <textarea 
                className="w-full mt-2 border border-border rounded-md p-2 h-32 text-sm font-mono bg-background text-foreground" 
                value={formData.projectSummaryMarkdown || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, projectSummaryMarkdown: e.target.value }))}
                placeholder="SpecGate is a spec-first workflow..."
              />
            </div>
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Architecture</h3>
              <textarea 
                className="w-full mt-2 border border-border rounded-md p-2 h-64 text-sm font-mono bg-background text-foreground" 
                value={formData.architectureMarkdown || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, architectureMarkdown: e.target.value }))}
                placeholder="Corely modular monolith..."
              />
            </div>
          </div>
        )}

        {activeTab === "conventions" && (
          <div className="space-y-4">
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Coding Conventions</h3>
              <textarea 
                className="w-full mt-2 border border-border rounded-md p-2 h-40 text-sm font-mono bg-background text-foreground" 
                value={formData.codingConventionsMarkdown || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, codingConventionsMarkdown: e.target.value }))}
                placeholder="TypeScript strict mode, absolute imports..."
              />
            </div>
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Testing Strategy</h3>
              <textarea 
                className="w-full mt-2 border border-border rounded-md p-2 h-40 text-sm font-mono bg-background text-foreground" 
                value={formData.testingStrategyMarkdown || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, testingStrategyMarkdown: e.target.value }))}
                placeholder="Vitest for unit tests, Playwright for E2E..."
              />
            </div>
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Security Rules</h3>
              <textarea 
                className="w-full mt-2 border border-border rounded-md p-2 h-40 text-sm font-mono bg-background text-foreground" 
                value={formData.securityRulesMarkdown || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, securityRulesMarkdown: e.target.value }))}
                placeholder="No direct DOM manipulation, sanitize inputs..."
              />
            </div>
          </div>
        )}

        {activeTab === "validation" && (
          <div className="space-y-4">
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <h3 className="font-medium text-foreground">Validation Notes</h3>
              <textarea 
                className="w-full mt-2 border border-border rounded-md p-2 h-32 text-sm font-mono bg-background text-foreground" 
                value={formData.validationNotesMarkdown || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, validationNotesMarkdown: e.target.value }))}
                placeholder="Before submitting PR, ensure pnpm typecheck passes..."
              />
            </div>
            
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-foreground">Validation Commands</h3>
                <button className="px-3 py-1 bg-primary/10 text-primary rounded text-sm border border-primary/20 hover:bg-primary/20 transition-colors">
                  + Add Command
                </button>
              </div>
              
              {validationCommands.length === 0 ? (
                <p className="text-sm text-muted-foreground">No validation commands configured.</p>
              ) : (
                <div className="space-y-2">
                  {validationCommands.map(cmd => (
                    <div key={cmd.id} className="border border-border p-3 rounded-md bg-background flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">{cmd.label}</span>
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border">{cmd.commandType}</span>
                          {cmd.required && <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Required</span>}
                        </div>
                        <code className="text-xs bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded mt-2 block">{cmd.command}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "adrs" && (
          <div className="space-y-4">
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-foreground">Architecture Decision Records</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    ADRs document important architectural decisions along with their context, alternatives, and consequences. They help coding agents understand <i>why</i> the project is built a certain way.
                  </p>
                </div>
                <button 
                  onClick={() => setNewAdrOpen(true)}
                  className="px-3 py-1 bg-primary/10 text-primary rounded text-sm border border-primary/20 hover:bg-primary/20 transition-colors shrink-0"
                >
                  + Add ADR
                </button>
              </div>
              
              {adrs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ADRs configured.</p>
              ) : (
                <div className="space-y-2">
                  {adrs.map(adr => (
                    <div key={adr.id} className="border border-border p-3 rounded-md bg-background">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm text-foreground">ADR-{adr.number}: {adr.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${adr.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : adr.status === 'PROPOSED' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                          {adr.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{adr.contextMarkdown}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="bg-card p-4 shadow-sm rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-foreground">Scoped Context Rules</h3>
                <button className="px-3 py-1 bg-primary/10 text-primary rounded text-sm border border-primary/20 hover:bg-primary/20 transition-colors">
                  + Add Rule
                </button>
              </div>
              
              {rules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scoped rules configured.</p>
              ) : (
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div key={rule.id} className="border border-border p-3 rounded-md bg-background">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-foreground">{rule.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${rule.severity === 'BLOCKED' ? 'bg-destructive/10 text-destructive' : rule.severity === 'REQUIRED' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}>
                            {rule.severity}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded">{rule.category}</span>
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded">{rule.scopeType}</span>
                        </div>
                      </div>
                      {(rule.pathGlob || rule.moduleName) && (
                        <div className="text-xs text-muted-foreground mb-2 font-mono">
                          {rule.pathGlob && `Path: ${rule.pathGlob} `}
                          {rule.moduleName && `Module: ${rule.moduleName}`}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">{rule.contentMarkdown}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "agent_exports" && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-sm text-foreground flex gap-3">
              <div className="mt-0.5 shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">How to use downloaded exports</p>
                <p className="text-muted-foreground mb-2">
                  When you download an export, your browser may save it directly to your Downloads folder and strip out nested directories. 
                  You must manually move the file into your project and rename/place it exactly as shown in the file path for each platform:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-1">
                  <li><strong>OpenAI Codex / Generic:</strong> Place as <code className="bg-background px-1 rounded border border-border text-xs">AGENTS.md</code> in the root of your workspace.</li>
                  <li><strong>Claude Code:</strong> Place as <code className="bg-background px-1 rounded border border-border text-xs">CLAUDE.md</code> in the root of your workspace.</li>
                  <li><strong>Google Antigravity:</strong> Move to <code className="bg-background px-1 rounded border border-border text-xs">specgate-agent-export/antigravity-workflows.md</code>.</li>
                  <li><strong>Cursor:</strong> Place as <code className="bg-background px-1 rounded border border-border text-xs">.cursorrules</code> in the root of your workspace.</li>
                  <li><strong>Windsurf:</strong> Place as <code className="bg-background px-1 rounded border border-border text-xs">.windsurfrules</code> in the root of your workspace.</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targets.map(target => {
                const targetExports = exports.filter(e => e.targetAgentId === target.id);
                return (
                  <div key={target.id} className="bg-card p-4 shadow-sm rounded-lg border border-border flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-foreground">{target.label}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${targetExports.length > 0 ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                          {targetExports.length > 0 ? 'Ready' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{target.description || `Export for ${target.label}`}</p>
                      <ul className="text-xs text-muted-foreground mb-4 space-y-1">
                        {targetExports.map(exp => (
                          <li key={exp.id} className="flex justify-between border-b border-border pb-1">
                            <span className="truncate mr-2" title={exp.filePath}>{exp.filePath}</span>
                            <span className="text-muted-foreground/60" title={exp.checksum}>{exp.checksum.substring(0, 6)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {targetExports.length > 0 && (
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 px-3 py-1.5 border border-border rounded-md text-xs font-medium bg-background hover:bg-muted transition-colors flex items-center justify-center gap-1"
                          onClick={async () => {
                            try {
                              const content = targetExports.map(e => e.contentMarkdown).join('\n\n---\n\n');
                              const { copyTextToClipboard } = await import('@/lib/export-utils');
                              await copyTextToClipboard(content);
                              toast.success(`Copied content for ${target.label}`);
                            } catch (err) {
                              toast.error(`Failed to copy content for ${target.label}`);
                            }
                          }}
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button 
                          className="flex-1 px-3 py-1.5 border border-border rounded-md text-xs font-medium bg-background hover:bg-muted transition-colors flex items-center justify-center gap-1"
                          onClick={async () => {
                            try {
                              const { downloadTextFile } = await import('@/lib/export-utils');
                              targetExports.forEach(exp => {
                                downloadTextFile(exp.filePath, exp.contentMarkdown);
                              });
                              toast.success(`Downloaded files for ${target.label}`);
                            } catch (err) {
                              toast.error(`Failed to download files for ${target.label}`);
                            }
                          }}
                        >
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "readiness" && readiness && (
          <div className="space-y-4">
            <div className="bg-card p-6 shadow-sm rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full ${readiness.status === 'green' ? 'bg-green-500/10 text-green-500' : readiness.status === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'}`}>
                  {readiness.status === 'green' ? <CheckCircle2 className="w-8 h-8" /> : readiness.status === 'yellow' ? <AlertTriangle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold uppercase text-foreground">{readiness.status}</h2>
                  <p className="text-sm text-muted-foreground">Project Readiness Score: {readiness.score}%</p>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-4 text-foreground">Readiness Checks</h3>
              <div className="space-y-3">
                {readiness.checks.map(check => (
                  <div key={check.id} className="flex gap-4 p-4 border border-border rounded-md bg-background">
                    <div className="mt-0.5">
                      {check.status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : check.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{check.label}</h4>
                      {check.message && <p className="text-sm text-muted-foreground mt-1">{check.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={newAdrOpen} onOpenChange={setNewAdrOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Architecture Decision Record</DialogTitle>
            <DialogDescription>
              Record an important technical decision made for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newAdrTitle}
                onChange={(e) => setNewAdrTitle(e.target.value)}
                placeholder="e.g. Use Next.js App Router"
              />
            </div>
            <div className="space-y-2">
              <Label>Context</Label>
              <textarea
                className="w-full border border-border rounded-md p-2 h-24 text-sm font-mono bg-background text-foreground"
                value={newAdrContext}
                onChange={(e) => setNewAdrContext(e.target.value)}
                placeholder="What is the problem or situation?"
              />
            </div>
            <div className="space-y-2">
              <Label>Decision</Label>
              <textarea
                className="w-full border border-border rounded-md p-2 h-24 text-sm font-mono bg-background text-foreground"
                value={newAdrDecision}
                onChange={(e) => setNewAdrDecision(e.target.value)}
                placeholder="What is the decision made?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewAdrOpen(false)}>Cancel</Button>
            <Button onClick={createAdr} disabled={saving || !newAdrTitle || !newAdrContext || !newAdrDecision}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save ADR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
