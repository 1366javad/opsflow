import type { WorkItemStatus } from "@/types/domain";
import { statusLabels } from "../types";

const statusStyles: Record<WorkItemStatus, string> = {
  TODO: "border-slate-200 bg-slate-100 text-slate-700",
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  DONE: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
