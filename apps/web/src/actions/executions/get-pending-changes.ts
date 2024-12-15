"use server";

import { cookies } from "next/headers";
import { type ApproveChangesRequest } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

interface GetPendingChangesProps {
  executionId: number;
}

export async function getPendingChanges({
  executionId,
}: Readonly<GetPendingChangesProps>): Promise<ApproveChangesRequest> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/executions-executions/${String(executionId)}/pending-changes`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to run executions");
    }

    return (await res.json()) as ApproveChangesRequest;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
