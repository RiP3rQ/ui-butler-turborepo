"use server";

import { cookies } from 'next/headers';
import type { BasicUser } from '@repo/types/users.ts';
import { getErrorMessage } from '@/lib/get-error-message.ts';

export default async function getCurrentUser(): Promise<BasicUser> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/current-basic`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );
    if (!res.ok) {
      throw new Error("User not found");
    }

    return (await res.json()) as BasicUser;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}
