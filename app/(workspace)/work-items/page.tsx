import Link from "next/link";

import { EmptyState } from "@/components/ui/data-state";
import { PageHeading } from "@/components/ui/page-heading";
import { WorkItemFilterForm } from "@/features/work-items/components/work-item-filters";
import { WorkItemFeedback } from "@/features/work-items/components/work-item-feedback";
import { WorkItemsTable } from "@/features/work-items/components/work-items-table";
import { parseWorkItemFilters, type WorkItemSearchParams } from "@/features/work-items/filters";
import {
  getAssigneeFilters,
  getVisibleWorkItemCount,
  getWorkItems,
} from "@/features/work-items/services/work-items-read";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";

export default async function WorkItemsPage({
  searchParams,
}: {
  searchParams: Promise<WorkItemSearchParams & { message?: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const params = await searchParams;
  const filters = parseWorkItemFilters(params);
  const [items, totalCount, assignees] = await Promise.all([
    getWorkItems(user, filters),
    getVisibleWorkItemCount(user),
    getAssigneeFilters(user),
  ]);

  return (
    <div>
      <PageHeading
        title="Work Items"
        description={user.role === "ADMIN" ? "Track work across the team." : "Work items assigned to you."}
      />
      <WorkItemFeedback message={params.message} />
      {user.role === "ADMIN" && <Link href="/work-items/new" className="mb-5 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">New Work Item</Link>}
      <WorkItemFilterForm filters={filters} user={user} assignees={assignees} />
      <div className="mt-5">
        {totalCount === 0 ? (
          <EmptyState
            title={user.role === "ADMIN" ? "No work items yet" : "No assigned work items"}
            description={user.role === "ADMIN" ? "Work items will appear here when they are created." : "Work assigned to you will appear here."}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No matching work items"
            description="Try a different search or adjust the filters."
            action={<Link href="/work-items" className="text-sm font-medium text-slate-900 underline underline-offset-2">Clear filters</Link>}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Showing {items.length} of {totalCount} work items</p>
            <WorkItemsTable items={items} isAdmin={user.role === "ADMIN"} />
          </div>
        )}
      </div>
    </div>
  );
}
