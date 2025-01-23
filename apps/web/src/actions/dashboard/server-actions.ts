"use server";

import {
  type DashboardStats,
  type FavoritedComponent,
} from "@repo/types/src/api-client/analytics-endpoints";
import { DashboardService } from "@/actions/dashboard/dashboard-service";

/**
 * Fetches dashboard statistics
 */
export async function getDashboardStatCardsValues(): Promise<DashboardStats> {
  return DashboardService.getStatCardsValues();
}

/**
 * Fetches dashboard favorited content
 */
export async function getDashboardTableFavoritedContent(): Promise<
  FavoritedComponent[]
> {
  return DashboardService.getFavoritedContent();
}
