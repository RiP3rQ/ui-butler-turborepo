"use server";

import { cookies } from "next/headers";
import type { WorkflowExecutionWithPhases } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

export async function getWorkflowExecutionWithPhasesDetailsFunction({
  executionId,
}: {
  executionId: number;
}): Promise<WorkflowExecutionWithPhases> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows/executions?executionId=${String(executionId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );

    if (!res.ok) {
      throw new Error("Workflows not found");
    }

    return (await res.json()) as WorkflowExecutionWithPhases;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
