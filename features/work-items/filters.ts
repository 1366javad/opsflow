import { WorkItemPriority, WorkItemStatus } from "@/generated/prisma/client";
import type { WorkItemFilters } from "./types";

export type WorkItemSearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseWorkItemFilters(params: WorkItemSearchParams): WorkItemFilters {
  const query = firstString(params.query)?.trim().slice(0, 120) ?? "";
  const statusValue = firstString(params.status);
  const priorityValue = firstString(params.priority);
  const assigneeId = firstString(params.assigneeId)?.trim();

  return {
    query,
    status: Object.values(WorkItemStatus).find((value) => value === statusValue),
    priority: Object.values(WorkItemPriority).find((value) => value === priorityValue),
    assigneeId: assigneeId || undefined,
  };
}
