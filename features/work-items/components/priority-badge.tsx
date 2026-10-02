import type { WorkItemPriority } from "@/types/domain";
import { priorityLabels } from "../types";

const priorityStyles: Record<WorkItemPriority, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-600",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
};

export function PriorityBadge({ priority }: { priority: WorkItemPriority }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[priority]}`}>
      {priorityLabels[priority]}
    </span>
  );
}
