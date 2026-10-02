import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { PageHeading } from "@/components/ui/page-heading";
import { WorkItemForm } from "@/features/work-items/components/work-item-form";
import { WorkItemError } from "@/features/work-items/errors";
import { getWorkItemDetail } from "@/features/work-items/services/work-item-detail";
import { getAssigneeFilters } from "@/features/work-items/services/work-items-read";
import { AuthorizationError, requireAdmin, requireAuthenticatedUser } from "@/lib/auth/authorization";

export default async function EditWorkItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuthenticatedUser();
  try {
    requireAdmin(user);
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 403) forbidden();
    throw error;
  }
  const { id } = await params;
  let item;
  try {
    item = await getWorkItemDetail(user, id);
  } catch (error) {
    if (error instanceof WorkItemError && error.status === 404) notFound();
    throw error;
  }
  const assignees = await getAssigneeFilters(user);
  return (
    <div>
      <Link href={`/work-items/${id}`} className="mb-5 inline-block text-sm font-medium text-slate-600 hover:text-slate-900">← Work Item</Link>
      <PageHeading title="Edit Work Item" description="Update the work item and its assignment." />
      <WorkItemForm itemId={item.id} assignees={assignees} initialValues={{
        title: item.title,
        description: item.description,
        assigneeId: item.assigneeId,
        priority: item.priority,
        dueDate: item.dueDate.toISOString().slice(0, 10),
        status: item.status,
      }} />
    </div>
  );
}
