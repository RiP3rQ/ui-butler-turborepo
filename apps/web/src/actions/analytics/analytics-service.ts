import {
  type Period,
  type StatCardsValuesResponse,
  type UsedCreditsInPeriodResponse,
} from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";

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
      const { data } = await ApiClient.get<Period[]>(
        `${this.BASE_PATH}/periods`,
      );
      return data;
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
      const { data } = await ApiClient.get<StatCardsValuesResponse>(
        `${this.BASE_PATH}/stat-cards-values`,
        {
          params: {
            month: period.month.toString(),
            year: period.year.toString(),
          },
        },
      );
      return data;
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
  ): Promise<UsedCreditsInPeriodResponse[]> {
    try {
      const { data } = await ApiClient.get<UsedCreditsInPeriodResponse[]>(
        `${this.BASE_PATH}/used-credits-in-period`,
        {
          params: {
            month: period.month.toString(),
            year: period.year.toString(),
          },
        },
      );
      return data;
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
  ): Promise<UsedCreditsInPeriodResponse[]> {
    try {
      const { data } = await ApiClient.get<UsedCreditsInPeriodResponse[]>(
        `${this.BASE_PATH}/workflow-execution-stats`,
        {
          params: {
            month: period.month.toString(),
            year: period.year.toString(),
          },
        },
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch workflow execution stats:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
