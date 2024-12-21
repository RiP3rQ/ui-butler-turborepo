import type {
  ComponentType,
  SingleComponentApiResponseType,
} from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import type { SaveComponentSchemaType } from "@/schemas/component";
import {
  type FavoriteComponentRequest,
  type GenerateCodeRequest,
  type GetSingleComponentRequest,
  type UpdateComponentCodeRequest,
} from "@/actions/components/types";

/**
 * Service class for component-related API calls
 */
export class ComponentService {
  private static readonly BASE_PATH = "/components";

  /**
   * Toggles favorite status for a component
   */
  static async favoriteComponent({
    projectId,
    componentId,
    favoriteValue,
  }: Readonly<FavoriteComponentRequest>): Promise<ComponentType> {
    try {
      const { data } = await ApiClient.post<
        FavoriteComponentRequest,
        ComponentType
      >(`${this.BASE_PATH}/favorite`, {
        body: {
          projectId,
          componentId,
          favoriteValue,
        },
      });
      return data;
    } catch (error) {
      console.error("Failed to favorite component:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Generates code for a component
   */
  static async generateCode({
    componentId,
    codeType,
  }: Readonly<GenerateCodeRequest>): Promise<ComponentType> {
    try {
      const { data } = await ApiClient.post<GenerateCodeRequest, ComponentType>(
        `${this.BASE_PATH}/generate-code`,
        {
          body: {
            componentId,
            codeType,
          },
        },
      );
      return data;
    } catch (error) {
      console.error(`Failed to generate ${codeType}:`, error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches single component data
   */
  static async getSingleComponent({
    projectId,
    componentId,
  }: Readonly<GetSingleComponentRequest>): Promise<SingleComponentApiResponseType> {
    try {
      const { data } = await ApiClient.get<SingleComponentApiResponseType>(
        `${this.BASE_PATH}/${projectId}/${componentId}`,
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch component data:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Saves a new component
   */
  static async saveComponent(
    form: Readonly<SaveComponentSchemaType>,
  ): Promise<ComponentType> {
    try {
      const { data } = await ApiClient.post<
        SaveComponentSchemaType,
        ComponentType
      >(this.BASE_PATH, {
        body: form,
      });
      return data;
    } catch (error) {
      console.error("Failed to save component:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Updates component code
   */
  static async updateCode({
    componentId,
    codeType,
    content,
  }: Readonly<UpdateComponentCodeRequest>): Promise<ComponentType> {
    try {
      const { data } = await ApiClient.patch<
        { content: string },
        ComponentType
      >(`${this.BASE_PATH}/${String(componentId)}/${codeType}`, {
        body: { content },
      });
      return data;
    } catch (error) {
      console.error(`Failed to update ${codeType}:`, error);
      throw new Error(getErrorMessage(error));
    }
  }
}
