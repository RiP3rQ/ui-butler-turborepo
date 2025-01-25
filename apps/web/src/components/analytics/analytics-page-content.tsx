"use client";

import {
  getStatCardsValues,
  getUsedCreditsInPeriod,
  getWorkflowExecutionStats,
} from "@/actions/analytics/server-actions";
import { StatCards } from "@/components/analytics/stat-cards/stat-cards";
import { CreditsUserChartWrapper } from "@/components/analytics/stat-chart/credits-user-chart-wrapper";
import { StatsChartWrapper } from "@/components/analytics/stat-chart/stats-chart-wrapper";
import { type AnalyticsEndpoints, type Period } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";

interface AnalyticsPageContentProps {
  period: Period;
  statCardsValues: AnalyticsEndpoints["getStatCardsValues"]["response"];
  workflowExecutionStatsAction: AnalyticsEndpoints["getWorkflowExecutionStats"]["response"];
  usedCreditsInPeriodAction: AnalyticsEndpoints["getUsedCreditsInPeriod"]["response"];
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
