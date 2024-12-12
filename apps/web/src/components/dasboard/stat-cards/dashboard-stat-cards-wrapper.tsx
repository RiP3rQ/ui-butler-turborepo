import { getDashboardStatCardsValues } from "@/actions/dashboard/get-dashboard-stat-cards-values";
import DashboardStatCards from "@/components/dasboard/stat-cards/dashboard-stat-cards";

async function DashboardStatsCardsWrapper(): Promise<JSX.Element> {
  const data = await getDashboardStatCardsValues();
  return <DashboardStatCards initialData={data} />;
}

export default DashboardStatsCardsWrapper;
