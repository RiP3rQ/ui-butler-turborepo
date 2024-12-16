"use server";

import { cookies } from "next/headers";
import { type ComponentType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";
import type { SaveComponentSchemaType } from "@/schemas/component";

export async function saveComponentFunction(
  form: SaveComponentSchemaType,
): Promise<ComponentType> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/components`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // Include cookies in the request
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error("Failed to save component");
    }

    return (await res.json()) as ComponentType;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
