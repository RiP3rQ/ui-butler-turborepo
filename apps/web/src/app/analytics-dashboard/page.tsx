import type { Period } from "@shared/types";
import { type JSX } from "react";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { AnalyticsPageContent } from "@/components/analytics/analytics-page-content";
import {
  getPeriods,
  getStatCardsValues,
  getUsedCreditsInPeriod,
  getWorkflowExecutionStats,
} from "@/actions/analytics/server-actions";
import { PageHeader } from "@/components/page-header";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}): Promise<JSX.Element> {
  const { month, year } = await searchParams;
  const currentDate = new Date();
  const period: Period = {
    month: month ? Number.parseInt(month) : currentDate.getMonth() + 1,
    year: year ? Number.parseInt(year) : currentDate.getFullYear(),
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
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader
        title="Analytics Dashboard"
        action={<PeriodSelector periods={periods} selectedPeriod={period} />}
      />
      <AnalyticsPageContent
        period={period}
        statCardsValues={statCardsValues}
        workflowExecutionStatsAction={workflowExecutionStatsAction}
        usedCreditsInPeriodAction={usedCreditsInPeriodAction}
      />
    </div>
  );
}
