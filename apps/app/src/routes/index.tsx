import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  ArrowRight,
  Github,
  FileCheck2,
  Workflow,
  Sparkles,
  GitBranch,
  Bot,
  Bug,
  MessageSquare,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Users,
  Lightbulb,
  Inbox,
  ListChecks,
  CalendarRange,
  FileText,
  Rocket,
  Code2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpecPilot — Spec-first workspace for AI-powered teams" },
      {
        name: "description",
        content:
          "Agree what to build before your AI coding agent starts. SpecPilot turns messy requests into approved specs and gives coding agents the context they need.",
      },
      { property: "og:title", content: "SpecPilot — Spec-first workspace for AI-powered teams" },
      {
        property: "og:description",
        content:
          "Turn messy requests into approved specs, hand clean context to coding agents, and let stakeholders preview before release.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <WorkflowSection />
      <Features />
      <TeamSolo />
      <OpenSource />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-primary to-indigo-500 glow-primary">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">SpecPilot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#product" className="hover:text-foreground">Product</a>
          <a href="#workflow" className="hover:text-foreground">Workflow</a>
          <a href="#team-solo" className="hover:text-foreground">For Teams</a>
          <a href="#open-source" className="hover:text-foreground">Open Source</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info("GitHub repo coming soon.")}
            className="gap-1.5"
          >
            <Github className="h-4 w-4" /> GitHub
          </Button>
          <Button asChild size="sm" className="gap-1">
            <Link to="/home">Launch Demo <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" /> For small teams using Cursor, Claude Code, and AI coding agents
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Agree what to build <br />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              before your AI coding agent starts.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            SpecPilot turns messy requests into approved specs, plans them into a simple build queue,
            syncs clean Markdown to Git, and gives coding agents the context they need to implement safely.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-1.5 glow-primary">
              <Link to="/home">Launch interactive demo <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/specs/$id" params={{ id: "REQ-002" }}>See sample spec</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs">
            {[
              "Built for teams under 10",
              "Git-backed Markdown specs",
              "Cursor & Claude Code ready",
              "No Jira required",
              "Stakeholder preview built in",
              "Solo mode supported",
            ].map((b) => (
              <span key={b} className="rounded-full border border-border bg-card/40 px-2.5 py-1 text-muted-foreground">
                {b}
              </span>
            ))}
          </div>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-primary/30 to-cyan-400/10 rounded-3xl blur-3xl opacity-50" />
      <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs text-muted-foreground">specpilot.app / LaunchOS</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground">Current project</div>
            <div className="text-lg font-semibold">LaunchOS</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Total specs", v: "7", c: "text-foreground" },
              { l: "Approved", v: "3", c: "text-emerald-400" },
              { l: "In development", v: "2", c: "text-violet-400" },
              { l: "Ready to preview", v: "1", c: "text-cyan-400" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border bg-background/60 p-3">
                <div className="text-[11px] text-muted-foreground">{s.l}</div>
                <div className={`text-xl font-semibold ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-medium text-amber-200">1 mismatch detected</div>
              <div className="text-amber-200/70">REQ-002 Team Invite — expiry mismatch</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            {["Request", "Spec", "Agent", "Preview", "Done"].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${i < 3 ? "bg-primary" : "bg-border"}`} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const problems = [
  { icon: MessageSquare, title: "Messy requests live in chats", desc: "Important context gets buried in Slack, DMs, and meeting notes." },
  { icon: FileText, title: "Specs are unclear or outdated", desc: "What was agreed gets lost between docs, tickets, and replies." },
  { icon: Bot, title: "Coding agents guess what to build", desc: "Without scoped context, AI agents invent behavior that wasn't approved." },
  { icon: Code2, title: "Code review without the decision", desc: "Reviewers can't see why something was built the way it was." },
  { icon: Eye, title: "Stakeholders see the result too late", desc: "Preview happens at the end, when changes are expensive." },
  { icon: Workflow, title: "Too many tools for one workflow", desc: "Jira, Notion, Linear, Figma, GitHub, and three AI chats per feature." },
];

function Problem() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="max-w-3xl text-3xl sm:text-4xl font-semibold tracking-tight">
          AI coding made implementation faster. It also made unclear requirements more dangerous.
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 grid place-items-center mb-3">
                <p.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="font-medium">{p.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: Inbox, title: "Request", desc: "Stakeholders describe what they need in plain language." },
  { icon: Sparkles, title: "Clarify", desc: "AI asks missing questions before the spec is written." },
  { icon: CheckCircle2, title: "Approve Spec", desc: "Humans approve expected behavior before coding starts." },
  { icon: ListChecks, title: "Plan Build", desc: "Approved specs move into a simple build queue or cycle." },
  { icon: Bot, title: "Agent Handoff", desc: "Generate scoped context for Cursor or Claude Code." },
  { icon: ShieldCheck, title: "Developer Review", desc: "Check implementation, tests, and spec match." },
  { icon: Eye, title: "Preview", desc: "Stakeholders test through a live staging URL." },
  { icon: Rocket, title: "Release", desc: "Accepted work moves to done with a clear spec-to-release record." },
];

function WorkflowSection() {
  return (
    <section id="workflow" className="border-b border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">A simple workflow from request to release.</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          One flow. No coding agent starts before the spec is approved. No feature is done before the result is reviewed.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border border-border bg-card p-5">
              <div className="absolute top-4 right-4 text-xs text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</div>
              <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 grid place-items-center mb-3">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="font-medium">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Inbox, t: "Request Inbox", d: "One place to collect stakeholder requests." },
  { icon: Sparkles, t: "AI Clarification", d: "Generate the right questions before writing the spec." },
  { icon: CheckCircle2, t: "Spec Approval", d: "Approve expected behavior before code is written." },
  { icon: FileCheck2, t: "Simple Roadmap", d: "Now / Next / Later / Icebox planning without ceremony." },
  { icon: ListChecks, t: "Build Queue", d: "Approved work, ready for a coding agent or developer." },
  { icon: GitBranch, t: "Git Markdown Sync", d: "Approved specs live as Markdown in your repo." },
  { icon: Bot, t: "Coding-Agent Context", d: "Scoped context packets for Cursor, Claude Code, Codex." },
  { icon: Bug, t: "Spec-Code Drift Check", d: "Catch mismatches between approved spec and implementation." },
  { icon: Eye, t: "Stakeholder Preview", d: "Send a preview URL with a clear approve / reject flow." },
  { icon: Lightbulb, t: "Solo Mode", d: "Simpler flow for indie hackers and solo devs." },
  { icon: CalendarRange, t: "Build Cycles", d: "Lightweight weekly cycles, optional and skippable." },
  { icon: Rocket, t: "Release Notes", d: "Auto-summarize what shipped, from the spec itself." },
];

function Features() {
  return (
    <section id="product" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Everything a small AI-powered team needs to stay aligned.</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
              <f.icon className="h-5 w-5 text-primary mb-3" />
              <div className="font-medium">{f.t}</div>
              <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSolo() {
  return (
    <section id="team-solo" className="border-b border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Designed for small teams first. Still useful when you build alone.</h2>
        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-7">
            <div className="flex items-center gap-2 text-xs text-primary">
              <Users className="h-4 w-4" /> Primary focus · teams under 10
            </div>
            <h3 className="text-2xl font-semibold mt-3">Team Mode</h3>
            <p className="text-sm text-muted-foreground mt-2">
              For founder-led teams, agencies, and small product squads.
            </p>
            <div className="mt-5 text-sm text-muted-foreground font-mono leading-7">
              Request → Clarify → Approve → Build Queue → Agent Handoff → Developer Review → Stakeholder Preview
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lightbulb className="h-4 w-4" /> Secondary mode · solo builders
            </div>
            <h3 className="text-2xl font-semibold mt-3">Solo Mode</h3>
            <p className="text-sm text-muted-foreground mt-2">
              For indie hackers and solo devs using Cursor or Claude Code.
            </p>
            <div className="mt-5 text-sm text-muted-foreground font-mono leading-7">
              Idea → AI Clarify → Spec → Agent Prompt → Self Review → Ship
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  const cards = ["Markdown format", "CLI-ready", "MCP-ready", "GitHub sync", "Self-host later", "Open-source friendly"];
  return (
    <section id="open-source" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Git-backed. Markdown-first. Agent-ready.</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Specs are Markdown. Approved requirements live in Git. Agent context is inspectable. Teams can self-host
          later or use the hosted cloud version.
        </p>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((c) => (
            <div key={c} className="rounded-lg border border-border bg-card p-4 text-sm text-center">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Free / Open Source", desc: "For solo builders and local workflows.", cta: "Get started" },
    { name: "Team Cloud", desc: "Hosted collaboration, AI credits, GitHub sync, preview approvals.", cta: "Start trial", highlight: true },
    { name: "Agency", desc: "Client approval workflows and multiple projects.", cta: "Talk to sales" },
  ];
  return (
    <section id="pricing" className="border-b border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Simple pricing for small teams.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-6 ${t.highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="text-sm font-medium">{t.name}</div>
              <p className="text-sm text-muted-foreground mt-2 min-h-[3rem]">{t.desc}</p>
              <Button
                variant={t.highlight ? "default" : "outline"}
                className="mt-5 w-full"
                onClick={() => toast.info("Pricing is not active in this demo.")}
              >
                {t.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  ["Is this a Jira replacement?", "For small teams, often yes. SpecPilot is built around the spec, not the ticket. Larger orgs can keep Jira and use SpecPilot as the spec layer."],
  ["Do stakeholders need Git?", "No. Stakeholders use a simple request, comment, approval, and preview flow. Git is used behind the scenes for approved specs."],
  ["Does it work with Cursor?", "Yes. Use the Copy for Cursor action on any approved spec to paste a clean context packet."],
  ["Does it work with Claude Code?", "Yes. Generate a .context.md file and point Claude Code at it."],
  ["Are draft specs committed to Git?", "No. Only approved specs are synced. Drafts and discussions stay in SpecPilot."],
  ["Is it useful for solo devs?", "Yes. Solo Mode collapses the team flow into Idea → Spec → Agent Prompt → Self Review → Ship."],
  ["Does it deploy code automatically?", "No. SpecPilot connects to your existing deploy and preview URLs."],
  ["Can we use it without another planning tool?", "Most small teams do. Roadmap, build queue, and cycles are built in."],
  ["What happens when a stakeholder rejects preview?", "The spec moves back to Developer Review with the rejection reason attached, so nothing falls through the cracks."],
];

function FAQ() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map(([q, a]) => (
            <AccordionItem key={q} value={q} className="border-border">
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center relative">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <h2 className="relative text-3xl sm:text-5xl font-semibold tracking-tight">Ready to try a spec-first workflow?</h2>
        <p className="relative mt-4 text-muted-foreground max-w-xl mx-auto">
          Explore the demo with realistic specs, build queue, agent handoff, and stakeholder preview flow.
        </p>
        <div className="relative mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="gap-1.5 glow-primary">
            <Link to="/home">Launch interactive demo <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/specs/$id" params={{ id: "REQ-002" }}>See sample spec</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = {
    Product: ["Features", "Workflow", "Pricing", "Changelog"],
    Workflow: ["Request inbox", "Spec approval", "Build queue", "Stakeholder preview"],
    Developers: ["Markdown specs", "Agent context", "GitHub sync", "CLI"],
    Company: ["About", "Open source", "Blog", "Contact"],
  };
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-primary to-indigo-500">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">SpecPilot</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Spec-first workflow for teams building with AI coding agents.
          </p>
        </div>
        {Object.entries(cols).map(([k, items]) => (
          <div key={k}>
            <div className="text-sm font-medium">{k}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {items.map((i) => (
                <li key={i} className="hover:text-foreground cursor-pointer">{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-6 py-5 text-xs text-muted-foreground text-center">
        © 2026 SpecPilot · Frontend demo · Mock data only
      </div>
    </footer>
  );
}
