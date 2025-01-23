import {
  getDashboardStatCardsValues,
  getDashboardTableFavoritedContent,
} from "@/actions/dashboard/server-actions";
import { getUserProjects } from "@/actions/projects/server-actions";
import { DashboardGrid } from "@/components/dashboard/grid/dashboard-grid";
import DashboardStatCards from "@/components/dashboard/stat-cards/dashboard-stat-cards";
import { DashboardFavoritedTable } from "@/components/dashboard/table/dashboard-favorited-table";
import { type JSX } from "react";

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
    <div className="flex flex-1 flex-col h-full gap-2 mx-auto max-w-6xl mt-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
      </div>
      <div className="h-full py-6 flex flex-col space-y-8">
        <DashboardStatCards initialData={dashboardStatCardsValues} />
        <DashboardGrid initialData={userProjects} />
        <DashboardFavoritedTable initialData={dashboardTableFavoritedContent} />
      </div>
    </div>
  );
}
