import Link from "next/link";
import { forbidden } from "next/navigation";

import { PageHeading } from "@/components/ui/page-heading";
import { WorkItemForm } from "@/features/work-items/components/work-item-form";
import { getAssigneeFilters } from "@/features/work-items/services/work-items-read";
import { AuthorizationError, requireAdmin, requireAuthenticatedUser } from "@/lib/auth/authorization";

export default async function NewWorkItemPage() {
  const user = await requireAuthenticatedUser();
  try {
    requireAdmin(user);
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 403) forbidden();
    throw error;
  }
  const assignees = await getAssigneeFilters(user);
  return (
    <div>
      <Link href="/work-items" className="mb-5 inline-block text-sm font-medium text-slate-600 hover:text-slate-900">← Work Items</Link>
      <PageHeading title="New Work Item" description="Create and assign a work item." />
      <WorkItemForm assignees={assignees} />
    </div>
  );
}
