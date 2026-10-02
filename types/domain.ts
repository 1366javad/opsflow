import type {
  User as DatabaseUser,
  WorkItem as DatabaseWorkItem,
} from "@/generated/prisma/client";

export type User = Pick<
  DatabaseUser,
  "id" | "name" | "email" | "role" | "createdAt" | "updatedAt"
>;

export type AuthenticatedUser = Pick<User, "id" | "name" | "email" | "role">;

export type WorkItem = DatabaseWorkItem;

export type UserRole = User["role"];
export type WorkItemStatus = WorkItem["status"];
export type WorkItemPriority = WorkItem["priority"];
