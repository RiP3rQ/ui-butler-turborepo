import type { Period, StatCardsValuesResponse } from "@repo/types";
import StatCards from "@/components/analytics/stat-cards/stat-cards";

interface StatsCardsProps {
  selectedPeriod: Period;
  getStatsCardsValuesAction: (
    selectedPeriod: Period,
  ) => Promise<StatCardsValuesResponse>;
}
async function StatsCardsWrapper({
  selectedPeriod,
  getStatsCardsValuesAction,
}: Readonly<StatsCardsProps>): Promise<JSX.Element> {
  const data = await getStatsCardsValuesAction(selectedPeriod);
  return <StatCards data={data} />;
}
export default StatsCardsWrapper;
