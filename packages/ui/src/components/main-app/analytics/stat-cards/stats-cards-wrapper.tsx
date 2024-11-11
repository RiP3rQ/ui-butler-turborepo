import type { Period, StatCardsValuesResponse } from "@repo/types/analytics";
import StatCards from "@repo/ui/components/main-app/analytics/stat-cards/stat-cards.tsx";

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
