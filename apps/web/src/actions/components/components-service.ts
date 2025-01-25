import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  type CodeType,
  type Component,
  type ComponentsEndpoints,
} from "@shared/types";

/**
 * Service for handling component-related operations
 */
export class ComponentsService {
  private static readonly BASE_PATH = "/components";

  /**
   * Fetches a specific component by ID
   */
  static async getComponent(
    projectId: number,
    componentId: number,
  ): Promise<Component> {
    try {
      const response = await ApiClient.get<
        ComponentsEndpoints["getComponent"]["response"]
      >(`${this.BASE_PATH}/${String(projectId)}/${String(componentId)}`);

      if (!response.success) {
        throw new Error("Failed to fetch component");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch component:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Saves a new component
   */
  static async saveComponent(
    title: string,
    code: string,
    projectId: number,
  ): Promise<Component> {
    try {
      const response = await ApiClient.post<
        ComponentsEndpoints["saveComponent"]["body"],
        ComponentsEndpoints["saveComponent"]["response"]
      >(this.BASE_PATH, {
        body: {
          title,
          code,
          projectId,
        },
      });

      if (!response.success) {
        throw new Error("Failed to save component");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to save component:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Updates the favorite status of a component
   */
  static async toggleFavorite(
    projectId: number,
    componentId: number,
    favoriteValue: boolean,
  ): Promise<Component> {
    try {
      const response = await ApiClient.post<
        ComponentsEndpoints["favoriteComponent"]["body"],
        ComponentsEndpoints["favoriteComponent"]["response"]
      >(`${this.BASE_PATH}/favorite`, {
        body: {
          projectId,
          componentId,
          favoriteValue,
        },
      });

      if (!response.success) {
        throw new Error("Failed to update favorite status");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Updates component code
   */
  static async updateComponentCode(
    componentId: number,
    codeType: CodeType,
    content: string,
  ): Promise<Component> {
    try {
      const response = await ApiClient.patch<
        ComponentsEndpoints["updateComponentCode"]["body"],
        ComponentsEndpoints["updateComponentCode"]["response"]
      >(`${this.BASE_PATH}/${String(componentId)}/${codeType}`, {
        body: {
          content,
        },
      });

      if (!response.success) {
        throw new Error("Failed to update component code");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update component code:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Generates code for a component
   */
  static async generateCode(
    componentId: number,
    codeType: CodeType,
  ): Promise<Component> {
    try {
      const response = await ApiClient.post<
        ComponentsEndpoints["generateCode"]["body"],
        ComponentsEndpoints["generateCode"]["response"]
      >(`${this.BASE_PATH}/generate-code`, {
        body: {
          componentId,
          codeType,
        },
      });

      if (!response.success) {
        throw new Error("Failed to generate code");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to generate code:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
