"use client";

import {
  type Period,
  type StatCardsValuesResponse,
  type UsedCreditsInPeriodResponse,
} from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";
import { StatCards } from "@/components/analytics/stat-cards/stat-cards";
import { StatsChartWrapper } from "@/components/analytics/stat-chart/stats-chart-wrapper";
import { CreditsUserChartWrapper } from "@/components/analytics/stat-chart/credits-user-chart-wrapper";
import { getStatCardsValues } from "@/actions/analytics/get-stat-cards-values";
import { getWorkflowExecutionStats } from "@/actions/analytics/get-workflow-execution-stats";
import { getUsedCreditsInPeriod } from "@/actions/analytics/get-used-credits-in-period";

interface AnalyticsPageContentProps {
  period: Period;
  statCardsValues: StatCardsValuesResponse;
  workflowExecutionStatsAction: UsedCreditsInPeriodResponse[];
  usedCreditsInPeriodAction: UsedCreditsInPeriodResponse[];
}

export function AnalyticsPageContent({
  period,
  statCardsValues,
  workflowExecutionStatsAction,
  usedCreditsInPeriodAction,
}: Readonly<AnalyticsPageContentProps>): JSX.Element {
  const { data: statCardsValuesData } = useQuery({
    queryKey: ["stat-cards-values", period],
    queryFn: async () => await getStatCardsValues(period),
    initialData: statCardsValues,
    refetchInterval: 60000, // 1 minute
  });

  const { data: workflowExecutionStatsData } = useQuery({
    queryKey: ["workflow-execution-stats", period],
    queryFn: async () => await getWorkflowExecutionStats(period),
    initialData: workflowExecutionStatsAction,
    refetchInterval: 60000, // 1 minute
  });

  const { data: usedCreditsInPeriodData } = useQuery({
    queryKey: ["used-credits-in-period", period],
    queryFn: async () => await getUsedCreditsInPeriod(period),
    initialData: usedCreditsInPeriodAction,
    refetchInterval: 60000, // 1 minute
  });

  return (
    <div className="h-full py-6 flex flex-col space-y-4">
      <StatCards data={statCardsValuesData} />
      <StatsChartWrapper data={workflowExecutionStatsData} />
      <CreditsUserChartWrapper
        data={usedCreditsInPeriodData}
        description="Daily number of credits used in the selected period"
        title="Credits used in period"
      />
    </div>
  );
}
