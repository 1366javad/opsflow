import Link from "next/link";

import { formatDueDate } from "../date";
import type { DashboardWorkItem } from "../types";
import { StatusBadge } from "./status-badge";

export function DashboardWorkItems({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: DashboardWorkItem[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm" aria-label={title}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <Link href="/work-items" className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-slate-100 px-5">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-600">{item.assignee.name} · Due {formatDueDate(item.dueDate)}</p>
              </div>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
