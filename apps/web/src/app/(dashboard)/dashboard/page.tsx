import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { PeriodSelectorWrapper } from "@repo/ui/components/main-app/analytics/period-selector-wrapper";
import { StatsCardSkeleton } from "@repo/ui/components/main-app/analytics/stat-cards/stat-cards";
import StatsCardsWrapper from "@repo/ui/components/main-app/analytics/stat-cards/stats-cards-wrapper";
import StatsExecutionStatusChartWrapper from "@repo/ui/components/main-app/analytics/stat-chart/stats-execution-status-chart-wrapper";
import StatsCreditsUsedChartWrapper from "@repo/ui/components/main-app/analytics/stat-chart/stats-credits-used-chart-wrapper";
import type { Period } from "@repo/types/src/analytics.ts";
import { getPeriods } from "@/actions/analytics/get-periods.ts";
import { getStatCardsValues } from "@/actions/analytics/get-stat-cards-values.ts";
import { getWorkflowExecutionStats } from "@/actions/analytics/get-workflow-execution-stats.ts";
import { getUsedCreditsInPeriod } from "@/actions/analytics/get-used-credits-in-period.ts";

export default async function Home({
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
          <PeriodSelectorWrapper
            getPeriodsAction={getPeriods}
            selectedPeriod={period}
          />
        </Suspense>
      </div>
      <div className="h-full py-6 flex flex-col space-y-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCardsWrapper
            getStatsCardsValuesAction={getStatCardsValues}
            selectedPeriod={period}
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          <StatsExecutionStatusChartWrapper
            getWorkflowExecutionStatsAction={getWorkflowExecutionStats}
            selectedPeriod={period}
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          <StatsCreditsUsedChartWrapper
            getUsedCreditsInPeriodAction={getUsedCreditsInPeriod}
            selectedPeriod={period}
          />
        </Suspense>
      </div>
    </div>
  );
}
