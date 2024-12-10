"use server";

import { cookies } from "next/headers";
import { type ProjectDetailsType } from "@repo/types";
import { getErrorMessage } from "@/lib/get-error-message";

interface GetProjectDetailsFunctionProps {
  projectId: string;
}

export async function getProjectsDetailsFunction({
  projectId,
}: Readonly<GetProjectDetailsFunctionProps>): Promise<ProjectDetailsType> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${encodeURIComponent(projectId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to get project details");
    }

    return (await res.json()) as ProjectDetailsType;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
