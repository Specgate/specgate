import { AgentTarget } from '../../domain/agent-target';

export const SPEC_GATE_AGENT_TARGETS: AgentTarget[] = [
  {
    id: "generic_markdown",
    label: "Generic Markdown",
    category: "generic",
    description: "Portable agent context for any coding assistant.",
    defaultEnabled: true,
  },
  {
    id: "agents_md",
    label: "AGENTS.md",
    category: "standard",
    description: "Shared open agent instruction format.",
    defaultEnabled: true,
  },
  {
    id: "codex",
    label: "OpenAI Codex",
    category: "agent",
    primaryFiles: ["AGENTS.md"],
    defaultEnabled: true,
  },
  {
    id: "claude_code",
    label: "Claude Code",
    category: "agent",
    primaryFiles: ["CLAUDE.md", ".claude/rules/*.md"],
    defaultEnabled: true,
  },
  {
    id: "github_copilot",
    label: "GitHub Copilot",
    category: "agent",
    primaryFiles: [
      ".github/copilot-instructions.md",
      ".github/instructions/*.instructions.md"
    ],
    defaultEnabled: true,
  },
  {
    id: "cursor",
    label: "Cursor",
    category: "agent",
    primaryFiles: [".cursor/rules/*.mdc", ".cursorrules"],
    defaultEnabled: true,
  },
  {
    id: "google_antigravity",
    label: "Google Antigravity",
    category: "agent",
    primaryFiles: [
      "antigravity-workspace-rules.md",
      "antigravity-workflows.md"
    ],
    defaultEnabled: true,
  },
  {
    id: "gemini_cli",
    label: "Gemini CLI",
    category: "agent",
    primaryFiles: ["GEMINI.md"],
    defaultEnabled: true,
  },
  {
    id: "devin",
    label: "Devin",
    category: "agent",
    primaryFiles: ["AGENTS.md", ".agents/skills/*/SKILL.md"],
    defaultEnabled: true,
  },
  {
    id: "windsurf",
    label: "Windsurf / Cascade",
    category: "agent",
    primaryFiles: [
      ".windsurf/rules/*.md",
      ".windsurf/workflows/*.md",
      ".windsurfrules",
      "AGENTS.md"
    ],
    defaultEnabled: true,
  },
  {
    id: "cline",
    label: "Cline",
    category: "agent",
    primaryFiles: [".clinerules/*.md", "AGENTS.md"],
    defaultEnabled: true,
  },
  {
    id: "roo_code",
    label: "Roo Code",
    category: "agent",
    primaryFiles: [".roo/rules/*.md", ".roorules"],
    defaultEnabled: true,
  },
  {
    id: "custom",
    label: "Custom Agent",
    category: "custom",
    primaryFiles: [],
    defaultEnabled: false,
  }
];

export class AgentTargetRegistry {
  getAll(): AgentTarget[] {
    return SPEC_GATE_AGENT_TARGETS;
  }

  getById(id: string): AgentTarget | undefined {
    return SPEC_GATE_AGENT_TARGETS.find(target => target.id === id);
  }
}
