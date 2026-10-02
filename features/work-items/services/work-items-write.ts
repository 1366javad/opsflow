import "server-only";

import { Prisma, WorkItemStatus } from "@/generated/prisma/client";
import { requireAdmin, requireStatusUpdateAccess } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db/prisma";
import type { AuthenticatedUser } from "@/types/domain";
import { WorkItemError } from "../errors";
import type { CreateWorkItemInput, EditWorkItemInput } from "../schemas/work-item";

async function requireValidAssignee(assigneeId: string): Promise<void> {
  const user = await getPrisma().user.findUnique({ where: { id: assigneeId }, select: { id: true } });
  if (!user) throw new WorkItemError("Choose a valid assignee.", 400);
}

export async function requireExistingWorkItem(id: string) {
  const item = await getPrisma().workItem.findUnique({ where: { id } });
  if (!item) throw new WorkItemError("Work item not found.", 404);
  return item;
}

export async function createWorkItem(user: AuthenticatedUser, input: CreateWorkItemInput) {
  requireAdmin(user);
  await requireValidAssignee(input.assigneeId);
  return getPrisma().workItem.create({
    data: {
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId,
      priority: input.priority,
      dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
      status: WorkItemStatus.TODO,
      createdById: user.id,
    },
  });
}

export async function editWorkItem(user: AuthenticatedUser, id: string, input: EditWorkItemInput) {
  requireAdmin(user);
  await requireExistingWorkItem(id);
  await requireValidAssignee(input.assigneeId);
  return getPrisma().workItem.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId,
      priority: input.priority,
      dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
      status: input.status,
    },
  });
}

export async function updateWorkItemStatus(user: AuthenticatedUser, id: string, status: WorkItemStatus) {
  const item = await requireExistingWorkItem(id);
  requireStatusUpdateAccess(user, item);
  try {
    return await getPrisma().workItem.update({
      where: user.role === "ADMIN" ? { id } : { id, assigneeId: user.id },
      data: { status },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new WorkItemError("Work item is no longer available to you.", 404);
    }
    throw error;
  }
}

export async function deleteWorkItem(user: AuthenticatedUser, id: string): Promise<void> {
  requireAdmin(user);
  await requireExistingWorkItem(id);
  await getPrisma().workItem.delete({ where: { id } });
}
