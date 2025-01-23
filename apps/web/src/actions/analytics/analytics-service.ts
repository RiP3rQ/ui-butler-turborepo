import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  type AnalyticsEndpoints,
  type Period,
  type StatCardsValuesResponse,
  type UsedCreditsInPeriod,
} from "@shared/types";

/**
 * Service class for analytics-related API calls
 */
export class AnalyticsService {
  private static readonly BASE_PATH = "/analytics";

  /**
   * Fetches all available periods
   */
  static async getPeriods(): Promise<Period[]> {
    try {
      const response = await ApiClient.get<
        AnalyticsEndpoints["getPeriods"]["response"]
      >(`${this.BASE_PATH}/periods`);

      if (!response.success) {
        throw new Error("Failed to fetch periods");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch periods:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches stat cards values for a specific period
   */
  static async getStatCardsValues(
    period: Period,
  ): Promise<StatCardsValuesResponse> {
    try {
      const response = await ApiClient.get<StatCardsValuesResponse>(
        `${this.BASE_PATH}/stat-cards-values`,
        {
          params: {
            month: String(period.month),
            year: String(period.year),
          },
        },
      );

      if (!response.success) {
        throw new Error("Failed to fetch stat cards values");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch stat cards values:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches used credits for a specific period
   */
  static async getUsedCreditsInPeriod(
    period: Period,
  ): Promise<UsedCreditsInPeriod[]> {
    try {
      const response = await ApiClient.get<UsedCreditsInPeriod[]>(
        `${this.BASE_PATH}/used-credits-in-period`,
        {
          params: {
            month: String(period.month),
            year: String(period.year),
          },
        },
      );

      if (!response.success) {
        throw new Error("Failed to fetch used credits");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch used credits:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches workflow execution stats for a specific period
   */
  static async getWorkflowExecutionStats(
    period: Period,
  ): Promise<UsedCreditsInPeriod[]> {
    try {
      const response = await ApiClient.get<UsedCreditsInPeriod[]>(
        `${this.BASE_PATH}/workflow-execution-stats`,
        {
          params: {
            month: String(period.month),
            year: String(period.year),
          },
        },
      );

      if (!response.success) {
        throw new Error("Failed to fetch workflow execution stats");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch workflow execution stats:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches dashboard statistics
   */
  static async getDashboardStatCardsValues(): Promise<StatCardsValuesResponse> {
    try {
      const response = await ApiClient.get<StatCardsValuesResponse>(
        `${this.BASE_PATH}/dashboard-stat-cards-values`,
      );

      if (!response.success) {
        throw new Error("Failed to fetch dashboard stats");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches favorited components
   */
  static async getFavoritedTableContent(): Promise<UsedCreditsInPeriod[]> {
    try {
      const response = await ApiClient.get<UsedCreditsInPeriod[]>(
        `${this.BASE_PATH}/favorited-table-content`,
      );

      if (!response.success) {
        throw new Error("Failed to fetch favorited components");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch favorited components:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
