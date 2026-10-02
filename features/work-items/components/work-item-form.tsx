"use client";

import Link from "next/link";
import type { FormEvent } from "react";

import type { WorkItemPriority, WorkItemStatus } from "@/types/domain";
import { priorityLabels, statusLabels } from "../types";
import { useWorkItemSubmit } from "./use-work-item-submit";

export type WorkItemFormValues = {
  title: string;
  description: string;
  assigneeId: string;
  priority: WorkItemPriority;
  dueDate: string;
  status: WorkItemStatus;
};

type Props = {
  assignees: Array<{ id: string; name: string }>;
  initialValues?: WorkItemFormValues;
  itemId?: string;
};

const fieldClass = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-700 focus:outline-2 focus:outline-offset-1 focus:outline-slate-800";
const labelClass = "block text-sm font-medium text-slate-800";

export function WorkItemForm({ assignees, initialValues, itemId }: Props) {
  const { submit, pending, error, fieldErrors } = useWorkItemSubmit(itemId);
  const values: WorkItemFormValues = initialValues ?? {
    title: "",
    description: "",
    assigneeId: "",
    priority: "MEDIUM",
    dueDate: "",
    status: "TODO",
  };

  function fieldError(name: keyof WorkItemFormValues) {
    const message = fieldErrors[name]?.[0];
    return message ? <p id={`item-${name}-error`} className="mt-1 text-sm text-red-700">{message}</p> : null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fields = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      assigneeId: String(formData.get("assigneeId") ?? ""),
      priority: String(formData.get("priority") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
    };
    void submit(itemId ? { ...fields, status: String(formData.get("status") ?? "") } : fields);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div>
        <label htmlFor="item-title" className={labelClass}>Title</label>
        <input id="item-title" name="title" type="text" required minLength={3} maxLength={120} defaultValue={values.title} aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "item-title-error" : undefined} className={fieldClass} />
        {fieldError("title")}
      </div>
      <div>
        <label htmlFor="item-description" className={labelClass}>Description</label>
        <textarea id="item-description" name="description" rows={5} maxLength={2000} defaultValue={values.description} aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? "item-description-error" : undefined} className={fieldClass} />
        {fieldError("description")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="item-assignee" className={labelClass}>Assignee</label>
          <select id="item-assignee" name="assigneeId" required defaultValue={values.assigneeId} aria-invalid={Boolean(fieldErrors.assigneeId)} aria-describedby={fieldErrors.assigneeId ? "item-assigneeId-error" : undefined} className={fieldClass}>
            <option value="" disabled>Choose an assignee</option>
            {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}
          </select>
          {fieldError("assigneeId")}
        </div>
        <div>
          <label htmlFor="item-priority" className={labelClass}>Priority</label>
          <select id="item-priority" name="priority" defaultValue={values.priority} aria-invalid={Boolean(fieldErrors.priority)} aria-describedby={fieldErrors.priority ? "item-priority-error" : undefined} className={fieldClass}>
            {Object.entries(priorityLabels).map(([priority, label]) => <option key={priority} value={priority}>{label}</option>)}
          </select>
          {fieldError("priority")}
        </div>
        <div>
          <label htmlFor="item-due-date" className={labelClass}>Due date</label>
          <input id="item-due-date" name="dueDate" type="date" required defaultValue={values.dueDate} aria-invalid={Boolean(fieldErrors.dueDate)} aria-describedby={fieldErrors.dueDate ? "item-dueDate-error" : undefined} className={fieldClass} />
          {fieldError("dueDate")}
        </div>
        {itemId && (
          <div>
            <label htmlFor="item-status" className={labelClass}>Status</label>
            <select id="item-status" name="status" defaultValue={values.status} aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? "item-status-error" : undefined} className={fieldClass}>
              {Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
            </select>
            {fieldError("status")}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60">{pending ? "Saving…" : itemId ? "Save changes" : "Create work item"}</button>
        <Link href={itemId ? `/work-items/${itemId}` : "/work-items"} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</Link>
      </div>
    </form>
  );
}
