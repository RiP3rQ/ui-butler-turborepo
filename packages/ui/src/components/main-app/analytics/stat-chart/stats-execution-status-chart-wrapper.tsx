import type {
  Period,
  UsedCreditsInPeriodResponse,
} from "@repo/types/analytics";
import StatsChartWrapper from "@repo/ui/components/main-app/analytics/stat-chart/stats-chart-wrapper.tsx";

interface StatsExecutionStatusChartWrapperProps {
  selectedPeriod: Period;
  getWorkflowExecutionStatsAction: (
    selectedPeriod: Period,
  ) => Promise<UsedCreditsInPeriodResponse[]>;
}
async function StatsExecutionStatusChartWrapper({
  selectedPeriod,
  getWorkflowExecutionStatsAction,
}: Readonly<StatsExecutionStatusChartWrapperProps>): Promise<JSX.Element> {
  const data = await getWorkflowExecutionStatsAction(selectedPeriod);
  return <StatsChartWrapper data={data} />;
}
export default StatsExecutionStatusChartWrapper;
