import type { BasicUser } from "@repo/types";
import { ApiClient } from "@/lib/api-client";

/**
 * Service class for user-related API calls
 */
export class UserService {
  private static readonly BASE_PATH = "/users";

  /**
   * Fetches current user's basic information
   */
  static async getCurrentUser(): Promise<BasicUser> {
    try {
      const { data } = await ApiClient.get<BasicUser>(
        `${this.BASE_PATH}/current-basic`,
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      throw new Error("Failed to fetch user information");
    }
  }

  /**
   * Validates if user session is active
   */
  static async validateSession(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      throw new Error("User session is not active");
    }
  }
}
