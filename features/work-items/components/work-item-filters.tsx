import Link from "next/link";

import type { AuthenticatedUser } from "@/types/domain";
import { priorityLabels, statusLabels, type WorkItemFilters } from "../types";

type WorkItemFiltersProps = {
  filters: WorkItemFilters;
  user: AuthenticatedUser;
  assignees: Array<{ id: string; name: string }>;
};

const controlClassName = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200";

export function WorkItemFilterForm({ filters, user, assignees }: WorkItemFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.query || filters.status || filters.priority || (user.role === "ADMIN" && filters.assigneeId),
  );

  return (
    <form action="/work-items" method="get" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="work-item-query" className="mb-1.5 block text-xs font-medium text-slate-700">Search title</label>
          <input id="work-item-query" name="query" type="search" maxLength={120} defaultValue={filters.query} placeholder="Search work items" className={controlClassName} />
        </div>
        <div>
          <label htmlFor="work-item-status" className="mb-1.5 block text-xs font-medium text-slate-700">Status</label>
          <select id="work-item-status" name="status" defaultValue={filters.status ?? ""} className={controlClassName}>
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="work-item-priority" className="mb-1.5 block text-xs font-medium text-slate-700">Priority</label>
          <select id="work-item-priority" name="priority" defaultValue={filters.priority ?? ""} className={controlClassName}>
            <option value="">All priorities</option>
            {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {user.role === "ADMIN" && (
          <div>
            <label htmlFor="work-item-assignee" className="mb-1.5 block text-xs font-medium text-slate-700">Assignee</label>
            <select id="work-item-assignee" name="assigneeId" defaultValue={filters.assigneeId ?? ""} className={controlClassName}>
              <option value="">All assignees</option>
              {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-end gap-4">
        {hasActiveFilters && <Link href="/work-items" className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline">Clear filters</Link>}
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
          Apply filters
        </button>
      </div>
    </form>
  );
}
