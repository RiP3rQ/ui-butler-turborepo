"use client";
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from "lucide-react";
import type { StatCardsValuesResponse } from "@repo/types/analytics";
import { Skeleton } from "@repo/ui/components/ui/skeleton.tsx";
import SingleStatCard from "@repo/ui/components/main-app/analytics/stat-cards/single-stat-card.tsx";

interface StatCardsProps {
  data: StatCardsValuesResponse;
}

function StatCards({ data }: Readonly<StatCardsProps>): JSX.Element {
  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]">
      <SingleStatCard
        icon={CirclePlayIcon}
        title="Workflow executions"
        value={data.workflowExecutions}
      />
      <SingleStatCard
        icon={WaypointsIcon}
        title="Phase executions"
        value={data.phasesExecuted}
      />
      <SingleStatCard
        icon={CoinsIcon}
        title="Workflow executions"
        value={data.creditsConsumed}
      />
    </div>
  );
}
export default StatCards;

export function StatsCardSkeleton(): JSX.Element {
  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]">
      {[1, 2, 3].map((_, index) => (
        <Skeleton className="w-full min-h-[120px]" key={index} />
      ))}
    </div>
  );
}
