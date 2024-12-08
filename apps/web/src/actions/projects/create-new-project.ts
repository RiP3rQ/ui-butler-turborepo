"use server";

import { cookies } from "next/headers";
import { type ProjectType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";
import { type CreateNewProjectSchemaType } from "@/schemas/project";

export async function createNewProjectFunction(
  form: CreateNewProjectSchemaType,
): Promise<ProjectType> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // Include cookies in the request
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error("Failed to create new project");
    }

    return (await res.json()) as ProjectType;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
