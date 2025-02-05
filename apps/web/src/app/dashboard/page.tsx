import {
  getDashboardStatCardsValues,
  getDashboardTableFavoritedContent,
} from "@/actions/dashboard/server-actions";
import { getUserProjects } from "@/actions/projects/server-actions";
import { DashboardGrid } from "@/components/dashboard/grid/dashboard-grid";
import DashboardStatCards from "@/components/dashboard/stat-cards/dashboard-stat-cards";
import { DashboardFavoritedTable } from "@/components/dashboard/table/dashboard-favorited-table";
import { type JSX } from "react";
import { PageHeader } from "@/components/page-header";

export default async function DashboardPage(): Promise<JSX.Element> {
  const [
    dashboardStatCardsValues,
    userProjects,
    dashboardTableFavoritedContent,
  ] = await Promise.all([
    getDashboardStatCardsValues(),
    getUserProjects(),
    getDashboardTableFavoritedContent(),
  ]);

  return (
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader title="Your Dashboard" />
      <DashboardStatCards initialData={dashboardStatCardsValues} />
      <DashboardGrid initialData={userProjects} />
      <DashboardFavoritedTable initialData={dashboardTableFavoritedContent} />
    </div>
  );
}
