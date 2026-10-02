import { PageHeading } from "@/components/ui/page-heading";
import { DashboardStatCard } from "@/features/work-items/components/dashboard-stat-card";
import { DashboardWorkItems } from "@/features/work-items/components/dashboard-work-items";
import {
  getDashboardSummary,
  getOverdueWorkItems,
  getRecentWorkItems,
} from "@/features/work-items/services/work-items-read";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const [summary, recentItems, overdueItems] = await Promise.all([
    getDashboardSummary(user),
    getRecentWorkItems(user),
    getOverdueWorkItems(user),
  ]);

  return (
    <div>
      <PageHeading
        title="Dashboard"
        description={user.role === "ADMIN" ? "A team-wide view of work in progress." : "An overview of work assigned to you."}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <DashboardStatCard label="Total Work Items" value={summary.total} />
        <DashboardStatCard label="To Do" value={summary.todo} />
        <DashboardStatCard label="In Progress" value={summary.inProgress} tone="blue" />
        <DashboardStatCard label="Completed" value={summary.done} tone="green" />
        <DashboardStatCard label="Overdue" value={summary.overdue} tone="rose" />
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <DashboardWorkItems title="Recent Work Items" items={recentItems} emptyMessage="No work items yet." />
        <DashboardWorkItems title="Overdue Work Items" items={overdueItems} emptyMessage="Nothing is overdue." />
      </div>
    </div>
  );
}
