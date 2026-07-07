"use client";

import { useState, useEffect } from "react";
import { useSpecGateStore } from "@/lib/specgate-store";
import { EngineeringContextDto, AgentExportDto, AgentTargetDto, AgentReadinessCheckDto } from "@corely/contracts/specgate";
import { getProjectAgentReadiness, getAgentTargets } from "@/lib/specgate-api";
import { Loader2, Copy, Download, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function EngineeringContextPage() {
  const { state } = useSpecGateStore();
  const projectId = state.currentProjectId;
  
  const [context, setContext] = useState<EngineeringContextDto | null>(null);
  const [exports, setExports] = useState<AgentExportDto[]>([]);
  const [targets, setTargets] = useState<AgentTargetDto[]>([]);
  const [readiness, setReadiness] = useState<AgentReadinessCheckDto | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/specgate/projects/${projectId}/engineering-context`)
      .then((res) => res.json())
      .then((data) => {
        if (data.context) setContext(data.context);
        if (data.agentExports) setExports(data.agentExports);
      });

    getAgentTargets().then(res => setTargets(res.data)).catch(() => {});
    getProjectAgentReadiness(projectId).then(res => setReadiness(res.data)).catch(() => {});
  }, [projectId]);

  async function generateExports() {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/specgate/projects/${projectId}/engineering-context/agent-exports`, {
        method: 'POST'
      });
      const data = await res.json();
      setExports(data.exports);
      toast.success("Agent exports generated.");
    } catch (e) {
      toast.error("Failed to generate exports.");
    } finally {
      setLoading(false);
    }
  }

  const tabs = ["overview", "architecture", "agent_exports", "readiness"];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Engineering Context</h1>
          <p className="text-sm text-gray-500 mt-1">
            Engineering Context tells humans and coding agents how this project should be built.
          </p>
        </div>
        <div className="flex gap-2">
          {context?.status !== 'APPROVED' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
              Approve Context
            </button>
          )}
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm flex gap-2 items-center"
            onClick={generateExports}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate Agent Exports
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-white p-4 shadow rounded-lg border">
              <h3 className="font-medium text-gray-900">Status</h3>
              <p className="mt-1 text-gray-500">{context?.status || "DRAFT"}</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg border">
              <h3 className="font-medium text-gray-900">Project: {projectId}</h3>
            </div>
          </div>
        )}
        
        {activeTab === "architecture" && (
          <div className="space-y-4">
            <div className="bg-white p-4 shadow rounded-lg border">
              <h3 className="font-medium text-gray-900">Project Summary</h3>
              <textarea 
                className="w-full mt-2 border rounded-md p-2 h-32 text-sm font-mono bg-gray-50" 
                defaultValue={context?.projectSummaryMarkdown || ""}
                placeholder="SpecGate is a spec-first workflow..."
              />
            </div>
            <div className="bg-white p-4 shadow rounded-lg border">
              <h3 className="font-medium text-gray-900">Architecture</h3>
              <textarea 
                className="w-full mt-2 border rounded-md p-2 h-64 text-sm font-mono bg-gray-50" 
                defaultValue={context?.architectureMarkdown || ""}
                placeholder="Corely modular monolith..."
              />
            </div>
          </div>
        )}

        {activeTab === "agent_exports" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targets.map(target => {
                const targetExports = exports.filter(e => e.targetAgentId === target.id);
                return (
                  <div key={target.id} className="bg-white p-4 shadow rounded-lg border flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{target.label}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${targetExports.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {targetExports.length > 0 ? 'Ready' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">{target.description || `Export for ${target.label}`}</p>
                      <ul className="text-xs text-gray-600 mb-4 space-y-1">
                        {targetExports.map(exp => (
                          <li key={exp.id} className="flex justify-between border-b pb-1">
                            <span className="truncate mr-2" title={exp.filePath}>{exp.filePath}</span>
                            <span className="text-gray-400" title={exp.checksum}>{exp.checksum.substring(0, 6)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {targetExports.length > 0 && (
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-1.5 border rounded-md text-xs font-medium bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button className="flex-1 px-3 py-1.5 border rounded-md text-xs font-medium bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1">
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
            <div className="bg-white p-6 shadow rounded-lg border">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full ${readiness.status === 'green' ? 'bg-green-100 text-green-600' : readiness.status === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                  {readiness.status === 'green' ? <CheckCircle2 className="w-8 h-8" /> : readiness.status === 'yellow' ? <AlertTriangle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold uppercase">{readiness.status}</h2>
                  <p className="text-sm text-gray-500">Project Readiness Score: {readiness.score}%</p>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-4">Readiness Checks</h3>
              <div className="space-y-3">
                {readiness.checks.map(check => (
                  <div key={check.id} className="flex gap-4 p-4 border rounded-md">
                    <div className="mt-0.5">
                      {check.status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : check.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{check.label}</h4>
                      {check.message && <p className="text-sm text-gray-500 mt-1">{check.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
