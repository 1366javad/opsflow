import { z } from "zod";

import { WorkItemPriority, WorkItemStatus } from "@/generated/prisma/client";

const dueDateSchema = z.iso.date().refine(
  (value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()),
  "Enter a valid due date.",
);

const workItemFields = {
  title: z.string().trim().min(3, "Title must have at least 3 characters.").max(120),
  description: z.string().trim().max(2000),
  assigneeId: z.string().min(1, "Choose an assignee.").max(128),
  priority: z.enum(WorkItemPriority),
  dueDate: dueDateSchema,
};

export const createWorkItemSchema = z.strictObject(workItemFields);
export const editWorkItemSchema = z.strictObject({
  ...workItemFields,
  status: z.enum(WorkItemStatus),
});

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type EditWorkItemInput = z.infer<typeof editWorkItemSchema>;
