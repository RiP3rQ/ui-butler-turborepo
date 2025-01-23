import {
  type BillingEndpoints,
  type UserCredits,
} from "@repo/types/src/api-client/billing-endpoints";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";

/**
 * Service for handling billing-related operations
 */
export class BillingService {
  private static readonly BASE_PATH = "/billing";

  /**
   * Fetches available credits for the current user
   */
  static async getAvailableCredits(): Promise<UserCredits> {
    try {
      const response = await ApiClient.get<
        BillingEndpoints["credits"]["response"]
      >(`${this.BASE_PATH}/credits`);

      if (!response.success) {
        throw new Error("Failed to fetch available credits");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch available credits:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Purchase credits using a specific balance pack
   */
  static async purchaseCredits(
    packId: BillingEndpoints["purchase"]["query"]["packId"],
  ): Promise<UserCredits> {
    try {
      const response = await ApiClient.get<
        BillingEndpoints["purchase"]["response"]
      >(`${this.BASE_PATH}/purchase`, {
        params: { packId },
      });

      if (!response.success) {
        throw new Error("Failed to purchase credits");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to purchase credits:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Sets up a new user in the billing system
   */
  static async setupUser(): Promise<BillingEndpoints["setup"]["response"]> {
    try {
      const response = await ApiClient.get<
        BillingEndpoints["setup"]["response"]
      >(`${this.BASE_PATH}/setup`);

      if (!response.success) {
        throw new Error("Failed to setup user");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to setup user:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
