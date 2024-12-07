import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import type { Period } from "@repo/types";
import { getPeriods } from "@/actions/analytics/get-periods";
import { getStatCardsValues } from "@/actions/analytics/get-stat-cards-values";
import { getWorkflowExecutionStats } from "@/actions/analytics/get-workflow-execution-stats";
import { getUsedCreditsInPeriod } from "@/actions/analytics/get-used-credits-in-period";
import { PeriodSelectorWrapper } from "@/components/analytics/period-selector-wrapper";
import { StatsCardSkeleton } from "@/components/analytics/stat-cards/stat-cards";
import StatsCardsWrapper from "@/components/analytics/stat-cards/stats-cards-wrapper";
import StatsExecutionStatusChartWrapper from "@/components/analytics/stat-chart/stats-execution-status-chart-wrapper";
import StatsCreditsUsedChartWrapper from "@/components/analytics/stat-chart/stats-credits-used-chart-wrapper";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const currentDate = new Date();
  const { month, year } = await searchParams;
  const period: Period = {
    month: month ? parseInt(month) : currentDate.getMonth() + 1,
    year: year ? parseInt(year) : currentDate.getFullYear(),
  };

  return (
    <div className="flex flex-1 flex-col h-full gap-2 mx-auto max-w-6xl mt-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Suspense fallback={<Skeleton className="w-[180px] h-[40px]" />}>
          {/* @ts-expect-error Server Component */}
          <PeriodSelectorWrapper
            getPeriodsAction={getPeriods}
            selectedPeriod={period}
          />
        </Suspense>
      </div>
      <div className="h-full py-6 flex flex-col space-y-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          {/* @ts-expect-error Server Component */}
          <StatsCardsWrapper
            getStatsCardsValuesAction={getStatCardsValues}
            selectedPeriod={period}
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          {/* @ts-expect-error Server Component */}
          <StatsExecutionStatusChartWrapper
            getWorkflowExecutionStatsAction={getWorkflowExecutionStats}
            selectedPeriod={period}
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          {/* @ts-expect-error Server Component */}
          <StatsCreditsUsedChartWrapper
            getUsedCreditsInPeriodAction={getUsedCreditsInPeriod}
            selectedPeriod={period}
          />
        </Suspense>
      </div>
    </div>
  );
}
