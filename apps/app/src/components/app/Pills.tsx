import { cn } from "@corely/ui/utils";
import type { SpecStatus, Priority } from "@/types/specgate";
import { useSpecGateStore } from "@/lib/specgate-store";

const teamLabels: Record<SpecStatus, string> = {
  request: "Request",
  draft: "Draft",
  review: "Review",
  approved: "Approved",
  build_queue: "Build Queue",
  in_development: "In Development",
  developer_review: "Developer Review",
  preview: "Preview",
  stakeholder_review: "Stakeholder Review",
  accepted: "Accepted",
  done: "Done",
};

const soloLabels: Record<SpecStatus, string> = {
  request: "Idea",
  draft: "Draft Spec",
  review: "Self Check",
  approved: "Ready to Build",
  build_queue: "Build Queue",
  in_development: "Building",
  developer_review: "Self Review",
  preview: "Preview",
  stakeholder_review: "Final Check",
  accepted: "Ready to Ship",
  done: "Shipped",
};

const colors: Record<SpecStatus, string> = {
  request: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  draft: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  build_queue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  in_development: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  developer_review: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  preview: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  stakeholder_review: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  accepted: "bg-green-500/15 text-green-300 border-green-500/30",
  done: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
};

export function StatusPill({ status, className }: { status: SpecStatus; className?: string }) {
  const { state } = useSpecGateStore();
  const label = state.mode === "solo" ? soloLabels[status] : teamLabels[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        colors[status],
        className,
      )}
    >
      {label}
    </span>
  );
}

const pColors: Record<Priority, string> = {
  low: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  medium: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  high: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  urgent: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function PriorityPill({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        pColors[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}

export function UserAvatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-[11px] font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
