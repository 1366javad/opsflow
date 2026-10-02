import "server-only";

import { UserRole } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db/prisma";
import type { AuthenticatedUser, WorkItem } from "@/types/domain";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthorizationError("Authentication is required.", 401);
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) throw new AuthorizationError("Authentication is required.", 401);
  return user;
}

export function requireAdmin(user: AuthenticatedUser): void {
  if (user.role !== UserRole.ADMIN) {
    throw new AuthorizationError("Administrator access is required.", 403);
  }
}

export function requireWorkItemAccess(
  user: AuthenticatedUser,
  workItem: Pick<WorkItem, "assigneeId">,
): void {
  if (user.role !== UserRole.ADMIN && workItem.assigneeId !== user.id) {
    throw new AuthorizationError("You cannot access this work item.", 403);
  }
}

export function requireStatusUpdateAccess(
  user: AuthenticatedUser,
  workItem: Pick<WorkItem, "assigneeId">,
): void {
  requireWorkItemAccess(user, workItem);
}
