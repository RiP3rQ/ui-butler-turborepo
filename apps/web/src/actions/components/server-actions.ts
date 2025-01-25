"use server";

import { type Component, type ComponentsEndpoints } from "@shared/types";
import {
  type SaveComponentSchemaType,
  validateComponentInput,
} from "@/schemas/component";
import { ComponentsService } from "@/actions/components/components-service";

export async function favoriteComponentFunction(
  request: Readonly<ComponentsEndpoints["favoriteComponent"]["request"]>,
): Promise<Component> {
  return ComponentsService.toggleFavorite(
    request.projectId,
    request.componentId,
    request.favoriteValue,
  );
}

export async function generateCodeFunction(
  request: Readonly<ComponentsEndpoints["generateCode"]["request"]>,
): Promise<Component> {
  return ComponentsService.generateCode(request.componentId, request.codeType);
}

export async function getSingleComponentsDataFunction(
  request: Readonly<ComponentsEndpoints["getComponent"]["request"]>,
): Promise<Component> {
  return ComponentsService.getComponent(
    Number(request.projectId),
    Number(request.componentId),
  );
}

export async function saveComponentFunction(
  form: Readonly<SaveComponentSchemaType>,
): Promise<Component> {
  // Validate the form data before saving
  const validatedForm = await validateComponentInput(form);
  return ComponentsService.saveComponent(
    validatedForm.title,
    validatedForm.code,
    Number(validatedForm.projectId),
  );
}

export async function updateComponentCode(
  request: Readonly<
    ComponentsEndpoints["updateComponentCode"]["params"] &
      ComponentsEndpoints["updateComponentCode"]["body"]
  >,
): Promise<Component> {
  return ComponentsService.updateComponentCode(
    request.componentId,
    request.codeType,
    request.content,
  );
}
