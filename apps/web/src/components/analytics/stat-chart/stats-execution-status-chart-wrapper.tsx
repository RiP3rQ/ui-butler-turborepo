import type { Period, UsedCreditsInPeriodResponse } from "@repo/types";
import StatsChartWrapper from "@/components/analytics/stat-chart/stats-chart-wrapper";

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
