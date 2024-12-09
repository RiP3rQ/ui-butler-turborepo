"use server";

import { cookies } from "next/headers";
import { getErrorMessage } from "@/lib/get-error-message";

export async function runWorkflow(form: {
  workflowId: number;
  flowDefinition?: string;
}): Promise<{
  url: string;
}> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows/run-workflow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
        body: JSON.stringify(form),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to run executions");
    }

    return (await res.json()) as { url: string };
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
