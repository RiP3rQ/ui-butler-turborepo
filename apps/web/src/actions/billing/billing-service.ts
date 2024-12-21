import type { BalancePackId, UserBasicCredits } from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";

/**
 * Service class for billing-related API calls
 */
export class BillingService {
  private static readonly BASE_PATH = "/billing";

  /**
   * Fetches available credits for the current user
   */
  static async getAvailableCredits(): Promise<UserBasicCredits> {
    try {
      const { data } = await ApiClient.get<UserBasicCredits>(
        `${this.BASE_PATH}/credits`,
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch available credits:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Purchases credits using a specific pack
   */
  static async purchaseCredits(
    packId: BalancePackId,
  ): Promise<UserBasicCredits> {
    try {
      const { data } = await ApiClient.get<UserBasicCredits>(
        `${this.BASE_PATH}/purchase-pack`,
        {
          params: {
            packId: packId.toString(),
          },
        },
      );
      return data;
    } catch (error) {
      console.error("Failed to purchase credits:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Sets up a new user in the billing system
   */
  static async setupUser(): Promise<void> {
    try {
      await ApiClient.get(`${this.BASE_PATH}/user-setup`);
    } catch (error) {
      console.error("Failed to setup user:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
