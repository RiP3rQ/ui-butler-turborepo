import { DashboardGrid } from "@/components/dasboard/grid/dashboard-grid";
import { getUserProjects } from "@/actions/projects/get-user-projects";

export async function DashboardGridWrapper(): Promise<JSX.Element> {
  const data = await getUserProjects();
  return <DashboardGrid data={data} />;
}
