import type { Period } from "@repo/types";
import { getPeriods } from "@/actions/analytics/get-periods";
import { getStatCardsValues } from "@/actions/analytics/get-stat-cards-values";
import { getWorkflowExecutionStats } from "@/actions/analytics/get-workflow-execution-stats";
import { getUsedCreditsInPeriod } from "@/actions/analytics/get-used-credits-in-period";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { AnalyticsPageContent } from "@/components/analytics/analytics-page-content";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}): Promise<JSX.Element> {
  const { month, year } = await searchParams;
  const currentDate = new Date();
  const period: Period = {
    month: month ? parseInt(month) : currentDate.getMonth() + 1,
    year: year ? parseInt(year) : currentDate.getFullYear(),
  };

  const [
    periods,
    statCardsValues,
    workflowExecutionStatsAction,
    usedCreditsInPeriodAction,
  ] = await Promise.all([
    getPeriods(),
    getStatCardsValues(period),
    getWorkflowExecutionStats(period),
    getUsedCreditsInPeriod(period),
  ]);

  return (
    <div className="flex flex-1 flex-col h-full gap-2 mx-auto max-w-6xl mt-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <PeriodSelector periods={periods} selectedPeriod={period} />
      </div>
      <AnalyticsPageContent
        period={period}
        statCardsValues={statCardsValues}
        workflowExecutionStatsAction={workflowExecutionStatsAction}
        usedCreditsInPeriodAction={usedCreditsInPeriodAction}
      />
    </div>
  );
}
