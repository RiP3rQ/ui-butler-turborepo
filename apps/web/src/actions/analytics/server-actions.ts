"use server";

import type {
  Period,
  StatCardsValuesResponse,
  UsedCreditsInPeriod,
} from "@shared/types";
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
): Promise<UsedCreditsInPeriod[]> {
  return AnalyticsService.getUsedCreditsInPeriod(selectedPeriod);
}

export async function getWorkflowExecutionStats(
  selectedPeriod: Period,
): Promise<UsedCreditsInPeriod[]> {
  return AnalyticsService.getWorkflowExecutionStats(selectedPeriod);
}
