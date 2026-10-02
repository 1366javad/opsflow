import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, UserRole, WorkItemPriority, WorkItemStatus } from "../generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" }) });

const demoWorkItems = [
  { title: "Prepare onboarding checklist", status: WorkItemStatus.TODO, priority: WorkItemPriority.HIGH, assignee: "member", dueInDays: 4 },
  { title: "Review support queue", status: WorkItemStatus.IN_PROGRESS, priority: WorkItemPriority.MEDIUM, assignee: "member", dueInDays: 2 },
  { title: "Archive completed requests", status: WorkItemStatus.DONE, priority: WorkItemPriority.LOW, assignee: "member", dueInDays: -3 },
  { title: "Update operations handbook", status: WorkItemStatus.TODO, priority: WorkItemPriority.MEDIUM, assignee: "member", dueInDays: -2 },
  { title: "Confirm vendor schedule", status: WorkItemStatus.IN_PROGRESS, priority: WorkItemPriority.HIGH, assignee: "member", dueInDays: -1 },
  { title: "Document weekly handoff", status: WorkItemStatus.DONE, priority: WorkItemPriority.MEDIUM, assignee: "member", dueInDays: 1 },
  { title: "Audit open requests", status: WorkItemStatus.TODO, priority: WorkItemPriority.HIGH, assignee: "admin", dueInDays: 7 },
  { title: "Publish team priorities", status: WorkItemStatus.IN_PROGRESS, priority: WorkItemPriority.MEDIUM, assignee: "admin", dueInDays: 3 },
  { title: "Resolve access review", status: WorkItemStatus.DONE, priority: WorkItemPriority.HIGH, assignee: "admin", dueInDays: -5 },
  { title: "Plan next sprint capacity", status: WorkItemStatus.TODO, priority: WorkItemPriority.LOW, assignee: "admin", dueInDays: 10 },
  { title: "Check overdue escalations", status: WorkItemStatus.IN_PROGRESS, priority: WorkItemPriority.HIGH, assignee: "member", dueInDays: -4 },
  { title: "Complete process retrospective", status: WorkItemStatus.DONE, priority: WorkItemPriority.LOW, assignee: "member", dueInDays: -7 },
] as const;

function dueDateFromToday(offsetDays: number): Date {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offsetDays));
}

async function main(): Promise<void> {
  const passwordHash = await hash("demo123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@opsflow.dev" },
    update: { name: "Alex Morgan", role: UserRole.ADMIN, passwordHash },
    create: { name: "Alex Morgan", email: "admin@opsflow.dev", role: UserRole.ADMIN, passwordHash },
  });
  const member = await prisma.user.upsert({
    where: { email: "member@opsflow.dev" },
    update: { name: "Sam Taylor", role: UserRole.MEMBER, passwordHash },
    create: { name: "Sam Taylor", email: "member@opsflow.dev", role: UserRole.MEMBER, passwordHash },
  });

  await prisma.$transaction(
    demoWorkItems.map((item, index) => {
      const id = `demo-work-item-${String(index + 1).padStart(2, "0")}`;
      return prisma.workItem.upsert({
        where: { id },
        update: {},
        create: {
          id,
          title: item.title,
          description: `Coordinate and complete: ${item.title.toLowerCase()}.`,
          status: item.status,
          priority: item.priority,
          assigneeId: item.assignee === "member" ? member.id : admin.id,
          createdById: admin.id,
          dueDate: dueDateFromToday(item.dueInDays),
        },
      });
    }),
  );
}

main()
  .then(() => console.info("Demo users and work items are ready."))
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
