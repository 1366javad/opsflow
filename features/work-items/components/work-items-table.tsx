import Link from "next/link";

import { formatDueDate } from "../date";
import type { WorkItemListRow } from "../types";
import { DeleteWorkItem } from "./delete-work-item";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";

export function WorkItemsTable({ items, isAdmin }: { items: WorkItemListRow[]; isAdmin: boolean }) {
  return (
    <div tabIndex={0} aria-label="Work items table; scroll horizontally for all columns" className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
      <table className="w-full min-w-[780px] border-collapse text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-5 py-3">Title</th>
            <th scope="col" className="px-5 py-3">Assignee</th>
            <th scope="col" className="px-5 py-3">Priority</th>
            <th scope="col" className="px-5 py-3">Status</th>
            <th scope="col" className="px-5 py-3">Due Date</th>
            <th scope="col" className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <th scope="row" className="max-w-[250px] px-5 py-4 font-medium text-slate-900">{item.title}</th>
              <td className="px-5 py-4 text-slate-700">{item.assignee.name}</td>
              <td className="px-5 py-4"><PriorityBadge priority={item.priority} /></td>
              <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
              <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-700">{formatDueDate(item.dueDate)}</td>
              <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-3"><Link href={`/work-items/${item.id}`} className="font-medium text-slate-900 hover:underline">View</Link>{isAdmin && <><Link href={`/work-items/${item.id}/edit`} className="font-medium text-slate-700 hover:underline">Edit</Link><DeleteWorkItem itemId={item.id} title={item.title} /></>}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
