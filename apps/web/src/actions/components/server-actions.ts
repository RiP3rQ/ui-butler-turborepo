"use server";

import {
  type SaveComponentSchemaType,
  validateComponentInput,
} from "@/schemas/component";
import {
  type FavoriteComponentRequest,
  type GenerateCodeRequest,
  type GetSingleComponentRequest,
  type UpdateComponentCodeRequest,
} from "@/actions/components/types";
import { ComponentService } from "@/actions/components/components-service";

export async function favoriteComponentFunction(
  request: Readonly<FavoriteComponentRequest>,
) {
  return ComponentService.favoriteComponent(request);
}

export async function generateCodeFunction(
  request: Readonly<GenerateCodeRequest>,
) {
  return ComponentService.generateCode(request);
}

export async function getSingleComponentsDataFunction(
  request: Readonly<GetSingleComponentRequest>,
) {
  return ComponentService.getSingleComponent(request);
}

export async function saveComponentFunction(
  form: Readonly<SaveComponentSchemaType>,
) {
  // Validate the form data before saving
  const validatedForm = await validateComponentInput(form);
  return ComponentService.saveComponent(validatedForm);
}

export async function updateComponentCode(
  request: Readonly<UpdateComponentCodeRequest>,
) {
  return ComponentService.updateCode(request);
}
