import type { WorkItemPriority, WorkItemStatus } from "@/types/domain";

export type WorkItemFilters = {
  query: string;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assigneeId?: string;
};

export type WorkItemListRow = {
  id: string;
  title: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  dueDate: Date;
  assignee: { name: string };
};

export type DashboardWorkItem = Pick<
  WorkItemListRow,
  "id" | "title" | "status" | "dueDate" | "assignee"
>;

export type DashboardSummary = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
};

export const statusLabels: Record<WorkItemStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Completed",
};

export const priorityLabels: Record<WorkItemPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
