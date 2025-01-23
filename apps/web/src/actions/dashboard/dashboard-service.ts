import {
  type AnalyticsEndpoints,
  type DashboardStats,
  type FavoritedComponent,
} from "@shared/types";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";

/**
 * Service class for dashboard-related API calls
 */
export class DashboardService {
  private static readonly BASE_PATH = "/analytics";

  /**
   * Fetches dashboard stat cards values
   */
  static async getStatCardsValues(): Promise<DashboardStats> {
    try {
      const response = await ApiClient.get<
        AnalyticsEndpoints["getDashboardStatCardsValues"]["response"]
      >(`${this.BASE_PATH}/dashboard-stat-cards-values`);

      if (!response.success) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches dashboard favorited content
   */
  static async getFavoritedContent(): Promise<FavoritedComponent[]> {
    try {
      const response = await ApiClient.get<
        AnalyticsEndpoints["getFavoritedTableContent"]["response"]
      >(`${this.BASE_PATH}/favorited-table-content`);

      if (!response.success) {
        throw new Error("Failed to fetch favorited content");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch favorited content:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
