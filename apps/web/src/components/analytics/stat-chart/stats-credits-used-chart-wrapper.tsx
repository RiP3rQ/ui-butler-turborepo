import type {
  Period,
  UsedCreditsInPeriodResponse,
} from "@repo/types/src/analytics";
import CreditsUserChartWrapper from "@/components/analytics/stat-chart/credits-user-chart-wrapper.tsx";

interface StatsCreditsUsedChartWrapperProps {
  selectedPeriod: Period;
  getUsedCreditsInPeriodAction: (
    selectedPeriod: Period,
  ) => Promise<UsedCreditsInPeriodResponse[]>;
}
async function StatsCreditsUsedChartWrapper({
  selectedPeriod,
  getUsedCreditsInPeriodAction,
}: Readonly<StatsCreditsUsedChartWrapperProps>): Promise<JSX.Element> {
  const data = await getUsedCreditsInPeriodAction(selectedPeriod);
  return (
    <CreditsUserChartWrapper
      data={data}
      description="Daily number of credits used in the selected period"
      title="Credits used in period"
    />
  );
}
export default StatsCreditsUsedChartWrapper;
