import {
  type Credential,
  type CredentialsEndpoints,
  type RevealedCredential,
} from "@shared/types";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import type { CreateCredentialSchemaType } from "@/schemas/credential";

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
  ): Promise<Credential> {
    try {
      const response = await ApiClient.post<
        CredentialsEndpoints["createCredential"]["body"],
        CredentialsEndpoints["createCredential"]["response"]
      >(this.BASE_PATH, {
        body: form,
      });

      if (!response.success) {
        throw new Error("Failed to create credential");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create credential:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Deletes a credential by ID
   */
  static async deleteCredential(
    request: Readonly<CredentialsEndpoints["deleteCredential"]["request"]>,
  ): Promise<Credential> {
    try {
      const response = await ApiClient.delete<
        CredentialsEndpoints["deleteCredential"]["response"]
      >(this.BASE_PATH, {
        params: { id: String(request.id) },
      });

      if (!response.success) {
        throw new Error("Failed to delete credential");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to delete credential:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches all user credentials
   */
  static async getUserCredentials(): Promise<Credential[]> {
    try {
      const response = await ApiClient.get<
        CredentialsEndpoints["getUserCredentials"]["response"]
      >(this.BASE_PATH);

      if (!response.success) {
        throw new Error("Failed to fetch user credentials");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch user credentials:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches the revealed value of a credential
   */
  static async getRevealedCredentialValue(
    credentialId: number,
  ): Promise<RevealedCredential> {
    try {
      const response = await ApiClient.get<
        CredentialsEndpoints["revealCredential"]["response"]
      >(`${this.BASE_PATH}/${String(credentialId)}/reveal`);

      if (!response.success) {
        throw new Error("Failed to fetch revealed credential value");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch revealed credential value:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
