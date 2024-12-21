"use client";
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from "lucide-react";
import type { StatCardsValuesResponse } from "@repo/types";
import { type JSX } from "react";
import SingleStatCard from "@/components/analytics/stat-cards/single-stat-card";

interface StatCardsProps {
  data: StatCardsValuesResponse;
}

export function StatCards({ data }: Readonly<StatCardsProps>): JSX.Element {
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
