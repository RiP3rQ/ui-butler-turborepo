import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { StatsCardSkeleton } from "@/components/analytics/stat-cards/stat-cards";
import DashboardStatsCardsWrapper from "@/components/dasboard/stat-cards/dashboard-stat-cards-wrapper";
import { DashboardGridWrapper } from "@/components/dasboard/grid/grid-wrapper";

export default async function DashboardPage(): Promise<JSX.Element> {
  return (
    <div className="flex flex-1 flex-col h-full gap-2 mx-auto max-w-6xl mt-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
      </div>
      <div className="h-full py-6 flex flex-col space-y-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          {/* @ts-expect-error Server Component */}
          <DashboardStatsCardsWrapper />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          {/* @ts-expect-error Server Component */}
          <DashboardGridWrapper />
        </Suspense>
      </div>
    </div>
  );
}
