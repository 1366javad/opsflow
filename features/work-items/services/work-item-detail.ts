import "server-only";

import { requireWorkItemAccess } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db/prisma";
import type { AuthenticatedUser } from "@/types/domain";
import { WorkItemError } from "../errors";

export async function getWorkItemDetail(user: AuthenticatedUser, id: string) {
  const item = await getPrisma().workItem.findUnique({
    where: { id },
    include: {
      assignee: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!item) throw new WorkItemError("Work item not found.", 404);
  requireWorkItemAccess(user, item);
  return item;
}
