import { getDashboardTableFavoritedContent } from "@/actions/dashboard/get-dashboard-table-favorited-content";
import { DashboardFavoritedTable } from "@/components/dasboard/table/dashboard-favorited-table";

export async function DashboardFavoritedTableWrapper(): Promise<JSX.Element> {
  const data = await getDashboardTableFavoritedContent();
  return <DashboardFavoritedTable initialData={data} />;
}
