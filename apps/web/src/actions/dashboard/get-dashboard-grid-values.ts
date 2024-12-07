"use server";

import { cookies } from "next/headers";
import { type DashboardGridValuesResponse } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

export async function getDashboardGridValues(): Promise<
  DashboardGridValuesResponse[]
> {
  // TODO: DELETE THIS MOCKED RESPONSE
  return [
    {
      iconId: 1,
      name: "Project 1",
      color: "#FF0000",
      numberOfComponents: 10,
    },
    {
      iconId: 2,
      name: "Project 2",
      color: "#00FF00",
      numberOfComponents: 20,
    },
    {
      iconId: 3,
      name: "Project 3",
      color: "#0000FF",
      numberOfComponents: 30,
    },
    {
      iconId: 4,
      name: "Project 4",
      color: "#FFFF00",
      numberOfComponents: 40,
    },
    {
      iconId: 5,
      name: "Project 5",
      color: "#00FFFF",
      numberOfComponents: 50,
    },
    {
      iconId: 6,
      name: "Project 6",
      color: "#FF00FF",
      numberOfComponents: 60,
    },
    {
      iconId: 7,
      name: "Project 7",
      color: "#FFFFFF",
      numberOfComponents: 70,
    },
    {
      iconId: 8,
      name: "Project 8",
      color: "#000000",
      numberOfComponents: 80,
    },
    {
      iconId: 9,
      name: "Project 9",
      color: "#ff0000",
      numberOfComponents: 90,
    },
    {
      iconId: 10,
      name: "Project 10",
      color: "#50d71e",
      numberOfComponents: 100,
    },
  ];
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/all-projects`,
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

    return (await res.json()) as DashboardGridValuesResponse[];
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
