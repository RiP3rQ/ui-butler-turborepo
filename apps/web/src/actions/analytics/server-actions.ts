"use server";

import type {
  Period,
  StatCardsValuesResponse,
  UsedCreditsInPeriodResponse,
} from "@repo/types";
import { AnalyticsService } from "./analytics-service";

export async function getPeriods(): Promise<Period[]> {
  return await AnalyticsService.getPeriods();
}

export async function getStatCardsValues(
  selectedPeriod: Period,
): Promise<StatCardsValuesResponse> {
  return AnalyticsService.getStatCardsValues(selectedPeriod);
}

export async function getUsedCreditsInPeriod(
  selectedPeriod: Period,
): Promise<UsedCreditsInPeriodResponse[]> {
  return AnalyticsService.getUsedCreditsInPeriod(selectedPeriod);
}

export async function getWorkflowExecutionStats(
  selectedPeriod: Period,
): Promise<UsedCreditsInPeriodResponse[]> {
  return AnalyticsService.getWorkflowExecutionStats(selectedPeriod);
}
