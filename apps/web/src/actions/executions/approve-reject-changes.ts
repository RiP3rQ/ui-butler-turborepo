"use server";

import { cookies } from "next/headers";
import { getErrorMessage } from "@/lib/get-error-message";

interface ApprovePendingChangesProps {
  executionId: number;
  decision: "approve" | "reject";
}

export async function approvePendingChanges({
  executionId,
  decision,
}: Readonly<ApprovePendingChangesProps>): Promise<void> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/executions-executions/${String(executionId)}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
        body: JSON.stringify({ decision }),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to approve changes");
    }
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
