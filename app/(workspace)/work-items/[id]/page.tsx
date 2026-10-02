import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { PageHeading } from "@/components/ui/page-heading";
import { DeleteWorkItem } from "@/features/work-items/components/delete-work-item";
import { PriorityBadge } from "@/features/work-items/components/priority-badge";
import { StatusBadge } from "@/features/work-items/components/status-badge";
import { StatusControl } from "@/features/work-items/components/status-control";
import { WorkItemFeedback } from "@/features/work-items/components/work-item-feedback";
import { formatDueDate } from "@/features/work-items/date";
import { WorkItemError } from "@/features/work-items/errors";
import { getWorkItemDetail } from "@/features/work-items/services/work-item-detail";
import { AuthorizationError, requireAuthenticatedUser } from "@/lib/auth/authorization";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

export default async function WorkItemDetailPage({ params, searchParams }: Props) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  let item;
  try {
    item = await getWorkItemDetail(user, id);
  } catch (error) {
    if (error instanceof WorkItemError && error.status === 404) notFound();
    if (error instanceof AuthorizationError && error.status === 403) forbidden();
    throw error;
  }
  const { message } = await searchParams;

  return (
    <div>
      <Link href="/work-items" className="mb-5 inline-block text-sm font-medium text-slate-600 hover:text-slate-900">← Work Items</Link>
      <PageHeading title={item.title} description="Work item details and progress." />
      <WorkItemFeedback message={message} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-label="Work item details">
          <h2 className="text-base font-semibold text-slate-900">Description</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.description || "No description provided."}</p>
          <dl className="mt-8 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-2"><StatusBadge status={item.status} /></dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</dt><dd className="mt-2"><PriorityBadge priority={item.priority} /></dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Assignee</dt><dd className="mt-1 text-sm text-slate-900">{item.assignee.name}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created by</dt><dd className="mt-1 text-sm text-slate-900">{item.createdBy.name}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Due date</dt><dd className="mt-1 text-sm text-slate-900">{formatDueDate(item.dueDate)}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt><dd className="mt-1 text-sm text-slate-900">{formatTimestamp(item.createdAt)}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated</dt><dd className="mt-1 text-sm text-slate-900">{formatTimestamp(item.updatedAt)}</dd></div>
          </dl>
        </section>
        <div className="space-y-5">
          <StatusControl itemId={item.id} status={item.status} />
          {user.role === "ADMIN" && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Manage work item</h2>
              <div className="mt-4 flex flex-wrap items-center gap-5">
                <Link href={`/work-items/${item.id}/edit`} className="text-sm font-medium text-slate-900 underline-offset-2 hover:underline">Edit work item</Link>
                <DeleteWorkItem itemId={item.id} title={item.title} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
