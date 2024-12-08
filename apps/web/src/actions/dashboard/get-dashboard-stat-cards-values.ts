"use server";

import { type DashboardStatCardsValuesResponse } from "@repo/types";
import { cookies } from "next/headers";
import { getErrorMessage } from "@/lib/get-error-message";

export async function getDashboardStatCardsValues(): Promise<DashboardStatCardsValuesResponse> {
  // TODO: DELETE THIS MOCKED RESPONSE
  return {
    currentActiveProjects: 10,
    numberOfCreatedComponents: 90,
    favoritesComponents: 5,
  };

  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stat-cards-values`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );

    if (!res.ok) {
      throw new Error("Stat cards values not found");
    }

    return (await res.json()) as DashboardStatCardsValuesResponse;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
