import type { UserCredentials } from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import type { CreateCredentialSchemaType } from "@/schemas/credential";
import { type DeleteCredentialRequest } from "@/actions/credentials/types";

/**
 * Service class for credentials-related API calls
 */
export class CredentialsService {
  private static readonly BASE_PATH = "/credentials";

  /**
   * Creates a new credential
   */
  static async createCredential(
    form: Readonly<CreateCredentialSchemaType>,
  ): Promise<UserCredentials> {
    try {
      const { data } = await ApiClient.post<
        CreateCredentialSchemaType,
        UserCredentials
      >(this.BASE_PATH, {
        body: form,
      });
      return data;
    } catch (error) {
      console.error("Failed to create credential:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Deletes a credential by ID
   */
  static async deleteCredential({
    id,
  }: Readonly<DeleteCredentialRequest>): Promise<UserCredentials> {
    try {
      const { data } = await ApiClient.delete<UserCredentials>(this.BASE_PATH, {
        params: { id: id.toString() },
      });
      return data;
    } catch (error) {
      console.error("Failed to delete credential:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches all user credentials
   */
  static async getUserCredentials(): Promise<UserCredentials[]> {
    try {
      const { data } = await ApiClient.get<UserCredentials[]>(this.BASE_PATH);
      return data;
    } catch (error) {
      console.error("Failed to fetch user credentials:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
