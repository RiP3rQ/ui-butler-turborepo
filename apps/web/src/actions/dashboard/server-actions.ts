"use server";

import type {
  DashboardStatCardsValuesResponse,
  DashboardTableFavoritedContentResponse,
} from "@repo/types";
import { DashboardService } from "@/actions/dashboard/dashboard-service";

/**
 * Fetches dashboard statistics
 */
export async function getDashboardStatCardsValues(): Promise<DashboardStatCardsValuesResponse> {
  return DashboardService.getStatCardsValues();
}

/**
 * Fetches dashboard favorited content
 */
export async function getDashboardTableFavoritedContent(): Promise<
  DashboardTableFavoritedContentResponse[]
> {
  return DashboardService.getFavoritedContent();
}
