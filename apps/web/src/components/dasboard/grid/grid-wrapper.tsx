import { getDashboardGridValues } from "@/actions/dashboard/get-dashboard-grid-values";
import { DashboardGrid } from "@/components/dasboard/grid/dashboard-grid";

export async function DashboardGridWrapper(): Promise<JSX.Element> {
  const data = await getDashboardGridValues();
  return <DashboardGrid data={data} />;
}
