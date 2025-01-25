"use server";

import { type AnalyticsEndpoints } from "@shared/types";
import { DashboardService } from "@/actions/dashboard/dashboard-service";

/**
 * Fetches dashboard statistics
 */
export async function getDashboardStatCardsValues(): Promise<
  AnalyticsEndpoints["getDashboardStatCardsValues"]["response"]
> {
  return DashboardService.getStatCardsValues();
}

/**
 * Fetches dashboard favorited content
 */
export async function getDashboardTableFavoritedContent(): Promise<
  AnalyticsEndpoints["getFavoritedTableContent"]["response"]
> {
  return DashboardService.getFavoritedContent();
}
