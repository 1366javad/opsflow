import "server-only";

import { Prisma, UserRole, WorkItemStatus } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import type { AuthenticatedUser } from "@/types/domain";
import type {
  DashboardSummary,
  DashboardWorkItem,
  WorkItemFilters,
  WorkItemListRow,
} from "../types";

const workItemListSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  dueDate: true,
  assignee: { select: { name: true } },
} satisfies Prisma.WorkItemSelect;

function visibleWorkItems(user: AuthenticatedUser): Prisma.WorkItemWhereInput {
  return user.role === UserRole.ADMIN ? {} : { assigneeId: user.id };
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function overdueWhere(user: AuthenticatedUser): Prisma.WorkItemWhereInput {
  return {
    AND: [
      visibleWorkItems(user),
      { dueDate: { lt: startOfTodayUtc() }, status: { not: WorkItemStatus.DONE } },
    ],
  };
}

export async function getDashboardSummary(user: AuthenticatedUser): Promise<DashboardSummary> {
  const prisma = getPrisma();
  const [statusCounts, overdue] = await Promise.all([
    prisma.workItem.groupBy({
      by: ["status"],
      where: visibleWorkItems(user),
      _count: { _all: true },
    }),
    prisma.workItem.count({ where: overdueWhere(user) }),
  ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map(({ status, _count }) => [status, _count._all]),
  );
  const todo = countByStatus[WorkItemStatus.TODO] ?? 0;
  const inProgress = countByStatus[WorkItemStatus.IN_PROGRESS] ?? 0;
  const done = countByStatus[WorkItemStatus.DONE] ?? 0;

  return { total: todo + inProgress + done, todo, inProgress, done, overdue };
}

export async function getRecentWorkItems(user: AuthenticatedUser): Promise<DashboardWorkItem[]> {
  return getPrisma().workItem.findMany({
    where: visibleWorkItems(user),
    select: workItemListSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 5,
  });
}

export async function getOverdueWorkItems(user: AuthenticatedUser): Promise<DashboardWorkItem[]> {
  return getPrisma().workItem.findMany({
    where: overdueWhere(user),
    select: workItemListSelect,
    orderBy: [{ dueDate: "asc" }, { id: "asc" }],
    take: 5,
  });
}

export async function getWorkItems(
  user: AuthenticatedUser,
  filters: WorkItemFilters,
): Promise<WorkItemListRow[]> {
  const filterConditions: Prisma.WorkItemWhereInput = {
    ...(filters.query && { title: { contains: filters.query } }),
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(user.role === UserRole.ADMIN && filters.assigneeId && {
      assigneeId: filters.assigneeId,
    }),
  };

  return getPrisma().workItem.findMany({
    where: { AND: [visibleWorkItems(user), filterConditions] },
    select: workItemListSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getVisibleWorkItemCount(user: AuthenticatedUser): Promise<number> {
  return getPrisma().workItem.count({ where: visibleWorkItems(user) });
}

export async function getAssigneeFilters(user: AuthenticatedUser): Promise<Array<{ id: string; name: string }>> {
  if (user.role !== UserRole.ADMIN) return [];
  return getPrisma().user.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}
