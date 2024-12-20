import type { Period } from "@repo/types";
import { type JSX } from "react";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { AnalyticsPageContent } from "@/components/analytics/analytics-page-content";
import {
  getPeriods,
  getStatCardsValues,
  getUsedCreditsInPeriod,
  getWorkflowExecutionStats,
} from "@/actions/analytics/server-actions";

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

  console.log(periods);

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
