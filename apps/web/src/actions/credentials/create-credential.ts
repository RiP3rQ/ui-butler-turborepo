"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createCredentialSchema,
  type CreateCredentialSchemaType,
} from "@/schemas/credential";
import prisma from "@/lib/prisma";
import { symmetricEncrypt } from "@/lib/helpers/symmetric-encryption";

export async function createCredentialFunction(
  form: CreateCredentialSchemaType,
) {
  try {
    const { success, data } = createCredentialSchema.safeParse(form);

    if (!success) {
      throw new Error("Invalid form data");
    }

    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Encrypt value
    const encryptedValue = symmetricEncrypt(data.value);

    const result = await prisma.credential.create({
      data: {
        userId,
        name: data.name,
        value: encryptedValue,
      },
    });

    if (!result) {
      throw new Error("Failed to create credential");
    }

    revalidatePath("/credentials");

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(errorMessage);
  }
}
