import type {
  DashboardStatCardsValuesResponse,
  DashboardTableFavoritedContentResponse,
} from "@repo/types";
import { ApiClient } from "@/lib/api-client";

/**
 * Service class for dashboard-related API calls
 */
export class DashboardService {
  private static readonly BASE_PATH = "/analytics";

  /**
   * Fetches dashboard stat cards values
   */
  static async getStatCardsValues(): Promise<DashboardStatCardsValuesResponse> {
    try {
      const { data } = await ApiClient.get<DashboardStatCardsValuesResponse>(
        `${this.BASE_PATH}/dashboard-stat-cards-values`,
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  }

  /**
   * Fetches dashboard favorited content
   */
  static async getFavoritedContent(): Promise<
    DashboardTableFavoritedContentResponse[]
  > {
    try {
      const { data } = await ApiClient.get<
        DashboardTableFavoritedContentResponse[]
      >(`${this.BASE_PATH}/favorited-table-content`);
      return data;
    } catch (error) {
      console.error("Failed to fetch favorited content:", error);
      throw new Error("Failed to fetch favorited content");
    }
  }
}
