"use server";

import { cookies } from "next/headers";
import { type ProjectType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

export async function getUserProjects(userId?: number): Promise<ProjectType[]> {
  // TODO: DELETE THIS MOCK RETURN
  return [
    {
      id: 1,
      userId: 1,
      title: "Project 1",
      description: "Description 1",
      color: "#FF0000",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      userId: 1,
      title: "Project 2",
      description: "Description 2",
      color: "#A1DF21",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects?userId=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to create new project");
    }

    return (await res.json()) as ProjectType[];
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
