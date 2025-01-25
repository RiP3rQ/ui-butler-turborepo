"use server";

import type { AnalyticsEndpoints, Period } from "@shared/types";
import { AnalyticsService } from "./analytics-service";

export async function getPeriods(): Promise<Period[]> {
  return await AnalyticsService.getPeriods();
}

export async function getStatCardsValues(
  selectedPeriod: Period,
): Promise<AnalyticsEndpoints["getStatCardsValues"]["response"]> {
  return AnalyticsService.getStatCardsValues(selectedPeriod);
}

export async function getUsedCreditsInPeriod(
  selectedPeriod: Period,
): Promise<AnalyticsEndpoints["getUsedCreditsInPeriod"]["response"]> {
  return AnalyticsService.getUsedCreditsInPeriod(selectedPeriod);
}

export async function getWorkflowExecutionStats(
  selectedPeriod: Period,
): Promise<AnalyticsEndpoints["getWorkflowExecutionStats"]["response"]> {
  return AnalyticsService.getWorkflowExecutionStats(selectedPeriod);
}
