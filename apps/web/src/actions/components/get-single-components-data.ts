"use server";

import { cookies } from "next/headers";
import { type SingleComponentApiResponseType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

interface GetSingleComponentsDataFunctionProps {
  projectId: string;
  componentId: string;
}

export async function getSingleComponentsDataFunction({
  projectId,
  componentId,
}: Readonly<GetSingleComponentsDataFunctionProps>): Promise<SingleComponentApiResponseType> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/components/${projectId}/${componentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch component's data");
    }

    return (await res.json()) as SingleComponentApiResponseType;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
